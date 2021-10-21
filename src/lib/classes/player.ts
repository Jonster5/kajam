import { Stage, Texture } from '@api/material';
import { Sprite } from '@api/sprite';
import { Vec2 } from '@api/vec2';
import { Breadcrumb, Pistol, SMG, Sniper } from '@classes/weapons';
import type { ParsedAssets, ParsedCharacterItem } from '@data/assetTypes';
import type { Block } from '@data/types';
import { writable, Writable } from 'svelte/store';

export class Player {
	sprite: Sprite<Texture>;
	arm: Sprite<Texture>;

	rTexture: Texture;
	lTexture: Texture;
	mPos: Vec2;

	currentCheckpoint: Block;

	right: boolean;
	left: boolean;
	up: boolean;
	down: boolean;

	speed: number;

	health: Writable<number>;

	canGrunt: boolean;

	weapon: SMG | Sniper | Pistol | Breadcrumb;

	gear: Writable<Array<SMG | Sniper | Pistol | Breadcrumb>>;

	constructor(
		element: HTMLElement,
		assets: ParsedAssets,
		character: ParsedCharacterItem,
		stage: Sprite<Stage>,
		spawn: Block
	) {
		this.rTexture = new Texture({ frames: character.right });
		this.lTexture = new Texture({ frames: character.left });

		this.sprite = new Sprite(this.rTexture, character.size.clone(), spawn.sprite.position);
		this.arm = new Sprite(null, new Vec2(40, 20), new Vec2(-2, 4));

		this.sprite.add(this.arm);

		stage.add(this.sprite);

		this.right = false;
		this.left = false;
		this.up = false;
		this.down = false;

		this.canGrunt = true;
		this.health = writable(character.health);
		this.gear = writable([]);
		this.speed = character.speed;
		this.mPos = new Vec2(0, 0);

		this.pickupWeapon(new Pistol(this, character.arm, assets));

		window.addEventListener('mousemove', (e) => {
			this.mPos.set(
				e.screenX - window.innerWidth / 2,
				e.screenY - window.innerHeight / 2 - 100
			);
			if (this.arm.material) this.arm.rotation = -this.mPos.angle;

			if (this.mPos.x > 0) {
				this.sprite.material = this.rTexture;
				this.sprite.material.goto(0);
				if (this.arm.material) this.arm.material.goto(1);
				this.arm.position.x = -2;
			} else {
				this.sprite.material = this.lTexture;
				this.sprite.material.goto(0);
				if (this.arm.material) this.arm.material.goto(0);
				this.arm.position.x = 2;
			}
		});

		window.addEventListener('mousedown', (e) => {
			if (this.weapon) this.weapon.startFiring(stage, this.position, this.mPos);
		});

		window.addEventListener('mouseup', (e) => {
			if (this.weapon) this.weapon.stopFiring();
		});

		window.addEventListener('keydown', (e) => {
			switch (e.key) {
				case 'w':
				case 'ArrowUp':
					this.up = true;
					break;

				case 's':
				case 'ArrowDown':
					this.down = true;
					break;

				case 'a':
				case 'ArrowLeft':
					this.left = true;
					break;

				case 'd':
				case 'ArrowRight':
					this.right = true;
					break;
			}
		});

		window.addEventListener('keyup', (e) => {
			switch (e.key) {
				case 'w':
				case 'ArrowUp':
					this.up = false;
					break;

				case 's':
				case 'ArrowDown':
					this.down = false;
					break;

				case 'a':
				case 'ArrowLeft':
					this.left = false;
					break;

				case 'd':
				case 'ArrowRight':
					this.right = false;
					break;
			}
		});
	}

	pickupWeapon(weapon: Pistol | SMG | Sniper | Breadcrumb) {
		this.weapon = weapon;

		this.gear.update((g) => [...g, weapon]);
	}

	update() {
		const delta = new Vec2(0, 0);

		if (this.left) delta.x -= (3 * this.speed) / 4;
		if (this.right) delta.x += (3 * this.speed) / 4;
		if (this.up) delta.y += (3 * this.speed) / 4;
		if (this.down) delta.y -= (3 * this.speed) / 4;

		this.velocity.add(delta);

		this.velocity.multiply(0.6);

		if (this.velocity.magnitude > this.speed) {
			this.velocity.normalize().multiply(this.speed);
		}

		if (this.velocity.magnitude > 0.5) this.sprite.material.start(100);
		else {
			this.sprite.material.stop();
			this.sprite.material.goto(0);
		}

		this.position.add(this.velocity);

		if (this.weapon) this.weapon.update();
	}

	get position(): Vec2 {
		return this.sprite.position;
	}

	get velocity(): Vec2 {
		return this.sprite.velocity;
	}
}

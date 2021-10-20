import { Stage, Texture } from '@api/material';
import { Sprite } from '@api/sprite';
import { Vec2 } from '@api/vec2';
import type { Pistol, SMG, Sniper } from '@classes/weapons';
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

	weapon: SMG | Sniper | Pistol;

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
		this.arm = new Sprite(new Texture({ frames: [character.arm] }), new Vec2(32, 8));

		this.sprite.add(this.arm);

		stage.add(this.sprite);

		this.right = false;
		this.left = false;
		this.up = false;
		this.down = false;

		this.health = writable(character.health);
		this.speed = character.speed;

		this.mPos = new Vec2(0, 0);

		this.weapon = undefined;

		window.addEventListener('mousemove', (e) => {
			this.mPos.set(
				e.screenX - window.innerWidth / 2,
				e.screenY - window.innerHeight / 2 - 100
			);
			this.arm.rotation = -this.mPos.angle;

			if (this.mPos.x < 0) {
				this.sprite.material = this.rTexture;
				if (this.weapon) {
					this.weapon.sprite.material.goto(1);
					this.weapon.sprite.rotation = Math.PI;
					this.weapon.sprite.position.y = -3;
				}
			} else {
				this.sprite.material = this.lTexture;
				this.weapon.sprite.material.goto(0);
				this.weapon.sprite.rotation = 0;
				this.weapon.sprite.position.y = 3;
			}
		});

		window.addEventListener('mousedown', (e) => {
			if (this.weapon && (this.weapon.name === 'Pistol' || this.weapon.name === 'Sniper')) {
				this.weapon.fire(
					stage,
					new Vec2(
						25 * Math.cos(-this.mPos.angle) + this.position.x,
						25 * Math.sin(-this.mPos.angle) + this.position.y
					),
					this.mPos
				);
			} else if (this.weapon.name === 'SMG') {
				this.weapon.startFiring(stage);
			}
		});

		window.addEventListener('mouseup', (e) => {
			if (this.weapon) this.weapon.stopFiring();
		});

		window.addEventListener('keydown', (e) => {
			switch (e.key) {
				case 'w':
				case 'ArrowUp':
					this.up = true;
					this.sprite.material.start(100);
					break;

				case 's':
				case 'ArrowDown':
					this.down = true;
					this.sprite.material.start(100);
					break;

				case 'a':
				case 'ArrowLeft':
					this.left = true;
					this.sprite.material.start(100);
					break;

				case 'd':
				case 'ArrowRight':
					this.right = true;
					this.sprite.material.start(100);
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

	pickupWeapon(weapon: Pistol | SMG | Sniper) {
		if (this.weapon) this.arm.remove(this.weapon.sprite);

		this.weapon = weapon;

		this.arm.add(this.weapon.sprite);
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

		if (this.velocity.magnitude < 0.5) {
			this.sprite.material.stop();
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

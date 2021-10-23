import { Stage, Texture } from '@api/material';
import { Sprite } from '@api/sprite';
import { Vec2 } from '@api/vec2';
import { Breadcrumb, Pistol, SMG, Sniper } from '@classes/weapons';
import type { ParsedAssets, ParsedAudioItem, ParsedCharacterItem } from '@data/assetTypes';
import type { Block } from '@data/types';
import { writable, Writable } from 'svelte/store';

export class Player {
	sprite: Sprite<Texture>;
	arm: Sprite<Texture>;

	rTexture: Texture;
	lTexture: Texture;
	mPos: Vec2;

	currentCheckpoint: Block;

	pause: boolean;

	right: boolean;
	left: boolean;
	up: boolean;
	down: boolean;

	speed: number;
	character: ParsedCharacterItem;
	health: Writable<number>;

	canGrunt: boolean;

	weapon: SMG | Sniper | Pistol | Breadcrumb;

	gear: Writable<[Breadcrumb, Pistol, SMG, Sniper]>;
	uGear: () => void;

	pg: [Breadcrumb, Pistol, SMG, Sniper];

	walking: boolean;
	step: ParsedAudioItem;
	stepInterval: NodeJS.Timeout;

	onMouseMove: (e) => void;
	onMouseDown: (e) => void;
	onMouseUp: (e) => void;
	onKeyDown: (e) => void;
	onKeyUp: (e) => void;

	constructor(
		element: HTMLElement,
		assets: ParsedAssets,
		character: ParsedCharacterItem,
		stage: Sprite<Stage>,
		spawn: Block
	) {
		this.rTexture = new Texture({ frames: character.right });
		this.lTexture = new Texture({ frames: character.left });

		this.character = character;

		this.sprite = new Sprite(this.rTexture, character.size.clone(), spawn.sprite.position);
		this.arm = new Sprite(null, new Vec2(40, 20), new Vec2(-2, 4));

		this.sprite.add(this.arm);

		stage.add(this.sprite);

		this.pause = false;

		this.right = false;
		this.left = false;
		this.up = false;
		this.down = false;
		this.walking = false;

		this.canGrunt = true;
		this.health = writable(character.health);
		this.gear = writable([undefined, undefined, undefined, undefined]);
		this.speed = character.speed;
		this.mPos = new Vec2(0, 0);

		this.uGear = this.gear.subscribe((g) => (this.pg = g));

		this.step = assets.sounds.find((s) => s.name === 'step');

		this.stepInterval = null;

		this.pickupWeapon(
			new Breadcrumb(
				this,
				[
					assets.images.find((i) => i.name === 'breadcrumb_right').image,
					assets.images.find((i) => i.name === 'breadcrumb_left').image,
				],
				assets
			)
		);

		this.onMouseMove = (e) => {
			if (this.pause) return;
			this.mPos.set(
				e.screenX - window.innerWidth / 2,
				e.screenY - window.innerHeight / 2 - 100
			);
			if (this.arm.material) this.arm.rotation = -this.mPos.angle;

			if (this.mPos.x > 0) {
				this.sprite.material = this.rTexture;
				this.sprite.material.goto(this.lTexture.frames.indexOf(this.lTexture.currentFrame));
				if (this.arm.material) this.arm.material.goto(1);
				this.arm.position.x = -2;
			} else {
				this.sprite.material = this.lTexture;
				this.sprite.material.goto(this.rTexture.frames.indexOf(this.rTexture.currentFrame));
				if (this.arm.material) this.arm.material.goto(0);
				this.arm.position.x = 2;
			}
		};

		this.onMouseDown = (e) => {
			if (this.pause) return;
			if (this.weapon) this.weapon.startFiring(stage, this.position, this.mPos);
		};

		this.onMouseUp = (e) => {
			if (this.pause) return;
			if (this.weapon)
				this.pg.forEach((w) => {
					if (w) w.stopFiring();
				});
		};

		this.onKeyDown = (e) => {
			if (this.pause) return;
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

				case '1':
					if (this.pg[0]) this.switchTo(this.pg[0]);
					break;
				case '2':
					if (this.pg[1]) this.switchTo(this.pg[1]);
					break;
				case '3':
					if (this.pg[2]) this.switchTo(this.pg[2]);
					break;
			}
		};

		this.onKeyUp = (e) => {
			if (this.pause) return;
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
		};

		window.addEventListener('mousemove', this.onMouseMove);
		window.addEventListener('mousedown', this.onMouseDown);
		window.addEventListener('mouseup', this.onMouseUp);
		window.addEventListener('keydown', this.onKeyDown);
		window.addEventListener('keyup', this.onKeyUp);
	}

	pickupWeapon(weapon: Pistol | SMG | Sniper | Breadcrumb) {
		if (weapon.name === 'Pistol') {
			this.gear.update((g) => {
				g[1] = weapon;
				return g;
			});
		} else if (weapon.name === 'SMG') {
			this.gear.update((g) => {
				g[2] = weapon;
				return g;
			});
		} else if (weapon.name === 'Sniper') {
			this.gear.update((g) => {
				g[3] = weapon;
				return g;
			});
		} else if (weapon.name === 'Breadcrumb') {
			this.gear.update((g) => {
				g[0] = weapon;
				return g;
			});
		}

		this.weapon = weapon;

		if (this.mPos.x > 0) {
			this.sprite.material = this.rTexture;
			this.sprite.material.goto(this.lTexture.frames.indexOf(this.lTexture.currentFrame));
			if (this.arm.material) this.arm.material.goto(1);
			this.arm.position.x = -2;
		} else {
			this.sprite.material = this.lTexture;
			this.sprite.material.goto(this.rTexture.frames.indexOf(this.rTexture.currentFrame));
			if (this.arm.material) this.arm.material.goto(0);
			this.arm.position.x = 2;
		}
	}

	switchTo(weapon: Pistol | SMG | Sniper | Breadcrumb) {
		this.weapon = weapon;

		this.arm.material = this.weapon.texture;

		if (this.mPos.x > 0) {
			this.sprite.material = this.rTexture;
			this.sprite.material.goto(this.lTexture.frames.indexOf(this.lTexture.currentFrame));
			if (this.arm.material) this.arm.material.goto(1);
			this.arm.position.x = -2;
		} else {
			this.sprite.material = this.lTexture;
			this.sprite.material.goto(this.rTexture.frames.indexOf(this.rTexture.currentFrame));
			if (this.arm.material) this.arm.material.goto(0);
			this.arm.position.x = 2;
		}
	}

	update() {
		const delta = new Vec2(0, 0);

		if (this.left) delta.x -= (3 * this.speed) / 4;
		if (this.right) delta.x += (3 * this.speed) / 4;
		if (this.up) delta.y += (3 * this.speed) / 4;
		if (this.down) delta.y -= (3 * this.speed) / 4;

		this.velocity.add(delta);

		this.velocity.multiply(0.6);

		if (this.pause) this.velocity.set(0);

		if (this.velocity.magnitude > this.speed) {
			this.velocity.normalize().multiply(this.speed);
		}

		if (this.velocity.magnitude < 0.5) {
			this.rTexture.stop();
			this.lTexture.stop();
			this.rTexture.goto(0);
			this.lTexture.goto(0);
			this.walking = false;
			clearInterval(this.stepInterval);
			this.step.audio.pause();
		} else {
			this.sprite.material.start(100);
			if (!this.walking) {
				this.stepInterval = setInterval(() => {
					this.step.audio.restart();
				}, 200);
				this.walking = true;
			}
		}

		this.position.add(this.velocity);

		if (this.pg[1]) this.pg[1].update();
		if (this.pg[2]) this.pg[2].update();
		if (this.pg[3]) this.pg[3].update();
	}

	kill() {
		window.removeEventListener('mousemove', this.onMouseMove);
		window.removeEventListener('mousedown', this.onMouseDown);
		window.removeEventListener('mouseup', this.onMouseUp);
		window.removeEventListener('keydown', this.onKeyDown);
		window.removeEventListener('keyup', this.onKeyUp);
	}

	get position(): Vec2 {
		return this.sprite.position;
	}

	get velocity(): Vec2 {
		return this.sprite.velocity;
	}
}

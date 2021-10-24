import { Stage, Texture } from '@api/material';
import { settings } from '@api/settings';
import { Sprite } from '@api/sprite';
import { Vec2 } from '@api/vec2';
import { Breadcrumb, Pistol, SMG, Sniper } from '@classes/weapons';
import type Settings__SvelteComponent_ from '@comp/settings/Settings.svelte';
import type { ParsedAssets, ParsedAudioItem, ParsedCharacterItem } from '@data/assetTypes';
import type { Block, Settings } from '@data/types';
import { writable, Writable } from 'svelte/store';

export class Player {
	sprite: Sprite<Texture>;
	arm: Sprite<Texture>;

	rTexture: Texture;
	lTexture: Texture;
	mPos: Vec2;
	kPos: Vec2;

	currentCheckpoint: Block;

	pause: boolean;

	right: boolean;
	left: boolean;
	up: boolean;
	down: boolean;

	arrowRight: boolean;
	arrowLeft: boolean;
	arrowUp: boolean;
	arrowDown: boolean;

	speed: number;
	character: ParsedCharacterItem;
	health: Writable<number>;

	currentWeapon: Writable<string>;

	canGrunt: boolean;

	weapon: SMG | Sniper | Pistol | Breadcrumb;

	gear: Writable<[Breadcrumb, Pistol, SMG, Sniper]>;
	uGear: () => void;

	pg: [Breadcrumb, Pistol, SMG, Sniper];

	walking: boolean;
	step: ParsedAudioItem;
	stepInterval: NodeJS.Timeout;

	shooting: boolean;

	settingsUnsub: () => void;
	settings: Settings;

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

		this.settingsUnsub = settings.subscribe((s) => (this.settings = s));
		settings.update((s) => {
			this.settings = s;
			return s;
		});

		this.right = false;
		this.left = false;
		this.up = false;
		this.down = false;
		this.walking = false;

		this.arrowRight = false;

		this.shooting = false;

		this.canGrunt = true;
		this.health = writable(character.health);
		this.gear = writable([undefined, undefined, undefined, undefined]);
		this.speed = character.speed;
		this.mPos = new Vec2(0, 0);
		this.kPos = new Vec2(50, 0);

		this.currentWeapon = writable('Breadcrumb');
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

		this.setArmAngle(this.mPos);

		this.onMouseMove = (e) => {
			if (this.settings.keyboardMode) return;
			if (this.pause) return;
			this.mPos.set(
				e.screenX - window.innerWidth / 2,
				e.screenY - window.innerHeight / 2 - 100
			);

			this.setArmAngle(this.mPos);
		};

		this.onMouseDown = (e) => {
			if (this.settings.keyboardMode) return;
			if (this.pause) return;
			if (this.weapon) this.weapon.startFiring(stage, this.position, this.mPos);
		};

		this.onMouseUp = (e) => {
			if (this.settings.keyboardMode) return;
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
					this.up = true;
					break;

				case 's':
					this.down = true;
					break;

				case 'a':
					this.left = true;
					break;

				case 'd':
					this.right = true;
					break;

				case 'ArrowRight':
					this.arrowRight = true;
					break;
				case 'ArrowLeft':
					this.arrowLeft = true;
					break;
				case 'ArrowUp':
					this.arrowUp = true;
					break;
				case 'ArrowDown':
					this.arrowDown = true;
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
				case ' ':
					if (this.settings.keyboardMode && this.weapon && !this.shooting) {
						this.weapon.startFiring(stage, this.position, this.kPos);
						this.shooting = true;
					}
					break;
			}
		};

		this.onKeyUp = (e) => {
			if (this.pause) return;
			switch (e.key) {
				case 'w':
					this.up = false;
					break;
				case 'ArrowUp':
					this.arrowUp = false;
					break;

				case 's':
					this.down = false;
					break;
				case 'ArrowDown':
					this.arrowDown = false;
					break;

				case 'a':
					this.left = false;
					break;
				case 'ArrowLeft':
					this.arrowLeft = false;
					break;

				case 'd':
					this.right = false;
					break;
				case 'ArrowRight':
					this.arrowRight = false;
					break;

				case ' ':
					if (this.settings.keyboardMode) {
						this.pg.forEach((w) => {
							if (w) w.stopFiring();
						});
						this.shooting = false;
					}
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
			this.currentWeapon.set('Pistol');
			this.gear.update((g) => {
				g[1] = weapon;
				return g;
			});
		} else if (weapon.name === 'SMG') {
			this.currentWeapon.set('SMG');

			this.gear.update((g) => {
				g[2] = weapon;
				return g;
			});
		} else if (weapon.name === 'Sniper') {
			this.currentWeapon.set('Sniper');

			this.gear.update((g) => {
				g[3] = weapon;
				return g;
			});
		} else if (weapon.name === 'Breadcrumb') {
			this.currentWeapon.set('Breadcrumb');

			this.gear.update((g) => {
				g[0] = weapon;
				return g;
			});
		}

		this.weapon = weapon;
	}

	setArmAngle(pos: Vec2) {
		if (this.arm.material) this.arm.rotation = -pos.angle;

		if (pos.x > 0) {
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

		this.currentWeapon.set(this.weapon.name);

		if (this.settings.keyboardMode) this.setArmAngle(this.kPos);
		else this.setArmAngle(this.mPos);
	}

	update() {
		if (this.settings.keyboardMode) {
			if (this.arrowRight) {
				this.kPos.x = 50;
				this.kPos.y = 0;
			}

			if (this.arrowLeft) {
				this.kPos.x = -50;
				this.kPos.y = 0;
			}

			if (this.arrowUp) {
				this.kPos.y = -50;
				this.kPos.x = 0;
			}

			if (this.arrowDown) {
				this.kPos.y = 50;
				this.kPos.x = 0;
			}

			this.setArmAngle(this.kPos);
		}

		const delta = new Vec2(0, 0);

		if (this.left) delta.x -= (3 * this.speed) / 4;
		if (this.right) delta.x += (3 * this.speed) / 4;
		if (this.up) delta.y += (3 * this.speed) / 4;
		if (this.down) delta.y -= (3 * this.speed) / 4;

		this.velocity.add(delta);

		this.velocity.multiply(0.6);

		if (this.pause) {
			this.velocity.set(0);
			this.right = false;
			this.left = false;
			this.up = false;
			this.down = false;
		}

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
			if (!this.walking) {
				this.rTexture.start(100);
				this.lTexture.start(100);

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

		clearInterval(this.stepInterval);

		this.step.audio.pause();
		this.weapon.stopFiring();
	}

	get position(): Vec2 {
		return this.sprite.position;
	}

	get velocity(): Vec2 {
		return this.sprite.velocity;
	}
}

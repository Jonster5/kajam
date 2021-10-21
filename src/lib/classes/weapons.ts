import { Texture, Stage, Rectangle } from '@api/material';
import { Sprite } from '@api/sprite';
import { Vec2 } from '@api/vec2';
import type { Player } from '@classes/player';
import type { ParsedAssets, ParsedAudioItem, ParsedImageItem } from '@data/assetTypes';
import type { Bullet } from '@data/types';
import type { WeaponProperties } from '@utils/weaponUtils';

export class Breadcrumb implements WeaponProperties {
	texture: Texture;

	fireEffect: ParsedAudioItem;
	muzzleFlash: Sprite<Texture>;

	bullets: Bullet[];
	bulletSprite: [HTMLImageElement];
	name: string;
	damage: number;
	fireInterval: NodeJS.Timeout;

	canFire: boolean;

	constructor(player: Player, img: [HTMLImageElement, HTMLImageElement], assets: ParsedAssets) {
		this.texture = new Texture({ frames: img });

		this.fireEffect = assets.sounds.find((s) => s.name === 'click');

		this.bulletSprite = [assets.images.find((i) => i.name === 'bullet').image];

		player.arm.material = this.texture;

		this.bullets = [];

		this.name = 'Breadcrumb';
		this.damage = 5;
		this.fireInterval = null;

		this.canFire = true;
	}

	update() {
		for (let b of this.bullets) {
			b.sprite.position.add(b.sprite.velocity);

			if (b.hit) {
				this.bullets.splice(this.bullets.indexOf(b), 1);
			}
		}
	}

	fire(stage: Sprite<Stage>, coords: Vec2, mPos: Vec2): void {
		const pos = new Vec2(
			15 * Math.cos(-mPos.angle) + coords.x,
			15 * Math.sin(-mPos.angle) + coords.y + 8
		);

		const sprite = new Sprite(
			new Texture({ frames: this.bulletSprite }),
			new Vec2(15, 3),
			pos.clone(),
			-mPos.angle
		);

		sprite.velocity.set(1, 1);
		sprite.velocity.angle = -mPos.angle;
		sprite.velocity.magnitude = 40;

		stage.add(sprite);

		this.bullets.push({
			damage: this.damage,
			start: pos.clone(),
			target: mPos.clone().subtract(stage.position),
			sprite,
			hit: false,
		});

		this.fireEffect.audio.restart();
	}

	startFiring(stage: Sprite<Stage>, coords: Vec2, mPos: Vec2) {
		if (!this.canFire) return;

		this.fire(stage, coords, mPos);
		this.canFire = false;

		setTimeout(() => {
			this.canFire = true;
		}, 500);
	}

	stopFiring() {}
}

export class Pistol implements WeaponProperties {
	texture: Texture;

	fireEffect: ParsedAudioItem;
	muzzleFlash: Sprite<Texture>;

	bullets: Bullet[];
	bulletSprite: [HTMLImageElement];
	name: string;
	damage: number;
	fireInterval: NodeJS.Timeout;

	canFire: boolean;

	constructor(player: Player, img: [HTMLImageElement, HTMLImageElement], assets: ParsedAssets) {
		this.texture = new Texture({ frames: img });

		this.fireEffect = assets.sounds.find((s) => s.name === 'click');

		this.bulletSprite = [assets.images.find((i) => i.name === 'bullet').image];

		player.arm.material = this.texture;

		this.bullets = [];

		this.name = 'Pistol';
		this.damage = 5;
		this.fireInterval = null;

		this.canFire = true;
	}

	update() {
		for (let b of this.bullets) {
			b.sprite.position.add(b.sprite.velocity);

			if (b.hit) {
				this.bullets.splice(this.bullets.indexOf(b), 1);
			}
		}
	}

	fire(stage: Sprite<Stage>, coords: Vec2, mPos: Vec2): void {
		const pos = new Vec2(
			15 * Math.cos(-mPos.angle) + coords.x,
			15 * Math.sin(-mPos.angle) + coords.y + 8
		);

		const sprite = new Sprite(
			new Texture({ frames: this.bulletSprite }),
			new Vec2(15, 3),
			pos.clone(),
			-mPos.angle
		);

		sprite.velocity.set(1, 1);
		sprite.velocity.angle = -mPos.angle;
		sprite.velocity.magnitude = 40;

		stage.add(sprite);

		this.bullets.push({
			damage: this.damage,
			start: pos.clone(),
			target: mPos.clone().subtract(stage.position),
			sprite,
			hit: false,
		});

		this.fireEffect.audio.restart();
	}

	startFiring(stage: Sprite<Stage>, coords: Vec2, mPos: Vec2) {
		if (!this.canFire) return;

		this.fire(stage, coords, mPos);
		this.canFire = false;

		setTimeout(() => {
			this.canFire = true;
		}, 500);
	}

	stopFiring() {}
}

export class SMG implements WeaponProperties {
	texture: Texture;
	bullets: Bullet[];
	name: string;
	damage: number;
	bulletSprite: [HTMLImageElement];

	fireInterval: NodeJS.Timeout;
	fireEffect: ParsedAudioItem;
	muzzleFlash: Sprite<Texture>;

	constructor(player: Player, img: [HTMLImageElement, HTMLImageElement], assets: ParsedAssets) {
		this.texture = new Texture({ frames: img });

		this.fireEffect = assets.sounds.find((s) => s.name === 'click');

		this.bulletSprite = [assets.images.find((i) => i.name === 'bullet').image];

		player.arm.material = this.texture;

		this.bullets = [];

		this.name = 'SMG';
		this.damage = 5;
		this.fireInterval = null;
	}
	update() {
		for (let b of this.bullets) {
			b.sprite.position.add(b.sprite.velocity);

			if (b.hit) {
				this.bullets.splice(this.bullets.indexOf(b), 1);
			}
		}
	}

	startFiring(stage: Sprite<Stage>, coords: Vec2, mPos: Vec2): void {
		this.fireInterval = setInterval(() => this.fire(stage, coords, mPos), 75);
	}

	stopFiring() {
		clearInterval(this.fireInterval);
	}

	fire(stage: Sprite<Stage>, coords: Vec2, mPos: Vec2) {
		const pos = new Vec2(
			15 * Math.cos(-mPos.angle) + coords.x,
			15 * Math.sin(-mPos.angle) + coords.y + 8
		);

		const sprite = new Sprite(
			new Texture({ frames: this.bulletSprite }),
			new Vec2(15, 3),
			pos.clone(),
			-mPos.angle
		);

		sprite.velocity.set(1, 1);
		sprite.velocity.angle = -mPos.angle;
		sprite.velocity.magnitude = 40;

		stage.add(sprite);

		this.bullets.push({
			damage: this.damage,
			start: pos,
			target: mPos.clone().subtract(stage.position),
			sprite,
			hit: false,
		});

		this.fireEffect.audio.restart();
	}
}

export class Sniper implements WeaponProperties {
	texture: Texture;
	bullets: Bullet[];
	name: string;
	damage: number;
	bulletSprite: [HTMLImageElement];

	fireInterval: NodeJS.Timeout;
	fireEffect: ParsedAudioItem;
	muzzleFlash: Sprite<Texture>;

	constructor(player: Player, img: [ParsedImageItem, ParsedImageItem]) {
		this.texture = new Texture({ frames: img.map((i) => i.image) });

		player.arm.material = this.texture;
		this.bullets = [];

		this.name = 'Sniper';
		this.damage = 5;
		this.fireInterval = null;
	}
	update() {}

	fire(stage: Sprite<Stage>): void {
		throw new Error('Method not implemented.');
	}

	startFiring() {}

	stopFiring() {}
}

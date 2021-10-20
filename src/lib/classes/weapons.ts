import { Texture, Stage, Rectangle } from '@api/material';
import { Sprite } from '@api/sprite';
import { Vec2 } from '@api/vec2';
import type { Player } from '@classes/player';
import type { ParsedAssets, ParsedImageItem } from '@data/assetTypes';
import type { Bullet } from '@data/types';
import type { WeaponProperties } from '@utils/weaponUtils';

export class Pistol implements WeaponProperties {
	sprite: Sprite<Texture>;
	bullets: Bullet[];
	bulletSprite: [HTMLImageElement];
	name: string;
	damage: number;
	fireInterval: number;

	constructor(player: Player, img: [ParsedImageItem, ParsedImageItem], assets: ParsedAssets) {
		this.sprite = new Sprite(
			new Texture({ frames: img.map((i) => i.image) }),
			new Vec2(15, 8),
			new Vec2(15, 0)
		);

		this.bulletSprite = [assets.images.find((i) => i.name === 'bullet').image];

		player.arm.add(this.sprite);

		this.bullets = [];

		this.name = 'Pistol';
		this.damage = 5;
		this.fireInterval = 5;
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
		const sprite = new Sprite(
			new Texture({ frames: this.bulletSprite }),
			new Vec2(15, 5),
			coords.clone(),
			-mPos.angle
		);

		sprite.velocity.set(1, 1);
		sprite.velocity.angle = -mPos.angle;
		sprite.velocity.magnitude = 40;

		stage.add(sprite);

		this.bullets.push({
			damage: this.damage,
			start: coords,
			target: mPos.clone().subtract(stage.position),
			sprite,
			hit: false,
		});
	}

	startFiring() {}

	stopFiring() {}
}

export class SMG implements WeaponProperties {
	sprite: Sprite<Texture>;
	bullets: Bullet[];
	name: string;
	damage: number;
	fireInterval: number;

	constructor(player: Player, img: [ParsedImageItem, ParsedImageItem]) {
		this.sprite = new Sprite(new Texture({ frames: img.map((i) => i.image) }), new Vec2(5, 15));

		player.arm.add(this.sprite);
		this.bullets = [];

		this.name = 'SMG';
		this.damage = 5;
		this.fireInterval = 5;
	}
	update() {}

	startFiring(stage: Sprite<Stage>): void {}

	stopFiring() {}

	fire() {}
}

export class Sniper implements WeaponProperties {
	sprite: Sprite<Texture>;
	bullets: Bullet[];
	name: string;
	damage: number;
	fireInterval: number;

	constructor(player: Player, img: [ParsedImageItem, ParsedImageItem]) {
		this.sprite = new Sprite(new Texture({ frames: img.map((i) => i.image) }), new Vec2(5, 15));

		player.arm.add(this.sprite);
		this.bullets = [];

		this.name = 'Sniper';
		this.damage = 5;
		this.fireInterval = 5;
	}
	update() {}

	fire(stage: Sprite<Stage>): void {
		throw new Error('Method not implemented.');
	}

	startFiring() {}

	stopFiring() {}
}

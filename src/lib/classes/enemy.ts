import { Rectangle, Stage, Texture } from '@api/material';
import { Sprite } from '@api/sprite';
import { Vec2 } from '@api/vec2';
import type { Player } from '@classes/player';
import type { ParsedAssets, ParsedCharacterItem } from '@data/assetTypes';
import type { Strength } from '@data/types';

export class Enemy {
	assets: ParsedAssets;
	stage: Sprite<Stage>;
	strength: Strength;

	sprite: Sprite<Texture>;
	lTexture: Texture;
	rTexture: Texture;

	healthbar: Sprite<Rectangle>;

	health: number;
	speed: number;
	damage: number;

	constructor(assets: ParsedAssets, stage: Sprite<Stage>, strength: Strength, coords: Vec2) {
		const character = assets.characters.find((c) => c.name === strength);

		this.assets = assets;
		this.stage = stage;

		this.rTexture = new Texture({ frames: character.right });
		this.lTexture = new Texture({ frames: character.left });

		this.sprite = new Sprite(this.rTexture, character.size.clone(), coords.clone());

		this.damage = character.damage;
		this.health = character.health;
		this.speed = character.speed;

		this.healthbar = new Sprite(
			new Rectangle({ texture: 'red' }),
			new Vec2(character.health, 5),
			new Vec2(0, 30)
		);

		this.sprite.add(this.healthbar);

		this.stage.add(this.sprite);
	}

	update(player: Player) {
		if (
			Math.abs(this.position.x - player.position.x) > 600 &&
			Math.abs(this.position.y - player.position.y) > 600
		) {
			this.velocity.set(0, 0);
		} else {
			const dif = this.position.clone().subtract(player.position);

			this.velocity.set(1, 1);
			this.velocity.angle = dif.angle + Math.PI;
			this.velocity.magnitude = this.speed;
		}

		this.sprite.position.add(this.sprite.velocity);
	}

	get position() {
		return this.sprite.position;
	}
	get velocity() {
		return this.sprite.velocity;
	}
}

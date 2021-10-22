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

	takeDamage(amount: number, enemies: Enemy[], player: Player) {
		this.health -= amount;
		this.sprite.children[0]!.size.x = this.health < 0 ? 0 : this.health;

		this.sprite.material.filter = 'brightness(3)';
		setTimeout(() => {
			this.sprite.material.filter = 'none';
		}, 100);

		if (this.health < 1) {
			this.kill(enemies, player);
		}
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

		if (this.velocity.magnitude < 0.5) {
			this.lTexture.stop();
			this.rTexture.stop();
			this.rTexture.goto(0);
			this.lTexture.goto(0);
		} else {
			this.sprite.material.start(100);
		}

		this.sprite.position.add(this.sprite.velocity);
	}

	kill(enemies: Enemy[], player: Player) {
		enemies.splice(enemies.indexOf(this), 1);

		this.sprite.rotation = Math.PI / 2;
		this.sprite.position.y -= this.sprite.halfSize.y;
		this.sprite.material.stop();

		this.stage.remove(player.sprite);
		this.stage.add(player.sprite);

		setTimeout(() => {
			this.sprite.parent.remove(this.sprite);
		}, 10000);
	}

	get position() {
		return this.sprite.position;
	}
	get velocity() {
		return this.sprite.velocity;
	}
}

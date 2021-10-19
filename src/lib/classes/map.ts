import { rectangleCollision } from '@api/collisions';
import { Pattern, Rectangle, Stage, Texture } from '@api/material';
import { Sprite } from '@api/sprite';
import { Vec2 } from '@api/vec2';
import type { Player } from '@classes/player';
import type { ParsedActItem, ParsedAssets } from '@data/assetTypes';
import type { Block, Settings } from '@data/types';
import type { GameMapObject } from '@utils/mapUtils';
import type { Writable } from 'svelte/store';

export class GameMap implements GameMapObject {
	assets: ParsedAssets;
	act: ParsedActItem;

	tctx: CanvasRenderingContext2D;

	bgSprite: Sprite<Rectangle>;
	bgMaterial: Rectangle;

	blocks: Block[];
	collidable: Block[];
	checkpoints: Block[];
	triggers: Block[];
	doors: Block[];
	finale: Block;

	constructor(assets: ParsedAssets, act: ParsedActItem, stage: Sprite<Stage>) {
		this.assets = assets;
		this.act = act;
		const c = document.createElement('canvas');
		this.tctx = c.getContext('2d');

		this.blocks = [];
		this.collidable = [];
		this.checkpoints = [];

		this.setupBackground(act, stage);
		this.setupMap(stage);
	}

	setupBackground(act: ParsedActItem, stage: Sprite): void {
		const bgPattern = Pattern(act.background, 'repeat');

		this.bgMaterial = new Rectangle({
			texture: bgPattern,
			borderColor: 'black',
			borderWidth: 5,
		});

		this.bgSprite = new Sprite(this.bgMaterial, new Vec2(act.width * 100, act.height * 100));

		stage.add(this.bgSprite);
	}

	setupMap(stage: Sprite) {
		this.act.grid.forEach((g) => {
			const { type, x, y, solid, data } = g;

			try {
				const img = this.assets.blocks.find((b) => b.type === type).image;

				const sprite = new Sprite(
					new Texture({ frames: [img] }),
					new Vec2(100, 100),
					new Vec2(x * 100, y * 100)
				);

				const block = {
					type,
					x,
					y,
					solid,
					sprite,
					data,
				};

				this.blocks.push(block);
				if (solid) this.collidable.push(block);
				if (type === 'checkpoint') this.checkpoints.push(block);

				stage.add(...this.blocks.map(({ sprite }) => sprite));
			} catch (error) {
				console.log(g);
				console.error(error);
			}
		});
	}

	update(stage: Sprite) {}

	checkCollisions(player: Player, text: Writable<string>) {
		for (let c of this.collidable) {
			if (Math.abs(player.position.x - c.x * 100) > 200) continue;
			if (Math.abs(player.position.y - c.y * 100) > 200) continue;

			const collision = rectangleCollision(
				{
					position: player.position,
					tpos: player.position.clone().subtract(player.sprite.halfSize),
					halfSize: player.sprite.halfSize,
					velocity: player.velocity,
				},
				{
					position: c.sprite.position,
					tpos: c.sprite.position.clone().subtract(c.sprite.halfSize),
					halfSize: c.sprite.halfSize,
					velocity: new Vec2(0, 0),
				},
				true,
				false
			);
		}

		let col = false;

		for (let c of this.checkpoints) {
			const collision = rectangleCollision(
				{
					position: player.position,
					tpos: player.position.clone().subtract(player.sprite.halfSize),
					halfSize: player.sprite.halfSize,
					velocity: player.velocity,
				},
				{
					position: c.sprite.position,
					tpos: c.sprite.position.clone().subtract(c.sprite.halfSize),
					halfSize: c.sprite.halfSize,
					velocity: new Vec2(0, 0),
				},
				false,
				false
			);

			if (collision) {
				col = true;
				text.update((u) => c.data.text);
				player.currentCheckpoint = c;

				break;
			}
		}

		if (!col) {
			text.update((u) => '');
		}
	}

	getSpawnCoords(): Block {
		return this.checkpoints[0];
	}

	private rand(min: number, max: number): number {
		return Math.floor(Math.random() * (max - min)) + min;
	}
}

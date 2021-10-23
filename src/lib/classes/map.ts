import { rectangleCollision } from '@api/collisions';
import { Pattern, Rectangle, Stage, Texture } from '@api/material';
import { Sprite } from '@api/sprite';
import { Vec2 } from '@api/vec2';
import type { GinormousGerry, JumboJaret, MegaMeqwid } from '@classes/boss';
import { Enemy } from '@classes/enemy';
import type { Player } from '@classes/player';
import { Pistol, SMG } from '@classes/weapons';
import type { ParsedActItem, ParsedAssets } from '@data/assetTypes';
import type { Block, Settings } from '@data/types';
import type { GameMapObject } from '@utils/mapUtils';
import type { Writable } from 'svelte/store';

export class GameMap implements GameMapObject {
	assets: ParsedAssets;
	act: ParsedActItem;

	stage: Sprite<Stage>;

	tctx: CanvasRenderingContext2D;

	bgSprite: Sprite<Rectangle>;
	bgMaterial: Rectangle;

	blocks: Block[];
	collidable: Block[];
	checkpoints: Block[];
	spawners: Block[];
	pistolPickup: Block;
	smgPickup: Block;
	finale: Block;

	jj: JumboJaret;
	gg: GinormousGerry;
	mm: MegaMeqwid;

	win: boolean;

	enemies: Enemy[];

	constructor(assets: ParsedAssets, act: ParsedActItem, stage: Sprite<Stage>) {
		this.assets = assets;
		this.stage = stage;
		this.act = act;
		const c = document.createElement('canvas');
		this.tctx = c.getContext('2d');

		this.enemies = [];
		this.blocks = [];
		this.spawners = [];
		this.collidable = [];
		this.checkpoints = [];

		this.win = false;

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
			const { type, x, y, solid, data, sprite } = g;

			try {
				const img = this.assets.blocks.find((b) => b.type === type).material;

				sprite.material = img;

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
				if (type === 'spawn') this.spawners.push(block);
				if (type === 'finale') this.finale = block;
				if (type === 'pistol_pickup') this.pistolPickup = block;
				if (type === 'smg_pickup') this.smgPickup = block;
			} catch (error) {
				console.log(g);
				console.error(error);
			}
		});

		stage.add(...this.blocks.map(({ sprite }) => sprite));
	}

	update(player: Player) {
		this.enemies.forEach((e) => e.update(player));
	}

	checkCollisions(player: Player, text: Writable<string>) {
		for (let c of this.collidable) {
			if (this.enemies.length > 0) {
				for (let e of this.enemies) {
					if (Math.abs(e.position.x - c.x * 100) > 200) continue;
					if (Math.abs(e.position.y - c.y * 100) > 200) continue;

					const collision = rectangleCollision(
						{
							position: e.position,
							tpos: e.position.clone().subtract(e.sprite.halfSize),
							halfSize: e.sprite.halfSize,
							velocity: e.velocity,
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
			}

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

		if (player.weapon) {
			for (let b of player.weapon.bullets) {
				for (let c of this.collidable) {
					if (Math.abs(b.sprite.position.x - c.x * 100) > 200) continue;
					if (Math.abs(b.sprite.position.y - c.y * 100) > 200) continue;

					const collision = rectangleCollision(
						{
							position: b.sprite.position,
							tpos: b.sprite.position.clone().subtract(10),
							halfSize: new Vec2(10, 10),
							velocity: b.sprite.velocity,
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
						try {
							this.stage.remove(b.sprite);
							b.hit = true;
						} catch {}
					}
				}

				if (this.enemies.length > 0) {
					for (let e of this.enemies) {
						if (Math.abs(b.sprite.position.x - e.position.x) > 200) continue;
						if (Math.abs(b.sprite.position.y - e.position.y) > 200) continue;

						const collision = rectangleCollision(
							{
								position: b.sprite.position,
								tpos: b.sprite.position.clone().subtract(10),
								halfSize: new Vec2(10, 10),
								velocity: b.sprite.velocity,
							},
							{
								position: e.sprite.position,
								tpos: e.sprite.position.clone().subtract(e.sprite.halfSize),
								halfSize: e.sprite.halfSize,
								velocity: new Vec2(0, 0),
							},
							false,
							false
						);

						if (collision) {
							try {
								this.stage.remove(b.sprite);
								b.hit = true;
								e.takeDamage(player.weapon.damage, this.enemies, player);
							} catch {}
						}
					}
				}
			}
		}

		if (
			this.pistolPickup &&
			!player.pg[1] &&
			Math.abs(player.position.x - this.pistolPickup.x * 100) < 200 &&
			Math.abs(player.position.y - this.pistolPickup.y * 100) < 200
		) {
			const p = this.pistolPickup;

			const collision = rectangleCollision(
				{
					position: player.position,
					tpos: player.position.clone().subtract(player.sprite.halfSize),
					halfSize: player.sprite.halfSize,
					velocity: player.velocity,
				},
				{
					position: p.sprite.position,
					tpos: p.sprite.position.clone().subtract(p.sprite.halfSize),
					halfSize: p.sprite.halfSize,
					velocity: new Vec2(0, 0),
				},
				true,
				false
			);

			if (collision) {
				player.pickupWeapon(new Pistol(player, player.character.arm, this.assets));
				p.sprite.material.goto(1);
			}
		}

		if (
			this.smgPickup &&
			!player.pg[2] &&
			Math.abs(player.position.x - this.smgPickup.x * 100) < 200 &&
			Math.abs(player.position.y - this.smgPickup.y * 100) < 200
		) {
			const s = this.smgPickup;

			const collision = rectangleCollision(
				{
					position: player.position,
					tpos: player.position.clone().subtract(player.sprite.halfSize),
					halfSize: player.sprite.halfSize,
					velocity: player.velocity,
				},
				{
					position: s.sprite.position,
					tpos: s.sprite.position.clone().subtract(s.sprite.halfSize),
					halfSize: s.sprite.halfSize,
					velocity: new Vec2(0, 0),
				},
				true,
				false
			);

			if (collision) {
				player.pickupWeapon(
					new SMG(
						player,
						[
							this.assets.images.find((i) => i.name === 'SMG_right').image,
							this.assets.images.find((i) => i.name === 'SMG_left').image,
						],
						this.assets
					)
				);
				s.sprite.material.goto(1);
			}
		}

		if (
			Math.abs(player.position.x - this.finale.x * 100) < 200 &&
			Math.abs(player.position.y - this.finale.y * 100) < 200
		) {
			const f = this.finale;

			const collision = rectangleCollision(
				{
					position: player.position,
					tpos: player.position.clone().subtract(player.sprite.halfSize),
					halfSize: player.sprite.halfSize,
					velocity: player.velocity,
				},
				{
					position: f.sprite.position,
					tpos: f.sprite.position.clone().subtract(f.sprite.halfSize),
					halfSize: f.sprite.halfSize,
					velocity: new Vec2(0, 0),
				},
				true,
				false
			);

			if (collision) {
				this.win = true;
			}
		}

		if (this.enemies.length > 0) {
			for (let e1 of this.enemies) {
				for (let e2 of this.enemies) {
					if (e2 === e1) continue;
					if (Math.abs(e1.sprite.position.x - e2.position.x) > 600) continue;
					if (Math.abs(e1.sprite.position.y - e2.position.y) > 600) continue;

					const collision = rectangleCollision(
						{
							position: e1.sprite.position,
							tpos: e1.sprite.position.clone().subtract(e1.sprite.halfSize),
							halfSize: e1.sprite.halfSize,
							velocity: e1.sprite.velocity,
						},
						{
							position: e2.sprite.position,
							tpos: e2.sprite.position.clone().subtract(e2.sprite.halfSize),
							halfSize: e2.sprite.halfSize,
							velocity: e2.sprite.velocity,
						},
						true,
						false
					);
				}

				if (Math.abs(e1.sprite.position.x - player.position.x) > 600) continue;
				if (Math.abs(e1.sprite.position.y - player.position.y) > 600) continue;

				const collision = rectangleCollision(
					{
						position: e1.sprite.position,
						tpos: e1.sprite.position.clone().subtract(e1.sprite.halfSize),
						halfSize: e1.sprite.halfSize,
						velocity: e1.sprite.velocity,
					},
					{
						position: player.position,
						tpos: player.position.clone().subtract(player.sprite.halfSize),
						halfSize: player.sprite.halfSize,
						velocity: player.velocity,
					},
					true,
					false
				);

				if (collision) {
					player.health.update((h) => h - e1.damage);

					if (player.canGrunt) {
						this.assets.sounds.find((s) => s.name === 'click').audio.restart();
						player.canGrunt = false;
						player.sprite.material.filter = 'brightness(3)';

						setTimeout(() => {
							player.canGrunt = true;
							player.rTexture.filter = 'none';
							player.lTexture.filter = 'none';
						}, 750);
					}
				}
			}
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

		for (let s of this.spawners) {
			if (Math.abs(player.position.x - s.x * 100) > 800) continue;
			if (Math.abs(player.position.y - s.y * 100) > 800) continue;

			for (let i = 0; i < s.data.enemyCount; i++) {
				this.enemies.push(
					new Enemy(
						this.assets,
						this.stage,
						s.data.enemyStrength,
						s.sprite.position.clone()
					)
				);
			}

			this.stage.remove(s.sprite);
			this.spawners.splice(this.spawners.indexOf(s), 1);
		}
	}

	kill() {
		this.update = () => {};
		this.checkCollisions = () => {};
	}

	getSpawnCoords(): Block {
		return this.checkpoints[0];
	}

	private rand(min: number, max: number): number {
		return Math.floor(Math.random() * (max - min)) + min;
	}
}

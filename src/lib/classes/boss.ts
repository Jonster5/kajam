import { rectangleCollision } from '@api/collisions';
import { Rectangle, Stage, Texture } from '@api/material';
import { Sprite } from '@api/sprite';
import { Vec2 } from '@api/vec2';
import type { GameMap } from '@classes/map';
import type { Player } from '@classes/player';
import type { ParsedAssets, ParsedAudioItem, ParsedCharacterItem } from '@data/assetTypes';
import type { Bullet, Strength } from '@data/types';

export class JumboJaret {
	assets: ParsedAssets;
	stage: Sprite<Stage>;
	strength: Strength;

	sprite: Sprite<Texture>;
	lTexture: Texture;
	rTexture: Texture;

	healthbar: Sprite<Rectangle>;

	health: number;
	speed: number;
	maxHealth: number;
	damage: number;

	queue: Vec2[];
	counter: number;

	constructor(assets: ParsedAssets, stage: Sprite<Stage>, coords: Vec2) {
		const character = assets.characters.find((c) => c.name === 'jumbo jaret');

		this.assets = assets;
		this.stage = stage;

		this.rTexture = new Texture({ frames: character.right });
		this.lTexture = new Texture({ frames: character.left });

		this.sprite = new Sprite(this.rTexture, character.size.clone(), coords.clone());

		this.assets.sounds.find((s) => s.name === 'scratch').audio.loop = true;
		this.assets.sounds.find((s) => s.name === 'scratch').audio.play();

		this.damage = character.damage;
		this.health = character.health;
		this.speed = character.speed;
		this.maxHealth = character.health;

		this.healthbar = new Sprite(
			new Rectangle({ texture: 'red' }),
			new Vec2((this.health / this.maxHealth) * 200, 5),
			new Vec2(0, this.sprite.halfSize.y + 10)
		);

		this.sprite.add(this.healthbar);

		this.queue = [];
		this.counter = 0;

		this.stage.add(this.sprite);
	}

	takeDamage(amount: number, map: GameMap, player: Player) {
		this.health -= amount;
		this.sprite.children[0]!.size.x = this.health < 0 ? 0 : this.health;

		this.sprite.material.filter = 'brightness(3)';
		setTimeout(() => {
			this.sprite.material.filter = 'none';
		}, 100);

		if (this.health < 1) {
			this.kill(map, player);
		}
	}

	update(map: GameMap, player: Player) {
		this.counter++;
		if (this.counter >= 15) {
			this.queue.push(player.position.clone());

			this.counter = 0;
		}

		if (this.queue.length < 1) {
			this.queue.push(player.position.clone());
		}

		if (
			Math.abs(this.position.x - player.position.x) > 1000 &&
			Math.abs(this.position.y - player.position.y) > 1000
		) {
			this.velocity.set(0, 0);
		} else {
			const dif = this.position.clone().subtract(this.queue[0]);

			this.velocity.set(1, 1);
			this.velocity.angle = dif.angle + Math.PI;
			this.velocity.magnitude = this.speed;
		}

		if (
			Math.abs(this.position.x - this.queue[0].x) < 10 &&
			Math.abs(this.position.y - this.queue[0].y) < 10
		)
			this.queue.shift();

		if (this.velocity.magnitude < 0.5) {
			this.lTexture.stop();
			this.rTexture.stop();
			this.rTexture.goto(0);
			this.lTexture.goto(0);
		} else {
			this.sprite.material.start(100);
		}

		if (this.velocity.x > 0) {
			if (this.sprite.material !== this.rTexture) this.sprite.material = this.rTexture;
		} else {
			if (this.sprite.material !== this.lTexture) this.sprite.material = this.lTexture;
		}

		this.sprite.position.add(this.sprite.velocity);
	}

	kill(map: GameMap, player: Player) {
		map.jj = undefined;

		this.sprite.rotation = Math.PI / 2;
		this.sprite.position.y -= this.sprite.halfSize.y - this.sprite.halfSize.y / 3;
		this.sprite.material.stop();

		this.assets.sounds.find((s) => s.name === 'scratch').audio.pause();

		this.stage.remove(player.sprite);
		this.stage.add(player.sprite);
	}

	get position() {
		return this.sprite.position;
	}
	get velocity() {
		return this.sprite.velocity;
	}
}

export class GinormousGerry {
	assets: ParsedAssets;
	stage: Sprite<Stage>;
	strength: Strength;

	sprite: Sprite<Texture>;
	lTexture: Texture;
	rTexture: Texture;

	healthbar: Sprite<Rectangle>;

	maxHealth: number;
	health: number;
	speed: number;
	damage: number;

	rHand: Sprite<Texture>;
	lHand: Sprite<Texture>;

	counter: number;
	prevpos: number;
	queue: Vec2[];

	constructor(assets: ParsedAssets, stage: Sprite<Stage>, coords: Vec2) {
		const character = assets.characters.find((c) => c.name === 'ginormous gerry');

		this.assets = assets;
		this.stage = stage;

		this.rTexture = new Texture({ frames: character.right });
		this.lTexture = new Texture({ frames: character.left });

		this.sprite = new Sprite(this.rTexture, character.size.clone(), coords.clone());

		this.sprite.material.start(500);

		this.rHand = new Sprite(
			new Texture({ frames: [character.arm[0]] }),
			new Vec2(40, 40),
			new Vec2(this.position.x + 200, this.position.y)
		);

		this.lHand = new Sprite(
			new Texture({ frames: [character.arm[1]] }),
			new Vec2(60, 60),
			new Vec2(this.position.x + 200, this.position.y)
		);

		this.assets.sounds.find((s) => s.name === 'breathing').audio.loop = true;
		this.assets.sounds.find((s) => s.name === 'breathing').audio.play();

		this.damage = character.damage;
		this.health = character.health;
		this.maxHealth = character.health;
		this.speed = character.speed;

		this.queue = [];

		this.healthbar = new Sprite(
			new Rectangle({ texture: 'red' }),
			new Vec2((this.health / this.maxHealth) * 200, 5),
			new Vec2(0, this.sprite.halfSize.y + 10)
		);

		this.sprite.add(this.healthbar);

		this.counter = 0;
		this.prevpos = 300;

		this.stage.add(this.sprite, this.rHand, this.lHand);
	}

	takeDamage(amount: number, map: GameMap, player: Player) {
		this.health -= amount;
		this.sprite.children[0]!.size.x =
			this.health < 0 ? 0 : (this.health / this.maxHealth) * 200;

		this.sprite.material.filter = 'brightness(3)';
		setTimeout(() => {
			this.sprite.material.filter = 'none';
		}, 100);

		if (this.health < 1) {
			this.kill(map, player);
		}
	}

	update(map: GameMap, player: Player) {
		this.counter += 0.1;

		if (this.counter >= Math.PI * 2) {
			this.prevpos = this.position.clone().subtract(player.position).magnitude;
			if (this.prevpos > 800) this.prevpos = 800;
			this.counter = 0;
		}

		this.rHand.position.x =
			this.position.x -
			this.prevpos *
				Math.cos(
					this.counter + this.position.clone().subtract(player.position).angle + Math.PI
				);

		this.rHand.position.y =
			this.position.y +
			this.prevpos *
				Math.sin(
					this.counter + -this.position.clone().subtract(player.position).angle + Math.PI
				);

		this.lHand.position.x =
			this.position.x -
			200 *
				Math.cos(
					0.4 * Math.sin(3 * this.counter) +
						-this.position.clone().subtract(player.position).angle
				);

		this.lHand.position.y =
			this.position.y +
			200 *
				Math.sin(
					0.4 * Math.sin(3 * this.counter) +
						-this.position.clone().subtract(player.position).angle
				);

		const rCol = rectangleCollision(
			{
				position: this.rHand.position,
				tpos: this.rHand.position.clone().subtract(this.rHand.halfSize),
				halfSize: this.rHand.halfSize,
				velocity: this.rHand.velocity,
			},
			{
				position: player.position,
				tpos: player.position.clone().subtract(player.sprite.halfSize),
				halfSize: player.sprite.halfSize,
				velocity: player.velocity,
			},
			false,
			false
		);

		const lCol = rectangleCollision(
			{
				position: this.lHand.position,
				tpos: this.lHand.position.clone().subtract(this.lHand.halfSize),
				halfSize: this.lHand.halfSize,
				velocity: this.lHand.velocity,
			},
			{
				position: player.position,
				tpos: player.position.clone().subtract(player.sprite.halfSize),
				halfSize: player.sprite.halfSize,
				velocity: player.velocity,
			},
			false,
			false
		);

		if (player.weapon.bullets.length > 0) {
			for (let b of player.weapon.bullets) {
				const col = rectangleCollision(
					{
						position: this.lHand.position,
						tpos: this.lHand.position.clone().subtract(this.lHand.halfSize),
						halfSize: this.lHand.halfSize,
						velocity: this.lHand.velocity,
					},
					{
						position: b.sprite.position,
						tpos: b.sprite.position.clone().subtract(b.sprite.halfSize),
						halfSize: b.sprite.halfSize,
						velocity: b.sprite.velocity,
					},
					false,
					false
				);

				if (col) {
					try {
						this.stage.remove(b.sprite);
					} catch {}
					b.hit = true;
				}
			}
		}

		if (rCol) {
			player.health.update((h) => h - this.damage);

			if (player.canGrunt) {
				this.assets.sounds.find((s) => s.name === 'playerHit').audio.restart();
				player.canGrunt = false;
				player.sprite.material.filter = 'brightness(3)';

				setTimeout(() => {
					player.canGrunt = true;
					player.rTexture.filter = 'none';
					player.lTexture.filter = 'none';
				}, 750);
			}
		}

		if (lCol) {
			player.health.update((h) => h - this.damage);

			if (player.canGrunt) {
				this.assets.sounds.find((s) => s.name === 'playerHit').audio.restart();
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

	kill(map: GameMap, player: Player) {
		map.gg = undefined;

		this.sprite.rotation = Math.PI / 2;
		this.sprite.position.y -= this.sprite.halfSize.y - this.sprite.halfSize.y / 3;
		this.sprite.material.stop();

		this.assets.sounds.find((s) => s.name === 'breathing').audio.pause();

		this.stage.remove(player.sprite, this.rHand, this.lHand);
		this.stage.add(player.sprite);
	}

	get position() {
		return this.sprite.position;
	}
	get velocity() {
		return this.sprite.velocity;
	}
}

export class MegaMeqwid {
	assets: ParsedAssets;
	stage: Sprite<Stage>;
	strength: Strength;

	sprite: Sprite<Texture>;
	lTexture: Texture;
	rTexture: Texture;

	healthbar: Sprite<Rectangle>;

	health: number;
	maxHealth: number;
	speed: number;
	damage: number;

	bullets: Bullet[];
	counter: number;

	shot: ParsedAudioItem;

	constructor(assets: ParsedAssets, stage: Sprite<Stage>, coords: Vec2) {
		const character = assets.characters.find((c) => c.name === 'mega meqwid');

		this.assets = assets;
		this.stage = stage;

		this.rTexture = new Texture({ frames: character.right });
		this.lTexture = new Texture({ frames: character.left });

		this.sprite = new Sprite(this.rTexture, character.size.clone(), coords.clone());

		this.rTexture.start(100);
		this.lTexture.start(100);

		this.shot = this.assets.sounds.find((s) => s.name === 'spud shot');

		this.damage = character.damage;
		this.health = character.health;
		this.maxHealth = character.health;
		this.speed = character.speed;

		this.healthbar = new Sprite(
			new Rectangle({ texture: 'red' }),
			new Vec2((this.health / this.maxHealth) * 200, 5),
			new Vec2(0, this.sprite.halfSize.y + 10)
		);

		this.sprite.add(this.healthbar);

		this.counter = 0;
		this.bullets = [];

		this.stage.add(this.sprite);
	}

	takeDamage(amount: number, map: GameMap, player: Player) {
		this.health -= amount;
		this.sprite.children[0]!.size.x =
			this.health < 0 ? 0 : (this.health / this.maxHealth) * 200;

		this.sprite.material.filter = 'brightness(3)';
		setTimeout(() => {
			this.sprite.material.filter = 'none';
		}, 100);

		if (this.health < 1) {
			this.kill(map, player);
		}
	}

	update(map: GameMap, player: Player) {
		this.counter++;

		if (Math.abs(player.position.x) > 400 && Math.abs(player.position.y) > 400) {
			this.velocity.set(1, 1);
			this.velocity.angle = this.position.angle + Math.PI;
			this.velocity.magnitude = this.speed;
		} else {
			if (this.counter === 15) {
				this.bullets.unshift({
					sprite: new Sprite(
						new Texture({
							frames: [this.assets.images.find((n) => n.name === 'potato').image],
						}),
						new Vec2(30, 30),
						this.position
							.clone()
							.add(
								-Math.sign(this.position.clone().subtract(player.position).x) * 120,
								40
							)
					),
					damage: this.damage,
					hit: false,
					start: new Vec2(0, 0),
					target: new Vec2(0, 0),
				});

				this.shot.audio.restart();

				this.stage.add(this.bullets[0].sprite);
				this.bullets[0].sprite.velocity.set(1, 1);
				this.bullets[0].sprite.velocity.angle =
					this.position
						.clone()
						.add(
							-Math.sign(
								this.position
									.clone()
									.subtract(
										player.position
											.clone()
											.add(player.velocity.clone().multiply(15))
									).x
							) * 120,
							40
						)
						.subtract(player.position.clone().add(player.velocity.clone().multiply(15)))
						.angle + Math.PI;
				this.bullets[0].sprite.velocity.magnitude = 15;

				this.counter = 0;
			}

			this.velocity.set(1, 1);
			this.velocity.angle = this.position.clone().subtract(player.position).angle + Math.PI;
			this.velocity.magnitude = this.speed;
		}

		if (player.position.x > this.position.x) {
			this.sprite.material = this.rTexture;
		} else {
			this.sprite.material = this.lTexture;
		}

		this.sprite.position.add(this.sprite.velocity);

		if (this.bullets.length > 0) {
			for (let b of this.bullets) {
				b.sprite.position.add(b.sprite.velocity);

				const collision = rectangleCollision(
					{
						position: b.sprite.position.clone(),
						tpos: b.sprite.position.clone().subtract(b.sprite.halfSize),
						halfSize: b.sprite.halfSize.clone(),
						velocity: b.sprite.velocity.clone(),
					},
					{
						position: player.position.clone(),
						tpos: player.sprite.position.clone().subtract(player.sprite.halfSize),
						halfSize: player.sprite.halfSize.clone(),
						velocity: player.sprite.velocity.clone(),
					},
					false,
					false
				);

				if (collision) {
					b.hit = true;
					try {
						this.stage.remove(b.sprite);
					} catch {}

					player.health.update((h) => h - this.damage);

					if (player.canGrunt) {
						this.assets.sounds.find((s) => s.name === 'playerHit').audio.restart();
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
	}

	kill(map: GameMap, player: Player) {
		map.mm = undefined;

		this.sprite.rotation = Math.PI / 2;
		this.sprite.position.y -= this.sprite.halfSize.y - this.sprite.halfSize.y / 3;
		this.sprite.material.stop();

		this.stage.remove(player.sprite);
		this.stage.add(player.sprite);
	}

	get position() {
		return this.sprite.position;
	}
	get velocity() {
		return this.sprite.velocity;
	}
}

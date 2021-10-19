import { Stage, Texture } from '@api/material';
import { Sprite } from '@api/sprite';
import { Vec2 } from '@api/vec2';
import type { ParsedAssets, ParsedCharacterItem } from '@data/assetTypes';
import type { Block } from '@data/types';

export class Player {
	sprite: Sprite<Texture>;

	rTexture: Texture;
	lTexture: Texture;
	mPos: Vec2;

	currentCheckpoint: Block;

	right: boolean;
	left: boolean;
	up: boolean;
	down: boolean;

	constructor(
		element: HTMLElement,
		assets: ParsedAssets,
		character: ParsedCharacterItem,
		stage: Sprite<Stage>,
		spawn: Block
	) {
		this.rTexture = new Texture({ frames: character.right });
		this.lTexture = new Texture({ frames: character.left });

		this.sprite = new Sprite(this.rTexture, new Vec2(24, 48), spawn.sprite.position);

		stage.add(this.sprite);

		this.right = false;
		this.left = false;
		this.up = false;
		this.down = false;

		this.mPos = new Vec2(0, 0);

		window.addEventListener('mousemove', (e) => {
			this.mPos.set(
				e.screenX - window.innerWidth / 2,
				e.screenY - window.innerHeight / 2 - 100
			);

			if (this.mPos.x < 0) {
				this.sprite.material = this.rTexture;
			} else {
				this.sprite.material = this.lTexture;
			}
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

	update() {
		const delta = new Vec2(0, 0);

		if (this.left) delta.x -= 9;
		if (this.right) delta.x += 9;
		if (this.up) delta.y += 9;
		if (this.down) delta.y -= 9;

		this.velocity.add(delta);

		this.velocity.multiply(0.6);

		if (this.velocity.magnitude > 15) {
			this.velocity.normalize().multiply(9);
		}

		if (this.velocity.magnitude < 0.5) {
			this.sprite.material.stop();
		}

		this.position.add(this.velocity);
	}

	get position(): Vec2 {
		return this.sprite.position;
	}

	get velocity(): Vec2 {
		return this.sprite.velocity;
	}
}

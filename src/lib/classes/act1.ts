import { Canvas } from '@api/canvas';
import { Rectangle, Stage } from '@api/material';
import { Sprite } from '@api/sprite';
import { Vec2 } from '@api/vec2';
import { GameMap } from '@classes/map';
import { Player } from '@classes/player';
import { Pistol } from '@classes/weapons';
import type {
	ParsedActItem,
	ParsedAssets,
	ParsedAudioItem,
	ParsedCharacterItem,
} from '@data/assetTypes';
import type { GameProperties } from '@utils/gameUtils';
import { Writable, writable } from 'svelte/store';

export class Act1Game implements GameProperties {
	assets: ParsedAssets;
	act: ParsedActItem;

	music: ParsedAudioItem;

	canvas: Canvas;
	stage: Sprite<Stage>;

	map: GameMap;
	player: Player;

	showText: Writable<string>;

	pause: boolean;

	constructor(target: HTMLElement, assets: ParsedAssets, act: ParsedActItem) {
		this.assets = assets;
		this.act = act;

		this.music = this.assets.sounds.find((x) => x.name === 'tutbg')!;

		this.canvas = new Canvas(target, window.innerWidth);
		this.stage = new Sprite(
			new Stage(),
			new Vec2(this.act.width, this.act.height).multiply(100)
		);
		this.canvas.add(this.stage);

		this.map = new GameMap(this.assets, this.act, this.stage);

		this.pause = false;

		this.showText = writable('');

		this.canvas.update = () => {
			if (this.pause) return;

			this.player.update();
			this.map.update(this.player);

			this.map.checkCollisions(this.player, this.showText);

			this.stage.position.set(this.player.position.clone().negate());
		};

		this.canvas.start();

		this.music.audio.loop = true;
		this.music.audio.restart();

		window.addEventListener('keydown', (e) => {
			if (e.key === 'Escape') this.pause = !this.pause;
		});
	}

	spawnPlayer(u: ParsedCharacterItem): void {
		this.player = new Player(
			this.canvas.element,
			this.assets,
			u,
			this.stage,
			this.map.getSpawnCoords()
		);

		this.player.pickupWeapon(
			new Pistol(
				this.player,
				[
					this.assets.images.find((i) => i.name === 'pistol_right'),
					this.assets.images.find((i) => i.name === 'pistol_left'),
				],
				this.assets
			)
		);
	}

	kill(): void {
		this.canvas.stop();
		this.music.audio.pause();
	}
}

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
import type { UIData } from '@data/types';
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

	win: Writable<boolean>;

	pause: boolean;

	constructor(target: HTMLElement, assets: ParsedAssets) {
		this.assets = assets;
		this.act = assets.acts.find((a) => a.order === 1);

		this.music = this.assets.sounds.find((x) => x.name === 'tutbg')!;

		this.win = writable(false);

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
			if (this.pause) {
				this.player.pause = true;

				this.player.update();
				return;
			} else {
				this.player.pause = false;
			}
			if (this.map.win) this.win.set(true);

			this.player.update();
			this.map.update(this.player);

			this.map.checkCollisions(this.player, this.showText);

			this.stage.position.set(this.player.position.clone().negate());
		};

		this.canvas.start();

		this.music.audio.loop = true;
		setTimeout(() => {
			this.music.audio.restart();
		}, 500);

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
	}

	UIData(): UIData {
		return {
			pHealth: this.player.health,
			pGear: this.player.gear,
		};
	}

	kill(): void {
		this.canvas.stop();
		this.assets.sounds.forEach((s) => s.audio.pause());

		this.player.kill();
		this.map.kill();

		this.map = undefined;
		this.player = undefined;
	}
}

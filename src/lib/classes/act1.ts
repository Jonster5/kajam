import { Canvas } from '@api/canvas';
import { Rectangle, Stage } from '@api/material';
import { Sprite } from '@api/sprite';
import { Vec2 } from '@api/vec2';
import { GameMap } from '@classes/map';
import { Player } from '@classes/player';
import type {
	ParsedActItem,
	ParsedAssets,
	ParsedAudioItem,
	ParsedCharacterItem,
} from '@data/assetTypes';
import type { GameProperties } from '@utils/gameUtils';

export class Act1Game implements GameProperties {
	assets: ParsedAssets;
	act: ParsedActItem;

	music: ParsedAudioItem;

	canvas: Canvas;
	stage: Sprite<Stage>;

	map: GameMap;

	player: Player;

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

		this.canvas.update = () => {
			this.player.update();

			this.map.update(this.stage);

			this.map.checkCollisions(this.player);

			this.stage.position.set(this.player.position.clone().negate());
		};

		this.canvas.start();

		this.music.audio.loop = true;
		this.music.audio.restart();
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

	kill(): void {
		this.canvas.stop();
		this.music.audio.pause();
	}
}

import { Canvas } from '@api/canvas';
import { Stage } from '@api/material';
import { Sprite } from '@api/sprite';
import { Vec2 } from '@api/vec2';
import { GameMap } from '@classes/map';
import type { Player } from '@classes/player';
import type { ParsedActItem, ParsedAssets, ParsedCharacterItem } from '@data/assetTypes';
import type { GameProperties } from '@utils/gameUtils';

export class Act5Game implements GameProperties {
	assets: ParsedAssets;
	act: ParsedActItem;

	canvas: Canvas;
	stage: Sprite<Stage>;

	map: GameMap;

	player: Player;

	pause: boolean;

	constructor(p: HTMLElement, assets: ParsedAssets, act: ParsedActItem) {
		this.assets = assets;
		this.act = act;

		this.canvas = new Canvas(p, this.act.width * 20);
		this.stage = new Sprite(new Stage(), new Vec2(this.act.width * 20, this.act.height * 20));

		this.map = new GameMap(this.assets, this.act, this.stage);

		this.canvas.update = () => {};

		this.canvas.start();
	}

	spawnPlayer(u: ParsedCharacterItem): void {
		throw new Error('Method not implemented.');
	}

	kill(): void {
		throw new Error('Method not implemented.');
	}
}

import type { Rectangle } from '@api/material';
import type { Sprite } from '@api/sprite';
import type { Vec2 } from '@api/vec2';
import type { ParsedActItem, ParsedAssets } from '@data/assetTypes';
import type { Block } from '@data/types';

export interface GameMapObject {
	assets: ParsedAssets;
	act: ParsedActItem;

	tctx: CanvasRenderingContext2D;

	bgMaterial: Rectangle;
	bgSprite: Sprite;

	blocks: Block[];
	collidable: Block[];
	checkpoints: Block[];

	setupBackground(act: ParsedActItem, stage: Sprite): void;
	setupMap(stage: Sprite): void;

	update(stage: Sprite): void;

	getSpawnCoords(): Block;
}

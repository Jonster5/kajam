import type { Stage, Texture } from '@api/material';
import type { Sprite } from '@api/sprite';
import type { Vec2 } from '@api/vec2';
import type { Player } from '@classes/player';
import type { ParsedAudioItem } from '@data/assetTypes';
import type { Bullet } from '@data/types';

export interface WeaponProperties {
	texture: Texture;
	bullets: Bullet[];

	player: Player;

	fireEffect: ParsedAudioItem;
	muzzleFlash: Sprite<Texture>;

	name: string;
	damage: number;
	fireInterval: NodeJS.Timeout;
	canFire: boolean;
	count: number;

	fire?(stage: Sprite<Stage>, coords: Vec2, mPos: Vec2): void;

	startFiring?(stage: Sprite<Stage>, coords: Vec2, mPos: Vec2): void;
	stopFiring?(): void;

	update(): void;
}

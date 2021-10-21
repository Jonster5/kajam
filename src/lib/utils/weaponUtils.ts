import type { Stage, Texture } from '@api/material';
import type { Sprite } from '@api/sprite';
import type { Vec2 } from '@api/vec2';
import type { ParsedAudioItem } from '@data/assetTypes';
import type { Bullet } from '@data/types';

export interface WeaponProperties {
	texture: Texture;
	bullets: Bullet[];

	fireEffect: ParsedAudioItem;
	muzzleFlash: Sprite<Texture>;

	name: string;
	damage: number;
	fireInterval: NodeJS.Timeout;

	fire?(stage: Sprite<Stage>, coords: Vec2, mPos: Vec2): void;

	startFiring?(stage: Sprite<Stage>, coords: Vec2, mPos: Vec2): void;
	stopFiring?(): void;

	update(): void;
}

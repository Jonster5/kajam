import type { Stage, Texture } from '@api/material';
import type { Sprite } from '@api/sprite';
import type { Vec2 } from '@api/vec2';
import type { Bullet } from '@data/types';

export interface WeaponProperties {
	sprite: Sprite<Texture>;
	bullets: Bullet[];

	name: string;
	damage: number;
	fireInterval: number;

	fire?(stage: Sprite<Stage>, coords: Vec2, mPos: Vec2): void;

	startFiring?(stage: Sprite<Stage>): void;
	stopFiring?(): void;

	update(): void;
}

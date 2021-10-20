import type { Rectangle, Texture } from '@api/material';
import type { Sprite } from '@api/sprite';
import type { Vec2 } from '@api/vec2';

export type Direction = 'up' | 'down' | 'right' | 'left';

export type Strength = 'weak' | 'mid' | 'strong' | 'boss';

export interface Settings {
	music: number;
	sfx: number;

	currentAct: number;
	inAct: boolean;
}

export interface Block {
	type: string;
	x: number;
	y: number;
	solid: boolean;
	sprite: Sprite<Texture>;
	data?: {
		[key: string]: any;
	};
}

export interface Bullet {
	sprite: Sprite<Texture>;
	damage: number;
	start: Vec2;
	target: Vec2;
	hit: boolean;
}

export type CollisionType = 'top' | 'bottom' | 'right' | 'left' | 'any' | '';

export interface RectHitbox {
	position: Vec2;
	tpos: Vec2;
	halfSize: Vec2;
	velocity: Vec2;
}

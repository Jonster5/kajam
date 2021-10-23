import type { Sound } from '@api/audio';
import type { Texture } from '@api/material';
import type { Sprite } from '@api/sprite';
import type { Vec2 } from '@api/vec2';

export const BASE_URL = '/data';

export const ACT_URL = '/acts';
export const CHARACTER_URL = '/characters';
export const BLOCK_URL = '/blocks';
export const IMAGE_URL = '/sprites';
export const AUDIO_URL = '/sounds';

export interface RawAssets {
	acts: RawActItem[];
	characters: RawCharacterItem[];

	blocks: RawBlockItem[];
	images: RawImageItem[];
	sounds: RawAudioItem[];
}

export interface ParsedAssets {
	acts: ParsedActItem[];
	characters: ParsedCharacterItem[];

	blocks: ParsedBlockItem[];
	images: ParsedImageItem[];
	sounds: ParsedAudioItem[];
}

export interface RawImageItem {
	name: string;
	image: string;
}

export interface ParsedImageItem {
	name: string;
	image: HTMLImageElement;
}

export interface RawAudioItem {
	name: string;
	source: string;
	effect: boolean;
}

export interface ParsedAudioItem {
	name: string;
	audio: Sound;
	effect: boolean;
}

export interface RawBlockItem {
	type: string;
	image: string[];
}

export interface ParsedBlockItem {
	type: string;
	material: Texture;
}

export interface RawActItem {
	title: string;
	description: string;
	order: number;

	width: number;
	height: number;

	cover_image: string;

	background: string;
	grid: RawGridItem[];
}

export interface ParsedActItem {
	title: string;
	description: string;
	order: number;

	coverImage: HTMLImageElement;

	width: number;
	height: number;

	background: HTMLImageElement;
	grid: ParsedGridItem[];
}

export interface RawGridItem {
	type: string;
	x: number;
	y: number;
	solid: boolean;

	data?: {
		[key: string]: any;
	};
}

export interface ParsedGridItem {
	type: string;
	x: number;
	y: number;
	solid: boolean;
	sprite: Sprite<Texture>;

	data?: {
		[key: string]: any;
	};
}

export interface RawCharacterItem {
	name: string;

	right: string[];
	left: string[];
	arm_right: string;
	arm_left: string;

	width: number;
	height: number;

	health: number;
	damage: number;
	speed: number;
}

export interface ParsedCharacterItem {
	name: string;

	right: HTMLImageElement[];
	left: HTMLImageElement[];
	arm: [HTMLImageElement, HTMLImageElement];

	size: Vec2;
	health: number;
	damage: number;
	speed: number;
}

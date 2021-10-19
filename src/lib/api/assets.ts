import { actx, Sound } from '@api/audio';
import {
	ACT_URL,
	AUDIO_URL,
	BASE_URL,
	BLOCK_URL,
	CHARACTER_URL,
	IMAGE_URL,
	ParsedActItem,
	ParsedAssets,
	ParsedAudioItem,
	ParsedBlockItem,
	ParsedCharacterItem,
	ParsedGridItem,
	ParsedImageItem,
	RawActItem,
	RawAssets,
	RawAudioItem,
	RawBlockItem,
	RawCharacterItem,
	RawGridItem,
	RawImageItem,
} from '@data/assetTypes';

export async function LoadAssets(assetURL: string): Promise<ParsedAssets> {
	try {
		const response = await fetch(assetURL);
		if (!response.ok) throw new Error(response.statusText);

		const json = await response.json();

		const rawAssets: RawAssets = {
			acts: await Promise.all(
				json.acts.map((a: string) =>
					fetch(`${BASE_URL}${ACT_URL}/${a}`).then((r) => r.json())
				)
			),

			characters: await Promise.all(
				json.characters.map((c: string) =>
					fetch(`${BASE_URL}${CHARACTER_URL}/${c}`).then((r) => r.json())
				)
			),

			blocks: await fetch(`${BASE_URL}${BLOCK_URL}/${json.blocks}`).then((r) => r.json()),
			images: await fetch(`${BASE_URL}${IMAGE_URL}/${json.images}`).then((r) => r.json()),
			sounds: await fetch(`${BASE_URL}${AUDIO_URL}/${json.audio}`).then((r) => r.json()),
		};

		const acts: ParsedActItem[] = await Promise.all(rawAssets.acts.map(LoadAct));
		const characters: ParsedCharacterItem[] = await Promise.all(
			rawAssets.characters.map(LoadCharacter)
		);

		const blocks: ParsedBlockItem[] = await Promise.all(rawAssets.blocks.map(LoadBlock));
		const images: ParsedImageItem[] = await Promise.all(rawAssets.images.map(LoadSprite));
		const sounds: ParsedAudioItem[] = await Promise.all(rawAssets.sounds.map(LoadSound));

		return {
			acts,
			characters,
			blocks,
			images,
			sounds,
		};
	} catch (error) {
		console.error(error);
		throw new Error(error);
	}
}

export async function LoadAct(input: RawActItem): Promise<ParsedActItem> {
	const { title, background, description, cover_image, width, height, grid, order } = input;

	return {
		title,
		background: await LoadImage(`${BASE_URL}${ACT_URL}/images/${background}`),
		description,
		width,
		height,
		coverImage: await LoadImage(`${BASE_URL}${ACT_URL}/images/${cover_image}`),
		grid: await LoadGrid(grid),
		order,
	};
}

export async function LoadCharacter(input: RawCharacterItem): Promise<ParsedCharacterItem> {
	const { name, left, right, arm } = input;

	if (name === undefined || left === undefined || right === undefined || arm === undefined)
		throw new Error('Error loading character');

	return {
		name,
		left: await Promise.all(
			left.map((i) => LoadImage(`${BASE_URL}${CHARACTER_URL}/images/${i}`))
		),
		right: await Promise.all(
			right.map((i) => LoadImage(`${BASE_URL}${CHARACTER_URL}/images/${i}`))
		),
		arm: await LoadImage(`${BASE_URL}${CHARACTER_URL}/images/${arm}`),
	};
}

export async function LoadBlock(input: RawBlockItem): Promise<ParsedBlockItem> {
	const { type, image } = input;

	return {
		type,
		image: await LoadImage(`${BASE_URL}${BLOCK_URL}/images/${image}`),
	};
}

export async function LoadSprite(input: RawImageItem): Promise<ParsedImageItem> {
	const { name, image } = input;

	return {
		name,
		image: await LoadImage(`${BASE_URL}${IMAGE_URL}/images/${image}`),
	};
}

export async function LoadSound(input: RawAudioItem): Promise<ParsedAudioItem> {
	const { name, source, effect } = input;

	return {
		name,
		audio: new Sound(actx, await LoadAudioBuffer(`${BASE_URL}${AUDIO_URL}/audio/${source}`)),
		effect,
	};
}

export async function LoadGrid(input: RawGridItem[]): Promise<ParsedGridItem[]> {
	return input.map((g) => {
		const { type, x, y, solid, data } = g;

		return {
			type,
			x,
			y,
			solid,
			data,
		};
	});
}

export function LoadImage(input: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const out = new Image();
		out.src = input;

		out.onerror = (err) => {
			reject(`Image ${input} failed to load: ${err}`);
		};

		out.onload = () => {
			resolve(out);
		};
	});
}

export function LoadAudioBuffer(input: string): Promise<AudioBuffer> {
	return new Promise((resolve, reject) => {
		fetch(input, {
			method: 'GET',
			mode: 'cors',
			cache: 'no-cache',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'arraybuffer',
			},
		})
			.then((response) => response.arrayBuffer())
			.then((data) => {
				actx.decodeAudioData(data, resolve);
			})
			.catch((res) => {
				console.error(res);
				reject();
			});
	});
}

export function LoadFuzzyNumber(input: number | string): [number, number] {
	if (typeof input === 'string') {
		const s: [string, string] = input.split(' ') as [string, string];
		return s.map(parseFloat) as [number, number];
	} else {
		return [input, input];
	}
}

import type { Settings } from '@data/types';
import { Writable, writable } from 'svelte/store';

export const settings: Writable<Settings> = writable({
	music: 1,
	sfx: 1,

	currentAct: 0,
	inAct: false,
});

<script lang="ts">
	import Titlescreen from './titlescreen/Titlescreen.svelte';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import Play from './play/Play.svelte';
	import SoundCheck from '@comp/titlescreen/SoundCheck.svelte';
	import Settings from '@comp/settings/Settings.svelte';
	import { settings } from '@api/settings';
	import type { ParsedAssets } from '@data/assetTypes';

	export let assets: ParsedAssets;

	let screen = 'sound check';
	let showSettings = false;

	const click = ({ detail }) => {
		if (detail.screen === 'showSettings') showSettings = true;
		else if (detail.screen === 'hideSettings') showSettings = false;
		else if (detail.screen === 'toggleSettings') showSettings = !showSettings;
		else {
			showSettings = false;
			screen = detail.screen;
		}
	};

	const key = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			assets.sounds.find((a) => a.name === 'click').audio.restart();
			click({ detail: { screen: 'toggleSettings' } });
		}
	};
</script>

<svelte:window on:contextmenu={(e) => e.preventDefault()} on:keydown={key} />

{#if screen === 'sound check'}
	<SoundCheck {assets} on:click={click} />
{:else if screen === 'title'}
	<Titlescreen on:click={click} {assets} />
{:else if screen === 'play'}
	<Play on:click={click} {assets} />
{:else}
	<Titlescreen on:click={click} {assets} />
{/if}

{#if showSettings}
	<Settings {assets} {settings} on:click={click} />
{/if}

<script lang="ts">
	import Titlescreen from './titlescreen/Titlescreen.svelte';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import SoundCheck from '@comp/titlescreen/SoundCheck.svelte';
	import Settings from '@comp/settings/Settings.svelte';
	import { settings } from '@api/settings';
	import type { ParsedAssets } from '@data/assetTypes';
	import Selector from '@comp/play/Selector.svelte';
	import Act1 from '@comp/play/acts/Act1.svelte';
	import Act2 from '@comp/play/acts/Act2.svelte';

	export let assets: ParsedAssets;

	const acts = assets.acts.sort((a, b) => a.order - b.order);

	type Screen =
		| 'sound check'
		| 'title'
		| 'game options'
		| 'showSettings'
		| 'hideSettings'
		| 'toggleSettings'
		| 'act 1'
		| 'act 2';

	let screen: Screen = 'sound check';
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
	<Titlescreen {assets} on:click={click} />
{:else if screen === 'game options'}
	<Selector {assets} on:click={click} />
{:else if screen === 'act 1'}
	<Act1 {assets} on:click={click} />
{:else if screen === 'act 2'}
	<Act2 {assets} on:click={click} />
{:else}
	<Titlescreen on:click={click} {assets} />
{/if}

{#if showSettings}
	<Settings {assets} {settings} on:click={click} />
{/if}

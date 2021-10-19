<script lang="ts">
	import type { ParsedActItem, ParsedAssets } from '@data/assetTypes';
	import Selector from '@comp/play/Selector.svelte';
	import Game from '@comp/play/Game.svelte';
	import { createEventDispatcher } from 'svelte';

	export let assets: ParsedAssets;

	const dispatch = createEventDispatcher();

	type SingleplayerScreen = 'game options' | 'game';

	let screen: SingleplayerScreen = 'game options';
	let selectedAct: ParsedActItem;

	const click = ({ detail }) => {
		if (detail.screen === 'title')
			dispatch('click', {
				screen: 'title',
			});
		screen = detail.screen;
		selectedAct = detail.act;
	};
</script>

{#if screen === 'game options'}
	<Selector on:click={click} {assets} />
{:else if screen === 'game'}
	<Game act={selectedAct} {assets} />
{:else}
	<Selector on:click={click} {assets} />
{/if}

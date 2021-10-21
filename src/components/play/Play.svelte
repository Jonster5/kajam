<script lang="ts">
	import type { ParsedActItem, ParsedAssets } from '@data/assetTypes';
	import Selector from '@comp/play/Selector.svelte';
	import { createEventDispatcher, onMount } from 'svelte';
	import Act1 from '@comp/play/acts/Act1.svelte';
	import Act2 from '@comp/play/acts/Act2.svelte';

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
		selectedAct = detail.act;
		screen = detail.screen;
	};
</script>

{#if screen === 'game options'}
	<Selector on:click={click} {assets} />
{:else if screen === 'game'}
	{#if selectedAct.order === 1}
		<Act1 {assets} />
	{:else if selectedAct.order === 2}
		<Act2 {assets} />
	{/if}
{:else}
	<Selector on:click={click} {assets} />
{/if}

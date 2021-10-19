<script lang="ts">
	import type { ParsedAssets } from '@data/assetTypes';

	export let target: string;
	export let eventName: string = 'click';
	export let assets: ParsedAssets;

	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	const click = (screen: string): void => {
		assets.sounds.find((a) => a.name === 'click').audio.restart();
		dispatch(eventName, {
			screen,
		});
	};
</script>

<div on:click={() => click(target)}>Back</div>

<style lang="scss">
	@import '../../styles/vars';
	div {
		@include Button;
		display: block;
		position: absolute;
		top: 0.6vh;
		left: 0.6vh;
		padding: 0;
		width: 5vw;
		font-size: 1.4vw;
		z-index: 9999;
	}
</style>

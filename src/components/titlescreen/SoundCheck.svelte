<script lang="ts">
	import type { ParsedAssets } from '@data/assetTypes';
	import { createEventDispatcher } from 'svelte';
	import { backIn, backOut, cubicIn, cubicOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';

	export let assets: ParsedAssets;

	const dispatch = createEventDispatcher();

	const click = () => {
		assets.sounds.find((s) => s.name === 'click')!.audio.play();
		dispatch('click', {
			screen: 'title',
		});
	};
</script>

<main
	on:mousedown|once={click}
	in:fly={{ easing: backOut, delay: 500, duration: 500, y: 300 }}
	out:fly={{ easing: backIn, delay: 100, duration: 400, y: 300 }}
>
	<div>- Click -</div>
</main>

<style lang="scss">
	main {
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;

		&:hover {
			cursor: pointer;
		}

		&:active div {
			color: grey;
		}

		div {
			color: white;
			text-shadow: 0 0 1vh white;
			font-family: Righteous;
			font-size: 2vw;
		}
	}
</style>

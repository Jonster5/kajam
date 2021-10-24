<script lang="ts">
	import type { ParsedAssets } from '@data/assetTypes';
	import { createEventDispatcher } from 'svelte';
	import { cubicIn, cubicOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';

	export let assets: ParsedAssets;

	const dispatch = createEventDispatcher();

	const click = (screen: string) => {
		assets.sounds.find((a) => a.name === 'click').audio.restart();

		dispatch('click', {
			screen,
		});
	};
</script>

<main
	in:fly={{ easing: cubicOut, delay: 500, duration: 500, y: -300 }}
	out:fly={{ easing: cubicIn, delay: 50, duration: 450, y: -300 }}
>
	<h1>Victory!</h1>
	<h3>
		You've done it! You've killed Mega Meqwid! For your great service I will now award you your
		prize: <strong>$5,000,000,000</strong>
	</h3>

	<div class="button" on:click={() => click('title')}>Main Menu</div>
</main>

<style lang="scss">
	@import 'src/styles/vars';

	main {
		position: absolute;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;

		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;

		h1 {
			color: $title;
			font-size: 5vw;
			font-family: righteous;
		}

		h3 {
			color: $text;
			font-family: trispace;
			font-size: 2vw;
			width: 50%;
			text-align: center;

			strong {
				color: lime;
			}
		}

		.button {
			@include Button;
			margin: 2vh;
		}
	}
</style>

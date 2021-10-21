<script lang="ts">
	import type { ParsedAssets } from '@data/assetTypes';

	import type { Settings } from '@data/types';
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import { backInOut } from 'svelte/easing';
	import type { Writable } from 'svelte/store';
	import { fly, fade } from 'svelte/transition';

	export let assets: ParsedAssets;
	export let settings: Writable<Settings>;

	const dispatch = createEventDispatcher();
	const inAct = $settings.inAct;

	let music = $settings.music * 100;
	let sfx = $settings.sfx * 100;

	const adjustMusic = () => {
		$settings.music = music / 100;

		assets.sounds
			.filter((s) => s.effect === false)
			.forEach((m) => (m.audio.volume = $settings.music));
	};

	const adjustSFX = () => {
		$settings.sfx = sfx / 100;

		assets.sounds
			.filter((s) => s.effect === true)
			.forEach((e) => (e.audio.volume = $settings.sfx));
	};

	const click = (screen: string) => {
		assets.sounds.find((a) => a.name === 'click').audio.restart();

		dispatch('click', {
			screen,
		});
	};
</script>

<main transition:fade>
	<div
		class="box"
		in:fly={{ easing: backInOut, duration: 500, y: -100 }}
		out:fly={{ easing: backInOut, duration: 500, y: -100 }}
	>
		<div class="x-container">
			<span class="x" on:click={() => click('hideSettings')}>x</span>
		</div>
		<div class="slider-container">
			<div class="slider">
				<span>Music</span>
				<input type="range" min="0" max="100" bind:value={music} on:change={adjustMusic} />
			</div>
			<div class="slider">
				<span>SFX</span>
				<input type="range" min="0" max="100" bind:value={sfx} on:change={adjustSFX} />
			</div>
		</div>
		{#if inAct}
			<div class="button" on:click={() => click('title')}>Main Menu</div>
		{/if}
	</div>
</main>

<style lang="scss">
	@import 'src/styles/vars';

	main {
		position: absolute;

		top: 0;
		left: 0;

		width: 100vw;
		height: 100vh;

		background: radial-gradient(#00000080, #000000bb);
	}

	.button {
		@include Button;
		width: 50%;
		margin: 10vh 0;
	}

	.box {
		display: flex;
		position: absolute;

		width: 30vw;
		height: 20vh;

		top: 50%;
		left: 50%;

		flex-direction: column;
		align-items: center;

		transform: translate(-50%, -50%);

		background: #000000aa;
		border-radius: 2vh;
		box-shadow: 0 0 1.1vh #ffffff70;

		.slider-container {
			display: flex;
			width: 80%;
			margin: auto;
			flex-direction: column;

			.slider {
				display: flex;
				margin: 2vh 1vw;
				width: 100%;

				justify-content: space-between;
				align-items: center;

				font-family: trispace;
			}
		}

		.x-container {
			width: 100%;
		}

		.x {
			margin: 0.5vh 0.8vw;

			font-family: righteous;

			&:hover {
				cursor: pointer;
				color: grey;
			}
		}
	}
</style>

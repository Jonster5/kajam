<script lang="ts">
	import type { ParsedAssets, ParsedAudioItem } from '@data/assetTypes';

	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import { cubicIn, cubicOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';

	export let assets: ParsedAssets;

	const dispatch = createEventDispatcher();
	const bg = assets.sounds.find((a) => a.name === 'titlebg').audio;
	const clickEffect = assets.sounds.find((a) => a.name === 'click').audio;

	const click = (screen: string): void => {
		clickEffect.restart();
		// clickEffect.play();
		dispatch('click', {
			screen,
		});
	};

	onMount(() => {
		bg.loop = true;
		if (!bg.playing) bg.restart();
	});
</script>

<main
	in:fly={{ easing: cubicOut, delay: 500, duration: 500, y: -300 }}
	out:fly={{ easing: cubicIn, delay: 50, duration: 450, y: -300 }}
>
	<div class="title">$ Money Maze $</div>

	<div>
		<div class="button" on:click={() => click('play')}>Start</div>
		<div class="button" on:click={() => click('showSettings')}>Settings</div>
	</div>
</main>

<style lang="scss">
	@import '../../styles/vars';

	main {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		left: 0;
		display: flex;
		flex-direction: column;
		align-items: left;
		justify-content: space-between;
	}

	.title {
		font-family: 'Righteous';
		-moz-user-select: none;
		-webkit-user-select: none;
		color: $title;
		text-shadow: 0 0 20vh $title;
		font-size: 7vw;
		margin: 1vh 1vw;
		height: 50%;
	}

	.button {
		@include Button;
		width: 15%;
		margin: 2vh 1vw;
		font-size: 2vw;
		user-select: none;
	}
</style>

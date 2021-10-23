<script lang="ts">
	import { settings } from '@api/settings';

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
		if (!bg.playing)
			setTimeout(() => {
				bg.restart();
			}, 500);
		$settings.inAct = false;
	});
</script>

<main
	in:fly={{ easing: cubicOut, delay: 500, duration: 500, y: -300 }}
	out:fly={{ easing: cubicIn, delay: 50, duration: 450, y: -300 }}
>
	<div class="title">
		<span class="one">Mazes, Money, and </span><span class="two">Monsters</span>
	</div>

	<div>
		<div class="button" on:click={() => click('game options')}>Start</div>
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
		background: radial-gradient(#00000080, #000000ff),
			url('/images/title_bg.png') no-repeat center center fixed;
		background-size: cover;
	}

	.title {
		font-family: 'Righteous';
		-moz-user-select: none;
		-webkit-user-select: none;
		font-size: 7vw;
		margin: 1vh 1vw;
		height: 50%;

		.one {
			color: $title;
			text-shadow: 0 0 20vh $title;
		}

		.two {
			color: crimson;
			text-shadow: 0 0 20vh crimson;
		}
	}

	.button {
		@include Button;
		width: 15%;
		margin: 2vh 1vw;
		font-size: 2vw;
		user-select: none;
	}
</style>

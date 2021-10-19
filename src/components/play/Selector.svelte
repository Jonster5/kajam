<script lang="ts">
	import { settings } from '@api/settings';

	import Backbutton from '@comp/general/Backbutton.svelte';
	import SelectorCard from '@comp/play/SelectorCard.svelte';
	import type { ParsedActItem, ParsedAssets } from '@data/assetTypes';
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import { cubicIn, cubicOut } from 'svelte/easing';
	import { fade, fly } from 'svelte/transition';

	export let assets: ParsedAssets;

	const dispatch = createEventDispatcher();
	const acts = assets.acts.sort((a, b) => a.order - b.order);
	const clickEffect = assets.sounds.find((a) => a.name === 'click').audio;

	let selectedAct = 0;

	$: act = acts[selectedAct];

	const sDown = () => {
		clickEffect.restart();
		selectedAct--;
		if (selectedAct < 0) selectedAct = acts.length - 1;
	};

	const sUp = () => {
		clickEffect.restart();
		selectedAct++;
		if (selectedAct > acts.length - 1) selectedAct = 0;
	};

	const click = (screen: string): void => {
		clickEffect.restart();
		// clickEffect.play();
		dispatch('click', {
			screen,
			act,
		});
	};

	onMount(() => {
		$settings.inAct = false;
	});

	onDestroy(() => {
		console.log('destroyed');
	});
</script>

<main
	in:fly={{ easing: cubicOut, delay: 500, duration: 500, y: -300 }}
	out:fly={{ easing: cubicIn, delay: 50, duration: 450, y: -300 }}
>
	<Backbutton {assets} target="title" on:click={() => click('title')} />

	<div class="container">
		<div class="arrow"><span on:click={sDown}>{'<'}</span></div>
		<div class="card">
			{#each acts as act}
				{#if act.order === selectedAct}
					<SelectorCard {act} />
				{/if}
			{/each}
		</div>
		<div class="arrow"><span on:click={sUp}>{'>'}</span></div>
	</div>

	<div class="button" on:click={() => click('game')}>Play</div>
</main>

<style lang="scss">
	@import '../../styles/vars';

	main {
		display: flex;
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		left: 0;

		justify-content: center;
		align-items: flex-start;

		background: #000000aa;
	}

	.button {
		@include Button;
		position: absolute;
		bottom: 5vh;

		width: 20%;
		height: 10%;
		font-size: 4vw;
		user-select: none;
	}

	.container {
		display: flex;

		width: 80%;
		height: 70%;

		justify-content: center;
		align-items: center;

		.arrow {
			display: flex;
			height: 100%;
			width: 10%;
			font-family: righteous;
			font-size: 2vw;

			flex-direction: column;
			justify-content: center;
			align-items: center;

			span {
				width: 100%;
				text-align: center;

				&:hover {
					cursor: pointer;
					color: darkgray;
				}

				&:active {
					color: grey;
				}
			}
		}

		.card {
			display: flex;
			height: 100%;
			width: 100%;
			justify-content: center;
			align-items: center;
		}
	}
</style>

<script lang="ts">
	import type { ParsedActItem, ParsedAssets } from '@data/assetTypes';
	import { onDestroy, onMount } from 'svelte';
	import { settings } from '@api/settings';
	import { fly } from 'svelte/transition';
	import { cubicIn, cubicOut } from 'svelte/easing';
	import type { Writable } from 'svelte/store';
	import { Act2Game } from '@classes/act2';

	export let assets: ParsedAssets;

	let game: Act2Game;

	let ctext: Writable<string>;

	let target: HTMLElement;

	onMount(() => {
		assets.sounds.find((a) => a.name === 'titlebg').audio.pause();
		$settings.inAct = true;

		game = new Act2Game(target, assets);
		game.spawnPlayer(assets.characters.find((c) => c.name === 'Player'));

		// ctext = game.showText
	});

	onDestroy(() => {
		game.kill();
	});
</script>

<main
	in:fly={{ easing: cubicOut, delay: 500, duration: 500, y: -300 }}
	out:fly={{ easing: cubicIn, delay: 50, duration: 450, y: -300 }}
	bind:this={target}
/>

{#if $ctext}
	<article>{@html $ctext}</article>
{/if}

<style lang="scss">
	main {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		left: 0;
	}

	article {
		position: absolute;
		top: 5vh;
		left: 50vw;
		width: 50%;

		transform: translate(-50%, 0);
		padding: 1vh;
		box-sizing: border-box;

		background: #000000aa;
		border-radius: 2vh;

		font-family: trispace;
		font-size: 2.3vh;
		line-height: 3vh;
		text-align: center;
		box-shadow: 0 0 1.1vh #ffffff70;
	}
</style>

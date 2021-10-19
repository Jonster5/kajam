<script lang="ts">
	import type { ParsedActItem, ParsedAssets } from '@data/assetTypes';
	import { onDestroy, onMount } from 'svelte';
	import ActnGame from '@classes/acts';
	import type { Act1Game } from '@classes/act1';
	import type { Act2Game } from '@classes/act2';
	import type { Act3Game } from '@classes/act3';
	import type { Act4Game } from '@classes/act4';
	import type { Act5Game } from '@classes/act5';
	import { settings } from '@api/settings';
	import { fly } from 'svelte/transition';
	import { cubicIn, cubicOut } from 'svelte/easing';

	export let assets: ParsedAssets;
	export let act: ParsedActItem;

	const Game = ActnGame[`Act${act.order + 1}Game`]!;
	let game;

	let target: HTMLElement;

	onMount(() => {
		assets.sounds.find((a) => a.name === 'titlebg').audio.pause();
		$settings.inAct = true;

		game = new Game(target, assets, act);
		game.spawnPlayer(assets.characters[0]);
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

<style lang="scss">
	main {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		left: 0;
	}
</style>

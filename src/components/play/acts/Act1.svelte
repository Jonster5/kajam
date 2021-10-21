<script lang="ts">
	import type { ParsedAssets } from '@data/assetTypes';
	import { onDestroy, onMount } from 'svelte';
	import { settings } from '@api/settings';
	import { fly } from 'svelte/transition';
	import { cubicIn, cubicOut, quintIn, quintOut } from 'svelte/easing';
	import { writable } from 'svelte/store';
	import type { Writable } from 'svelte/store';
	import { Act1Game } from '@classes/act1';
	import type { UIData } from '@data/types';
	import { Breadcrumb, Pistol, SMG, Sniper } from '@classes/weapons';
	import PistolGearItem from '@comp/play/UI/PistolGearItem.svelte';
	import SmgGearItem from '@comp/play/UI/SMGGearItem.svelte';
	import SniperGearItem from '@comp/play/UI/SniperGearItem.svelte';
	import BreadcrumbGearItem from '@comp/play/UI/BreadcrumbGearItem.svelte';

	export let assets: ParsedAssets;

	let game: Act1Game;
	let lose = writable(false);
	let win = writable(false);

	let ctext: Writable<string>;

	let uiData: UIData;
	let pHealthUnsub: () => void;
	let pHealth: string = '100';

	let pGearUnsub: () => void;
	let pGear: (Pistol | SMG | Sniper | Breadcrumb)[] = [];

	let target: HTMLElement;

	onMount(() => {
		assets.sounds.find((a) => a.name === 'titlebg').audio.pause();
		$settings.inAct = true;

		game = new Act1Game(target, assets);
		game.spawnPlayer(assets.characters.find((c) => c.name === 'Player'));

		ctext = game.showText;

		const uiData = game.UIData();

		pHealthUnsub = uiData.pHealth.subscribe((h) => {
			if (Math.ceil(h).toString().length > 2) {
				pHealth = '100';
			} else if (Math.ceil(h).toString().length > 1) {
				pHealth = '0' + Math.ceil(h);
			} else if (Math.ceil(h).toString.length === 1) {
				pHealth = '00' + Math.ceil(h);
			}

			if (h < 0) {
				setTimeout(() => {
					game.kill();
					// $lose = true;
				}, 500);
			}
		});

		pGearUnsub = uiData.pGear.subscribe((g) => {
			pGear = g;
		});
	});

	onDestroy(() => {
		try {
			game.kill();
			pHealthUnsub();
		} catch {}
	});
</script>

{#if !$lose && !$win}
	<main
		in:fly={{ easing: cubicOut, delay: 500, duration: 500, y: -300 }}
		out:fly={{ easing: cubicIn, delay: 50, duration: 450, y: -300 }}
		bind:this={target}
	/>

	<div class="bottom">
		<div class="pHealth"><strong>+</strong>{pHealth}</div>
		<div class="pGear">
			{#each pGear as g, index}
				{#if g instanceof Pistol}
					<PistolGearItem pistol={g} {index} />
				{:else if g instanceof SMG}
					<SmgGearItem />
				{:else if g instanceof Sniper}
					<SniperGearItem />
				{:else if g instanceof Breadcrumb}
					<BreadcrumbGearItem />
				{/if}
			{/each}
		</div>
	</div>
{/if}

{#if $lose}
	<main>
		<h1>YOU DIED!</h1>
	</main>
{/if}

{#if $win}
	<main>
		<h1>YOU HAVE SUCCEEDED!</h1>
	</main>
{/if}

{#if $ctext}
	<article
		in:fly={{ easing: quintOut, duration: 300, y: -300 }}
		out:fly={{ easing: quintIn, duration: 300, y: -300 }}
	>
		{@html $ctext}
	</article>
{/if}

<style lang="scss">
	main {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		left: 0;
	}

	.bottom {
		position: absolute;
		display: flex;

		left: 0;
		bottom: 0;
		width: 60vw;
		height: 15vh;

		.pHealth {
			width: 10vw;
			margin: auto 2vw;
			padding: 1vh;

			background: #00000080;
			border-radius: 2vh;
			box-shadow: 0 0 1.1vh #ffffff70;

			color: palegoldenrod;
			font-family: trispace;
			font-size: 4vw;

			strong {
				color: crimson;
				font-family: righteous;
				font-size: 4vw;
			}
		}

		.pGear {
			width: 10vw;
			height: 50%;
			margin: auto 2vw;
			padding: 1vh;

			background: #00000080;
			border-radius: 2vh;
			box-shadow: 0 0 1.1vh #ffffff70;
		}
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

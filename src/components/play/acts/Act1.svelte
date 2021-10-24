<script lang="ts">
	import type { ParsedAssets } from '@data/assetTypes';
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import { settings } from '@api/settings';
	import { fly } from 'svelte/transition';
	import { backIn, backOut, cubicIn, cubicOut, quintIn, quintOut } from 'svelte/easing';
	import { writable } from 'svelte/store';
	import type { Writable } from 'svelte/store';
	import { Act1Game } from '@classes/act1';
	import type { UIData } from '@data/types';
	import type { Breadcrumb, Pistol, SMG, Sniper } from '@classes/weapons';
	import PistolGearItem from '@comp/play/UI/PistolGearItem.svelte';
	import SmgGearItem from '@comp/play/UI/SMGGearItem.svelte';
	import SniperGearItem from '@comp/play/UI/SniperGearItem.svelte';
	import BreadcrumbGearItem from '@comp/play/UI/BreadcrumbGearItem.svelte';

	export let assets: ParsedAssets;

	const dispatch = createEventDispatcher();

	let game: Act1Game;
	let lose = writable(false);
	let win: Writable<boolean>;

	let ctext: Writable<string>;

	let uiData: UIData;
	let pHealthUnsub: () => void;
	let pHealth: string = '100';

	let pGearUnsub: () => void;
	let pGear: (Pistol | SMG | Sniper | Breadcrumb)[] = [];

	let cWepUnsub: () => void;
	let cWep: string = 'Breadcrumb';

	let target: HTMLElement;

	const click = (screen: string) => {
		assets.sounds.find((a) => a.name === 'click').audio.restart();
		dispatch('click', {
			screen,
		});
	};

	const start = () => {
		assets.sounds.find((a) => a.name === 'titlebg').audio.pause();
		$settings.inAct = true;

		game = new Act1Game(target, assets);
		game.spawnPlayer(assets.characters.find((c) => c.name === 'Player'));

		setTimeout(() => {
			ctext = game.showText;
		}, 1200);

		win = game.win;

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
				// setTimeout(() => {
				stop();
				$lose = true;
				// }, 500);
			}
		});

		pGearUnsub = uiData.pGear.subscribe((g) => {
			pGear = g;
		});

		cWepUnsub = uiData.cWeapon.subscribe((w) => {
			cWep = w;
		});
	};

	const restart = () => {
		stop();

		$lose = false;
		$win = false;
		pHealth = '100';

		setTimeout(start, 500);
	};

	const stop = () => {
		try {
			game.kill();
			pHealthUnsub();
			pGearUnsub();
			cWepUnsub();
		} catch {}

		game = undefined;
		target.innerHTML = '';
	};

	onMount(start);
	onDestroy(stop);
</script>

{#if !$lose && !$win}
	<main
		in:fly={{ easing: cubicOut, delay: 600, duration: 500, y: -300 }}
		out:fly={{ easing: cubicIn, delay: 50, duration: 450, y: -300 }}
		bind:this={target}
	/>

	<div
		class="bottom"
		in:fly={{ easing: backOut, delay: 1000, duration: 500, x: -300 }}
		out:fly={{ easing: backIn, delay: 50, duration: 450, x: -300 }}
	>
		<div class="pHealth"><strong>+</strong>{pHealth}</div>
		<div class="pGear">
			<BreadcrumbGearItem cWeapon={cWep} crumb={pGear[0]} />

			<PistolGearItem cWeapon={cWep} pistol={pGear[1]} />
			<SmgGearItem cWeapon={cWep} SMG={pGear[2]} />
			<!-- <SniperGearItem />  -->
		</div>
	</div>
{/if}

{#if $lose}
	<main
		in:fly={{ easing: cubicOut, delay: 500, duration: 500, y: -300 }}
		out:fly={{ easing: cubicIn, delay: 50, duration: 450, y: -300 }}
		class="lose"
	>
		<h1>YOU DIED!</h1>

		<div class="button" on:click={() => restart()}>Restart Level</div>
		<div class="button" on:click={() => click('title')}>Main Menu</div>
	</main>
{/if}

{#if $win}
	<main
		in:fly={{ easing: cubicOut, delay: 500, duration: 500, y: -300 }}
		out:fly={{ easing: cubicIn, delay: 50, duration: 450, y: -300 }}
		class="win"
	>
		<h1>YOU HAVE SUCCEEDED!</h1>
		<div class="button" on:click={() => click('act 2')}>Next Level</div>
		<div class="button" on:click={() => click('title')}>Main Menu</div>
	</main>
{/if}

{#if $ctext && !$lose && !$win}
	<article
		in:fly={{ easing: quintOut, duration: 300, y: -300 }}
		out:fly={{ easing: quintIn, duration: 300, y: -300 }}
	>
		{@html $ctext}
	</article>
{/if}

<style lang="scss">
	@import 'src/styles/vars';

	main {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		left: 0;
	}

	.lose {
		background: rgb(63, 0, 0);
		display: flex;

		flex-direction: column;
		justify-content: center;
		align-items: center;

		h1 {
			color: crimson;
			font-size: 4vw;
			font-family: righteous;

			text-shadow: 0 0 2vh crimson;

			margin: 0 0 20vh;
		}

		.button {
			@include Button;

			margin: 1vh;
		}
	}

	.win {
		background: rgb(0, 56, 63);
		display: flex;

		flex-direction: column;
		justify-content: center;
		align-items: center;

		h1 {
			color: lime;
			font-size: 4vw;
			font-family: righteous;

			text-shadow: 0 0 2vh lime;

			margin: 0 0 20vh;
		}

		.button {
			@include Button;

			margin: 1vh;
		}
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
			height: 70%;
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
			display: flex;

			justify-content: space-evenly;
			align-items: center;

			width: 20vw;
			height: 70%;
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

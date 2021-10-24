<script lang="ts">
	import type { Breadcrumb, Pistol, SMG, Sniper } from '@classes/weapons';
	import imgSRC from '@assets/revolver_silhouette.png';
	import type { Player } from '@classes/player';
	import type { Writable } from 'svelte/store';

	export let pistol: Pistol;
	export let cWeapon: string;

	let bg = 'background: #9988;';

	$: if (cWeapon === 'Pistol') {
		bg = 'background: #ddd8';
	} else bg = 'background: #9988;';
</script>

{#if pistol}
	<article style={bg}>
		<img src={imgSRC} alt="Pistol" />
		<div class="num">2</div>
	</article>
{:else}
	<article style={bg} />
{/if}

<style lang="scss">
	article {
		display: flex;

		width: 5vw;
		height: 5vw;

		flex-direction: column;
		align-items: center;
		justify-content: center;

		border-radius: 2vh;

		img {
			width: 60%;
			height: auto;
		}

		.num {
			width: 80%;
			height: 10%;

			color: palegoldenrod;
			font-size: 2vh;
			font-family: trispace;
			text-align: right;
		}
	}
</style>

<script lang="ts">
	import type { Breadcrumb, Pistol, SMG, Sniper } from '@classes/weapons';
	import imgSRC from '@assets/revolver_silhouette.png';

	export let pistol: Pistol;
</script>

{#if pistol}
	<article>
		<img src={imgSRC} alt="Pistol" />
		<div class="num">2</div>
	</article>
{:else}
	<article />
{/if}

<style lang="scss">
	article {
		display: flex;

		width: 5vw;
		height: 5vw;

		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: #9988;

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

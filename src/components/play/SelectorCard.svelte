<script lang="ts">
	import type { ParsedActItem } from '@data/assetTypes';
	import { fade } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	export let act: ParsedActItem;

	let showDesc = false;
</script>

<main in:fade={{ easing: quintOut }}>
	<h2>{act.title}</h2>
	<div
		style={`background: url(${act.coverImage.src})`}
		on:mouseenter={() => (showDesc = true)}
		on:mouseleave={() => (showDesc = false)}
	>
		{#if showDesc}
			<article transition:fade={{ duration: 100 }}>
				{act.description}
			</article>
		{/if}
	</div>
</main>

<style lang="scss">
	@import 'src/styles/vars';

	main {
		display: flex;
		width: 100%;
		height: 100%;

		flex-direction: column;

		justify-content: center;
		align-items: center;

		h2 {
			font-family: righteous;
			width: 100%;
			text-align: center;
			color: $title;
		}

		div {
			height: 100%;
			aspect-ratio: 16 / 9;
			border-radius: 2vh;
			box-sizing: border-box;
			box-shadow: 0 0 2vh #ffffff70;
			background-size: contain;

			article {
				font-family: trispace;
				background: #000000aa;
				border-radius: 2vh;
				width: 100%;
				padding: 1vh;
				box-sizing: border-box;
			}
		}
	}
</style>

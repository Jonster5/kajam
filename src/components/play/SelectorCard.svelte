<script lang="ts">
	import type { ParsedActItem } from '@data/assetTypes';
	import { fade } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	export let act: ParsedActItem;
</script>

<main in:fade={{ easing: quintOut }}>
	<h2>{act.title}</h2>
	<img src={act.coverImage.src} alt={act.title} />
	<article>
		{act.description}
	</article>
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

			flex-grow: 2;
		}

		img {
			width: 60%;
			height: auto;
			border-radius: 2vh;
			margin: 1vh;
			box-shadow: 0 0 1.5vh #ffffff70;
		}

		article {
			font-family: trispace;
			background: #000000aa;
			border-radius: 2vh;
			width: 60%;
			padding: 1vh;
			margin: 2vh;
			box-sizing: border-box;
			text-align: center;
		}
	}
</style>

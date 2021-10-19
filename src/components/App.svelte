<script lang="ts">
	import { LoadAssets } from '@api/assets';

	import Home from '@comp/Home.svelte';
</script>

{#await LoadAssets('/data/assets.json')}
	<main>
		<h2>Loading...</h2>
	</main>
{:then assets}
	<Home {assets} />
{:catch error}
	<main>
		<h2>Hmmmm, something went wrong with loading assets: {error}</h2>
	</main>
{/await}

<style lang="scss">
	@import '../styles/vars';

	main {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;

		h2 {
			text-align: center;
			color: $title;
		}
	}
</style>

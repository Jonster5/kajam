<script lang="ts">
	import type { Pistol } from '@classes/weapons';

	export let pistol: Pistol;
	export let index: number;
</script>

<article>
	<div class="top">
		<img src="" alt="" />
		<div class="bar-outer">
			<div class="bar-inner" />
		</div>
	</div>
	<div class="label">{pistol.name}</div>
</article>

<style lang="scss">
	article {
		display: flex;

		width: 90%;
		height: 90%;

		flex-direction: column;
		align-items: center;

		.top {
			img {
				width: 90%;
				height: 90%;
			}
		}

		.label {
		}
	}
</style>

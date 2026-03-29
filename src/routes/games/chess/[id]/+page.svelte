<script lang="ts">
	import Chess from '$lib/components/chess/Chess.svelte';
	import type { PageProps } from './$types';

    
    let {data, params, form} : PageProps = $props()

</script>

<Chess {data} {params} {form} />
<script lang="ts">
	import Belote from '$lib/components/belote/Belote.svelte';
	import type { PageProps } from './$types';

    
    let {data} : PageProps = $props()

</script>

<Belote {data} />

    


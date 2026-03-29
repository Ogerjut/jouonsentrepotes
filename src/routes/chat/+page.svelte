<script lang="ts">
    import Chat from '$lib/components/Chat.svelte';

    let {data, form} = $props()

</script>

<Chat {data} {form} />
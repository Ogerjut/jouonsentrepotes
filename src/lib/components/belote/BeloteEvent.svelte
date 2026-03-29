<script lang="ts">
	import { useBelote } from "$lib/client/games/belote/useBelote.svelte";
	import { fade } from "svelte/transition";


    const belote = useBelote()
    const beloteEvent = $derived(belote?.beloteEvent)
    

</script>


{#if beloteEvent?.show}
    {#if beloteEvent.state === "belote"}
        <div class="beloteEvent" transition:fade={{duration : 400}}>
            <p>Belote !</p>
        </div>
    {:else if beloteEvent.state === "rebelote"}
        <div class="beloteEvent" transition:fade={{duration : 400}}>
            <p>Rebelote !</p>
        </div>
    {/if}

{/if}

<style>
    .beloteEvent{
        background: var(--color-bg-box);
        padding: 5px;
        border: var(--border-4);
        border-radius: 15px;
        align-items: center;
        justify-content: center;
        text-align: center;
        color : var(--color-text-2);
        min-width : 150px;
        opacity : 85%;
        font-weight: bold;
    }
</style>
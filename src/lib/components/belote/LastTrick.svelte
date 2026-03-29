<script lang="ts">
	import type { Belote } from "$lib/client/games/belote/useBelote.svelte";
	import MiniCard from "./MiniCard.svelte";

    type LastTrickProps = {
        game : Belote
    }

    let {game} : LastTrickProps = $props()
    
    const lastTrick = $derived(game.table.gameState.lastTrick)

</script>

{#if lastTrick}
    <div id="cards">
        {#each lastTrick as card (card.value + ":" + card.suit)}
            <MiniCard value={card.value} suit={card.suit} /> 
        {/each}
    </div>

{/if}

<style>
    #cards{
        display: flex;
        padding: 5px;
        background-color: var(--color-bg-box);
        
    }
</style>
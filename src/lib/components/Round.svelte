<script lang='ts'>
	import type { Belote } from "$lib/client/games/belote/useBelote.svelte";
	import type { Tarot } from "$lib/client/games/tarot/useTarot.svelte";
	import TarotCard from "./tarot/Card.svelte";
    import BeloteCard from "./belote/Card.svelte"
	import type { Suit } from "$lib/types/games/belote";

    type RoundProps = {
        game : Tarot | Belote
    }

    let {game} : RoundProps = $props()

    const table = $derived(game.table)

</script>

<div id="card-area">
    {#each Object.values(table.gameState.trick) as card (card.value + ":" + card.suit)}
        {#if game.table.gameType === "tarot"}
            <TarotCard value={card.value} suit={card.suit} />
        {:else}
            <BeloteCard value={card.value} suit={card.suit as Suit} />
        {/if}
    {/each} 
</div>


<style>

#card-area{
    /* background: white; */
    display: flex;
    flex-direction: row;
    padding: 10px;
    border-radius: 15px;
    justify-items: center;
    justify-content: center;
    width: 300px;
    height:150px;
}

</style>
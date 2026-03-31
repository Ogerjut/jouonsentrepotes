<script lang="ts">
	import type { Tarot } from "$lib/client/games/tarot/useTarot.svelte";
	import LastTrick from "./LastTrick.svelte";
	import MiniCard from "./MiniCard.svelte";

    type RoundInfoProps = {
            game : Tarot
    }

    let {game} : RoundInfoProps = $props()

    const trickColor = $derived(game.table.gameState.trickColor)

    const mapTrickColor = {
        heart : "coeur",
        spade : 'pique', 
        club : 'trêfle', 
        diamond : "carreau",
        atout : "atout"
    }

    const displayTrickColor = $derived(trickColor ?  mapTrickColor[trickColor] : "libre")

    const pos = $derived(game.table.playersId.length === 4 ? "1 / 3" : "2 / 3")

</script>

{#if game.table.gameState.calledSuit}
    <div id="round-info" style="grid-area: ${pos} ">
    <LastTrick {game} />
    <hr> 
        <div style="display: flex; padding : 3px;">
            Roi appellé : <MiniCard value={14} suit={game.table.gameState.calledSuit}  />
        </div>
    <hr>
    Couleur pli : {displayTrickColor}
    </div>
{/if}


<style>
    #round-info{
        display: flex;
        flex-direction: column;
        justify-self: start;
        align-items: center;
        background-color: white;
        border-radius: 10px;
        padding: 3px;
        margin-top: 5px;
        width : fit-content;
        height: 150px;
    }

    hr{
        align-self : normal;
    }

</style>
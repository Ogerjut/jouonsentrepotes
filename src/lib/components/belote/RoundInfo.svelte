<script lang="ts">
	import type { Belote } from "$lib/client/games/belote/useBelote.svelte";
	import LastTrick from "./LastTrick.svelte";

    type RoundInfoProps = {
            game : Belote
    }

    let {game} : RoundInfoProps = $props()

    const trickSuit = $derived(game.table.gameState.trickSuit)
    const trumpSuit = $derived(game.table.gameState.trumpSuit)

    const mapTrickSuit = {
        heart : "Coeur",
        spade : 'Pique', 
        club : 'Trêfle', 
        diamond : "Carreau",
    }

    const displayTrickSuit = $derived(trickSuit ?  mapTrickSuit[trickSuit] : "Libre")
    const displayTrumpSuit = $derived(trumpSuit ? mapTrickSuit[trumpSuit] : "Indéfini")

</script>

<div id="round-info" style="grid-area: 1 / 3">
    <LastTrick {game} />
    <hr>
    Atout : {displayTrumpSuit}
    Couleur : {displayTrickSuit}

</div>

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
    }

    hr{
        align-self : normal;
    }

</style>
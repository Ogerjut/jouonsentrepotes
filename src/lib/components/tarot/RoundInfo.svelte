<script lang="ts">
	import type { Tarot } from "$lib/client/games/tarot/useTarot.svelte";
	import LastTrick from "./LastTrick.svelte";

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

</script>

<div id="round-info" style="grid-area: 1 / 3">
    <LastTrick {game} />
    <hr>
    Couleur : {displayTrickColor}
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
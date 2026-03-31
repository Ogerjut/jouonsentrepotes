<script lang='ts'>
	import ScoreBoard from "./ScoreBoard.svelte";
	import type { Tarot } from "$lib/client/games/tarot/useTarot.svelte";
	import { leave } from "$lib/client/CoreSocket.svelte";

    type EndGameProps = {
        game : Tarot
    }
    
    let {game} : EndGameProps = $props()

    const score = $derived(new Map(Object.entries(game.table.gameState.finalScores)))

    
</script>

<div id="endGame">
    <span>Fin de la partie </span> 
    <ScoreBoard {score} />
    <button onclick={() => leave()}>
        Retour au menu
    </button>
    
</div>

<style>
    div{
        background-color: var(--color-bg-box);
        border-radius: 15px;
        text-align: center;
        display: flex;
        flex-direction: column;
        border: var(--border-2);
        width : 250px
        
    }

    span{
        background-color: var(--color-text);
        color : white;
        width : 100%;
        border-top-right-radius: 10px;
        border-top-left-radius: 10px;
        padding: 5px;
    }

    button{
        border-radius : 0px;
        border-bottom-right-radius: 13px;
        border-bottom-left-radius: 13px;
    }

</style>
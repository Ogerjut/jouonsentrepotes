<script lang="ts">
	import { useChess } from "$lib/client/games/chess/useChess.svelte";
	import GameOptions from "./GameOptions.svelte";
	import MovesList from "./MovesList.svelte";

    const chess = useChess()
    const currentPlayer = $derived(chess?.table.gameState.currentPlayer === "white" ? "blancs" : "noirs")

</script>


{#if chess}
<div id="infos-bar">
    <GameOptions/> 
    <div id="game-info">
        <div id="box-info">
            <p id="current-player">Trait aux {currentPlayer}</p>
        </div>
        <MovesList />
        
    </div>
</div>
    
    
{/if}


<style>

    #infos-bar{
        justify-items: center;
    }


    #game-info{
        display: flex;
        flex-direction: column;
        justify-self: start;
        align-items: center;
        background-color: var(--color-bg);
        border-radius: 10px;
        padding: 5px;
        margin-top: 5px;
        margin: 5px;
        height: 512px;
        gap: 5px;
        margin-bottom: 36px;
    }

    #box-info{
        background-color: var(--color-bg-1);
        text-align: center;
        border-radius: 10px;
    }

    #current-player{
        background-color: var(--color-text-2);
        color : white;
        /* border-top-left-radius: 7px;
        border-top-right-radius: 7px; */
        padding: 8px;
        border-radius: 25px



    }
</style>
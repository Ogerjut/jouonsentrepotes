<script lang="ts">
	import { chessController } from "$lib/client/games/chess/chessController.svelte";
	import { useChess } from "$lib/client/games/chess/useChess.svelte";

    const chess = useChess()
    const endGameReason = $derived(chess?.table.gameState.endGameReason)

</script>

<div id="endgame">
    <h1><b><u>Fin de partie</u></b></h1>
    <p>{endGameReason}</p>
    <button onclick={() => chessController.leave()}> Retour au menu </button>
        
        
</div>

<style>
    #endgame{
        position : absolute;
        display: flex;
        flex-direction: column;
        background-color: var(--color-bg);
        border-radius: 10px;
        padding: 25px;
        gap: 10px;
        width : 300px;
        z-index: 10;
        text-align: center;
        align-items: center;
    }

</style>
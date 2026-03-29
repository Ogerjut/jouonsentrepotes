<script lang="ts">
	import { chessController } from "$lib/client/games/chess/chessController.svelte";
	import { useChess } from "$lib/client/games/chess/useChess.svelte";
	import {type ChessTeams, type PiecesType } from "$lib/types/games/chess";

    const PIECES : PiecesType[] = ["queen", "rook", "bishop", "knight"]
    const chess = useChess()
    const team = $derived(chess?.userGameState.team)
    const currentPlayer = $derived(chess?.table.gameState.currentPlayer)
    const isCurrentPlayer = $derived(currentPlayer === team)

    function pieceIcon(piece : PiecesType, team : ChessTeams) {
        switch (piece) {
            case "queen":
                return team === "white" ? "&#9813;" : "&#9819;";
            case "rook":
                return team === "white" ? "&#9814;" : "&#9820;";
            case "bishop":
                return team === "white" ? "&#9815;" : "&#9821;";
            case "knight":
                return team === "white" ? "&#9816;" : "&#9822;";
            default:
                return "";
        }
    }
    
</script>


{#if isCurrentPlayer}
    <div id="pawn-promotion">
        <h1><b><u>Promotion du pion</u></b></h1>
        <div id="pieces">
            {#each PIECES as piece, i (PIECES[i]) }
                <button 
                    class="piece"
                    onclick={() => chessController.pawnPromoted(piece)}
                    >
                    {@html pieceIcon(piece, team)}
                </button>

            {/each}
        </div>

    </div>
{/if}


<style>
    #pawn-promotion{
        position: absolute;
        display: flex;
        flex-direction: column;
        background-color: var(--color-bg);
        padding: 25px;
        backdrop-filter: blur(1px);
        opacity: 95%;
        border-radius: 10px;
        align-items: center;
        z-index: 10;
        pointer-events: all;
        gap: 15px;
       
    }

    #pieces{
        display: flex;
        gap : 10px
    }

    h1{
        color : var(--color-text-2)
    }

    .piece{
        font-size: 40px;
        background: var(--color-bg);
        box-shadow: 0 0 2px 1px var(--color-text);
        width: 80px;
    }
</style>


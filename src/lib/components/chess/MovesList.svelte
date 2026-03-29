<script lang="ts">
	import { useChess } from "$lib/client/games/chess/useChess.svelte";
	import type { ChessPiece, ChessTeams, Tile } from "$lib/types/games/chess";


    const chess = useChess()
    const moves = $derived(chess?.table.gameState.allMoves)
    const whiteMoves = $derived(moves?.filter(m => m.piece.team === "white"))
    const blackMoves = $derived(moves?.filter(m => m.piece.team === "black"))
    // const myTeam = $derived(chess?.userGameState.team)

    // mettre une scrollbar dans la liste eviter soucis quand nombre de coup élevé

    function coordToNomemclature(dest : Tile){
        let list = ["a", "b", "c", "d", "e", "f", "g", "h"]
        return `${list[dest[0]]}${8-dest[1]}`
    }

    function pieceIcon(piece : ChessPiece, team : ChessTeams) {
    switch (piece.type) {
        case "king":
            return team === "white" ? "&#9812;" : "&#9818;";
        case "queen":
            return team === "white" ? "&#9813;" : "&#9819;";
        case "rook":
            return team === "white" ? "&#9814;" : "&#9820;";
        case "bishop":
            return team === "white" ? "&#9815;" : "&#9821;";
        case "knight":
            return team === "white" ? "&#9816;" : "&#9822;";
        // case "Pawn":
        //     return color === "WHITE" ? "&#9817;" : "&#9823;";
        default:
            return "";
    }
}
</script>

{#if whiteMoves && blackMoves}
    <table>
        <tbody>
            {#each whiteMoves as move, i (`${i}-${move.piece.type}-${move.piece.pos}`) }
            <tr>
                <th>{i+1}</th>
                <td> 
                    {#if (whiteMoves[i])}
                        {@html pieceIcon(whiteMoves[i].piece, "white")}{coordToNomemclature(whiteMoves[i].dest)}
                    {/if}
                    
                </td>
                <td>
                    {#if (blackMoves[i])}
                        {@html pieceIcon(blackMoves[i].piece, "white")}{coordToNomemclature(blackMoves[i].dest)}
                    {/if}
                </td>

            </tr>
            {/each}
        </tbody>
    </table>
{/if}


<style>

    table {
        border: 1px solid ;
        margin: 2px;
        padding: 1px;
        border-collapse:collapse;
        text-align: center;
        width: 100%
        
    }
    
    /* td {
        font-weight: bold;
    } */

    tr:nth-child(even){
        background-color: maroon;
        color : white ;
        border: 1px solid maroon;
        
    }

    td:nth-child(odd){
        color : black
    }
    

</style>
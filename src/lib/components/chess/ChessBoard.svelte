<script lang="ts">
	import { chessController } from "$lib/client/games/chess/chessController.svelte";
	import { useChess } from "$lib/client/games/chess/useChess.svelte";
	import type { ChessPiece, Tile } from "$lib/types/games/chess";
    import Piece from "./Piece.svelte"

    const TILE_SIZE = 64
    const OFFSET = TILE_SIZE/2
    const LETTERS = ["a","b","c","d","e","f","g","h"]
    const NUMBERS =  ["8","7","6","5","4","3","2","1"]
    
    const chess = useChess()
    const board = $derived(chess?.table.gameState.board)
    const team = $derived(chess?.userGameState.team || "white")
    const currentPlayer = $derived(chess?.table.gameState.currentPlayer)
    // const isLegal = $derived(chess?.table.gameState.onMoveData.isLegal)

    let piece : HTMLDivElement | null = $state(null)
    let activePiece : ChessPiece | null = $state(null)
    let isDragging = $state(false);
    let initX : number | undefined = $state(undefined)
    let initY : number | undefined = $state(undefined)   
    let visualInitX : number | undefined = $state(undefined)  
    let visualInitY : number | undefined = $state(undefined)  

    function handlePointerDown(event : PointerEvent) {
        if (currentPlayer != team || !board || !(event.currentTarget instanceof HTMLDivElement)) return
        piece = event.currentTarget
        piece.setPointerCapture(event.pointerId)

        const rawX = Number(piece.dataset.x)
        const rawY = Number(piece.dataset.y)

        visualInitX = rawX 
        visualInitY = rawY  

        initX = team === "black" ? 7 - rawX : rawX 
        initY = team === "black" ? 7 - rawY : rawY

        if (initX === undefined || initY === undefined) return 
        let selectedPiece = board[initY][initX]
        if (!selectedPiece || selectedPiece.team !== team) return 
        activePiece = selectedPiece
        isDragging = true;
    }

    function handlePointerMove(e : PointerEvent) {
        if (!isDragging || !piece) return;
        let rect = piece.parentElement?.getBoundingClientRect();
        if (!rect) return 
        const relX = e.clientX - rect.left;
        const relY = e.clientY - rect.top;
        piece.style.transform = `translate(${relX - OFFSET}px, ${relY - OFFSET}px)`
    }

    async function handlePointerUp(e : PointerEvent) {
        if (!isDragging || !piece) return;
        isDragging = false;
        piece.releasePointerCapture(e.pointerId)
        let rect = piece?.parentElement?.getBoundingClientRect();
        if (!rect) return 
        const relX = e.clientX - rect.left;
        const relY = e.clientY - rect.top;
        const x = Math.max(0, Math.min(7, Math.floor(relX / TILE_SIZE)));
        const y = Math.max(0, Math.min(7, Math.floor(relY / TILE_SIZE)));
        piece.style.transform = `translate(${x*TILE_SIZE}px,${y*TILE_SIZE}px)`;
        piece.style.zIndex = String(10);
        if (activePiece) {
            const isLegal = await chessController.sendMove(activePiece, normalizeDest({x, y}))
            if (!isLegal){
                resetPiecePos()
            }
        }
    }

    function normalizeDest(dest : {x : number, y : number}) : Tile {
        return team === "white" ? [dest.x, dest.y] : [7 - dest.x, 7 - dest.y]
    }

    function resetPiecePos(){
        if (piece && visualInitX !== undefined && visualInitY !== undefined) {
            const x = visualInitX * TILE_SIZE
            const y = visualInitY * TILE_SIZE
            piece.style.transform = `translate(${x}px,${y}px)`;
            piece.style.zIndex = String(10);
            piece.dataset.x = String(visualInitX) 
            piece.dataset.y = String(visualInitY)
        }
    }

</script>

    <div class ="board" >
        {#each Array.from({length : 8}, (_, i) => i) as i (i)}       
            {#each Array.from({length : 8}, (_, j) => j) as j (j)} 
            
            {@const displayI = team === "black" ? 7 - i : i}
            {@const displayJ = team === "black" ? 7 - j : j}

            <div 
            class="tiles" 
            style="background-color : {(displayJ + displayI) % 2 === 1 ? "maroon" : "white" }"
            >
                <div class="nomenclature">
                    {#if displayJ === 0 && team === "white"}
                    <p class="NUMBERS" class:isBrown={(displayJ + displayI) % 2 === 1}> {NUMBERS[displayI]} </p>
                    {:else if displayJ === 7 && team === "black"}
                    <p class="NUMBERS" class:isBrown={(displayJ + displayI) % 2 === 1}> {NUMBERS[displayI]} </p>
                    {/if}

                    {#if displayI === 7 && team === "white"}
                    <p class="LETTERS" class:isBrown={(displayJ + displayI) % 2 === 1}> {LETTERS[displayJ]} </p>
                    {:else if displayI === 0 && team === "black"}
                    <p class="LETTERS" class:isBrown={(displayJ + displayI) % 2 === 1}> {LETTERS[displayJ]} </p>
                    {/if}

                </div>

                
            </div>
            {#if board?.length !== 0 && board }
                {@const piece = board[displayJ][displayI]} 
                {#if piece }        
                    <Piece
                    {handlePointerDown}
                    {handlePointerMove}
                    {handlePointerUp}
                    tilesize = {TILE_SIZE} 
                    type = {piece.type}
                    team = {piece.team}
                    x = {i}
                    y = {j}
                    />
                {/if} 
            {/if} 


            {/each}
        {/each}
    </div>


<style>
    .board {
        display: grid;
        grid-template-columns: repeat(8, 12.5%);
        grid-template-rows: repeat(8, 12.5%);
        aspect-ratio: 1/1;
        width:512px;
        height: 512px;
        position: relative;
        
    }

    .tiles {
        border : 1px solid orangered;
        border-radius : 1px;
        

    }

    .nomenclature {
        position: absolute; 
        margin: 1px;
        font-size: 12px;
        color : maroon
    }
    
    .LETTERS {
        position: absolute;
        top : 43px;
        left: 52.5px;
    }

    .isBrown{
        color : white
    }   

    /* .highlight {
    border: 2px solid limegreen ;
    box-shadow: inset 0 0 4px limegreen;
} */

</style>







	

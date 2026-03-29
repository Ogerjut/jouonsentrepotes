<script lang="ts">
	import type { ChessTeams } from "$lib/types/games/chess";

    type PieceProps = {
        handlePointerDown : (event : PointerEvent) => void, 
        handlePointerMove : (event : PointerEvent) => void,
        handlePointerUp : (event : PointerEvent) => void, 
        tilesize : number, 
        type : string,  
        team : ChessTeams, 
        x : number, 
        y : number
    }

  let { handlePointerDown, handlePointerMove, handlePointerUp, tilesize, type, team, x , y} : PieceProps = $props();

  // positions dans la sprite sheet
  const pieceMap : Record<string, number> = {"pawn": 5, "rook": 4, "knight": 3, "bishop": 2, "queen": 1, "king": 0};
  const spriteX = $derived( pieceMap[type] * tilesize)
  const spriteY = $derived(team === "black" ? tilesize : 0)


</script>
   
<!-- bind:this={piece} -->
<div
    class="piece"
    role="button"
    tabindex="0"
    onpointerdown = {handlePointerDown}
    onpointermove={handlePointerMove}
    onpointerup={handlePointerUp}
    style="
    --spriteX: {-spriteX};
    --spriteY: {spriteY};
    transform: translate({x*tilesize}px, {y*tilesize}px);
    "
    data-x = {x}
    data-y = {y}
> 
</div>


<style>
    .piece {
        width: 64px;
        height: 64px;
        position: absolute;
        background-image: url('$lib/assets/pieces_sprite.png');
        /* 384 (75%) ; 128 (25%) : 512px du board*/
        background-size: 384px 128px;
        background-position: calc(var(--spriteX)*1px) calc(var(--spriteY)*1px) ;
        /* pointer-events: none; */
        cursor: grab;
        user-select: none;
        z-index: 10;
      
        

    }
    .piece:active {
        cursor: grabbing;
    }
   
</style>
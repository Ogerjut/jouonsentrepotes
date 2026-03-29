<script lang='ts'>
  import { enhance } from "$app/forms"
  import { tarotController } from "$lib/client/games/tarot/TarotController.svelte";
  import { useTarot } from "$lib/client/games/tarot/useTarot.svelte";
	import ProgressBar from "../ProgressBar.svelte";

  
  const tarot = useTarot()
  let table = $derived(tarot?.table)
  let userState = $derived(tarot?.userGameState)
  let actualBid = $derived(table?.gameState.actualBid || 0)
  const isCurrentPlayer = $derived(table?.gameState.currentPlayer === tarot?.me.id)
    
</script>


<div class="bet" class:isCurrentPlayer={isCurrentPlayer}>
    {#if isCurrentPlayer}
         <ProgressBar />
        
    {/if}

    {#if tarot && userState}
      <p> {isCurrentPlayer ? "Choisis ton annonce ! " : "Ce n'est pas ton tour !"} </p>
    
    <form action="?/bet" method="post" 
        use:enhance ={()=>{
          return async ({result, update}) => {
            await update();
            // console.log('bet : ', result.data.bet)
            tarotController.sendBid(result.data.bet)
          }
        }}>
        
        <fieldset disabled = {!isCurrentPlayer}>

          <div class="dr">
            <input type="radio" name="bet" id="r0" value="0" checked >
            <label for="r0"> Passer </label>
          </div>
          
          <div class="dr">
            <input type="radio" name="bet" id="r1" value="1" disabled = {actualBid >= 1}>
            <label for="r1"> Prise </label>
          </div>
      
          <div class="dr">
            <input type="radio" name="bet" id="r2" value="2" disabled = {actualBid >= 2}>
            <label for="r2"> Garde</label>
          </div>

          <div class="dr">
            <input type="radio" name="bet" id="r3" value="3" disabled = {actualBid >= 3}>
            <label for="r3">Garde sans</label>
          </div>
      
          <div class="dr">
            <input type="radio" name="bet" id="r4" value="4">
            <label for="r4">Garde contre</label>
          </div>
           
          </fieldset>
        <button disabled = {!isCurrentPlayer} type="submit"> Annoncer </button>
        
        </form>
    {/if}
    

</div>

<style>
   
    
    .bet {
        display : flex; 
        background: var(--color-bg-box);
        padding: 10px;
        border: var(--border-4);
        border-radius: 10px;
        align-items: center;
        flex-direction: column;
        color : var(--color-text-2)

    }
    
    input:disabled + label {
      cursor: not-allowed;
      opacity: 0.6;
    }

    button:disabled{
      cursor:not-allowed;
    }

    form{
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .isCurrentPlayer{
      border: 4px solid orange
    }

    

  
</style>
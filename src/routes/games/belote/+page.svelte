<script lang='ts'>
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { useToast } from '$lib/client/games/hook/useToast.svelte';
	import type { PageProps } from '../../$types';
	

  let {data, form} : PageProps = $props()
    
  let creating = $state(true)
	


</script>

<div id='setting-container'>  	
    <h1><b><u>Belote</u></b></h1>

    {#if creating}
        <form action="?/createTable" method="post"

        use:enhance ={()=>{
          return async ({result, update}) => {
            await update();
            creating = false
            if (result.type === "failure"){
              useToast().show(result.data.reason)
              goto('/')
            }


          }
        }}>

        <fieldset>
            <legend>Sélectionnes un mode de jeu :</legend>
            
            <label class="hit-area" for="r4">
                <input checked type="radio" name="scoreMode" id="r4" value="1000">
                En 1000 pts
            </label>
            
            <label class="hit-area" for="r5">
                <input type="radio" name="scoreMode" id="r5" value="12" >
                En 12 coups
            </label>

        </fieldset>

        <div id="buttons"> 
          <button type="submit"> Créer la table </button>          
          <button type="button" onclick={() => goto('/')}> Menu </button>
        </div>
        
        </form>
        

    {/if}

    {#if form?.success}
      <p>{form.message}</p>
    {/if}


</div>


<style>
  #setting-container {
    display: flex;
    flex-direction: column;
    text-align: center;
    border-radius: 25px;
    margin: 10px ;
    padding: 10px;
    background-color:var(--color-bg-box);
    box-shadow: var(--box-shadow-1);
    width : 55%

  }

  button:disabled{
    cursor: not-allowed;
  }

  fieldset{
    border : var(--border-1);
    text-align: center;
    border-radius: 10px;
    padding-left: 15px;
    padding-right: 15px;
    padding-bottom: 15px;
    margin: 10px;
    display: flex;
    flex-direction: column;

  }

  legend{
    font-size:medium;
    margin: 5px;
    padding: 5px;
  }
  
  .hit-area{
    border : var(--border-1);
    padding: 10px;
    margin: 5px;
    border-radius: 15px;
    background-color: beige;
  
  }

  .hit-area:has(input:checked){
      border: var(--border-4);
      background-color:peru;
      color:var(--color-text-2);
      font-weight: bold;
    }

  input:checked{
    color:var(--color-text-2);
  }

  #buttons{
    display: flex;
    justify-content: space-around;
  }

  .hit-area:has(input:disabled){
    opacity: 60%;
  }

  h1{
    font-size: x-large;
    color : maroon
  }



</style>
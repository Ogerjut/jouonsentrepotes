<script lang='ts'>
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { useToast } from '$lib/client/games/hook/useToast.svelte';
	import type { PageProps } from '../../$types';
	

  let {data, form} : PageProps = $props()
    
  let creating = $state(true)
	let nbPlayers = $state(2)

	function handleChangeNbPlayers(event){
		nbPlayers = event?.target?.value
	}


</script>

<div id='setting-container'>  	
    <h1><b><u>Yam's</u></b></h1>

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
          <legend>Sélectionnes un nombre de joueurs :</legend>
          <input
            type="range"
            name="nbPlayers"
            id="nbPlayers"
            value={nbPlayers}
            min=2 max=6 step=1 
            onchange={(e)=>handleChangeNbPlayers(e)}
            list='ticks'
            >
            <datalist id="ticks">
              <option value="2" label="2"></option>
              <option value="3"></option>
              <option value="4"></option>
              <option value="5"></option>
              <option value="6"></option>
              
            </datalist>
          <label id="nbPlayers" for="nbPlayers"> {nbPlayers} Joueurs</label>
        </fieldset>

        <div id="buttons">
          <button type="submit"> Créer la table </button>
          <button type="button" onclick={()=>goto('/')}> Menu </button>
  
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

  #buttons{
    display: flex;
    justify-content: space-around;
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

  #nbPlayers{
    font-size: large;
    color: var(--color-text-2);
    font-weight: bold;
  }


  /* input[type="range"] {
    appearance: none;
    background:  var(--color-text-2);
    height : 0.5rem;
    cursor: pointer;
    border-radius: 15px;

  } */


  input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    accent-color: transparent;
  }


    /* Chrome, Safari, Edge (Chromium) */
  input[type="range"]::-webkit-slider-runnable-track {
    /* background: linear-gradient(to right, red 0%, #053a5f 50%, blue 100%); */
    height: 0.5rem;
    background:  var(--color-text);
    border-radius: 15px;
  }

  /* Firefox */
  input[type="range"]::-moz-range-track {
    /* background: linear-gradient(to right, red 0%, #053a5f 50%, blue 100%); */
    height: 0.5rem;
    border-radius: 15px;
    background:  var(--color-text);
  }


    /* Chrome, Safari, Edge (Chromium) */
  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    background: var(--color-text-2);
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    cursor: pointer;
    margin-top: -0.25rem;
    border: 1px solid var(--color-bg-box);
  }

  /* Firefox */
  input[type="range"]::-moz-range-thumb {
    appearance: none;
    background: var(--color-text-2);
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    cursor: pointer;
    border: 1px solid var(--color-bg-box);
  }

  input[type="range"]:active {
    cursor: grabbing;
  }

  h1{
    font-size: x-large;
    color : maroon
  }



  


</style>


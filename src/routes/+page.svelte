<script lang="ts">
	import Login from "$lib/components/Login.svelte";
	import SignUp from "$lib/components/SignUp.svelte";
  import GameCard from '$lib/components/GameCard.svelte'
  import tarotImage from '$lib/assets/tarot-icon.jpg'
  import chessImage from '$lib/assets/chess-icon.jpg'
  import yamsImage from '$lib/assets/yams-icon.jpg'
  import beloteImage from '$lib/assets/belote-icon.jpg'
	import type { PageProps } from "./$types";

  let {data, form} : PageProps = $props()
  
  let loginBox = $state(true)

const games = [
    {
      row : 1, col : 1,
      name : "tarot",
      url : "/games/tarot",
      image : tarotImage,
      published : true 
    },
    {
      row : 1, col : 2,
      name : "yam's",
      url : "/games/yams",
      image : yamsImage,
      published : true 
    },
    {
      row : 2, col : 1,
      name : "échec",
      url : "/games/chess",
      image : chessImage,
      published : true 
    },
    {
      row : 2, col : 2,
      name : "belote",
      url : "/games/belote",
      image : beloteImage,
      published : true 
    },
  ]
</script>

{#if data.user}
  <div id='games-container'>
    {#each games as game (game.url)}
      <GameCard {...game} />
    {/each}
  </div>

  {:else}
  <p>Connectes toi ou inscris toi pour accéder aux jeux. </p>
  <!-- <ul class="info"><u> Jeux disponibles : </u>
    <li>Tarot 4 joueurs</li>
    <li>Yam's</li>
  </ul>
  <hr>
  <ul class="info"><u>Jeux à venir : </u> 
    <li>Tarot 5 joueurs</li>
    <li>Belote</li>
    <li>Echec</li>
  </ul> -->
  
  {#if loginBox}
    <Login {form}/>
    <p> Pas encore inscrit ?
      <button class="btn-log" onclick={()=> loginBox = !loginBox }>
        <u>Cliques ici</u>
      </button>
    </p> 

    {:else}
    <SignUp {form} />
    <p>  
      <button class="btn-log" onclick={()=> loginBox = !loginBox }>
        <u> Connectes toi </u>
      </button>
    </p> 
  {/if}

{/if}


<style>
  #games-container{
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    grid-template-rows: repeat(2, auto);   
    gap: 5px;
    margin-top: 10px;
    
  }

  p{
    margin: 5px;
    color : var(--color-text-2)
  }

  u{
    font-weight: bold;
  }

  /* .info{
    background-color: var(--color-bg-box);
    text-align: center;
    padding: 5px;
    border-radius: 10px;
    width: 200px;
  } */

  .btn-log {
    background: transparent;
    box-shadow: 0 0
  }

</style>

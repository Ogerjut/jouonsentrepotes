<script lang="ts">
	import { goto } from "$app/navigation";
	import { useYams } from "$lib/client/games/yams/Yams.svelte";
	import { yamsController } from "$lib/client/games/yams/yamsController.svelte";
	import Dice from "./Dice.svelte";

    const yams = useYams()
    const table = $derived (yams?.table)
    const userGameState = $derived(yams?.userGameState)
    
    const dices = $derived(table?.gameState.dices)
    const launches = $derived(userGameState?.launches)
    const userIsCurrentPlayer = $derived(yams?.me.id === table?.gameState.currentPlayer)

</script>

<div id="table" >
    <div id="dices-container">
        {#each dices as dice, key }
            <Dice id={key}  bind:selected={dice.selected} value={dice.value} {launches}/>
        {/each}
    </div>

    
</div>
<div id="user-action">
    {#if userIsCurrentPlayer && yams && dices}
        <button disabled={table?.gameState.state === "endGame" || userGameState?.launches === 0} onclick={()=>yamsController.rollDices(dices)}>LANCER LES DÉS !</button>
        <p> Lancés restants : {launches}</p>
    {/if}
    {#if table?.gameState.state ==="endGame"}
        <button onclick={()=>yamsController.quitTable()}>Retour au menu</button>
    {/if}
    
</div>

<style>
    #table {
        height: 300px;
        width: 300px;
        border: 10px solid black;
        background-color: darkgreen;
        border-radius: 50%;
        align-content: center;
        margin-left: 10px;
        box-shadow: 0px 10px 10px saddlebrown;
    }

    #dices-container{
        display: flex;
        width : 100%;
        background-color: green;
        border-radius: 45%;
        /* height: 50%; */

    }

    /* #table:first-child{
        
    } */

    #user-action{
        display: flex;
        flex-direction: column;
        gap: 2px;
        font-size: small;
        align-items: center;
        margin-top: 3px;
       
    }

    p{
        color : var(--color-text-2)
    }

    button:disabled{
        cursor:not-allowed;
        opacity: 60%;
    }

</style>
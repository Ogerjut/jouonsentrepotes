<script lang='ts'>
	import { tarotController } from "$lib/client/games/tarot/TarotController.svelte";
	import { useTarot } from "$lib/client/games/tarot/useTarot.svelte";
	import ProgressBar from "../ProgressBar.svelte";
	import Card from "./Card.svelte";

    const tarot = useTarot()
    const table = $derived(tarot?.table)
    const userGameState = $derived(tarot?.userGameState)

    const maxCards = $derived(table?.maxPlayers === 4 ? 6 : 3)
    
    let disabledButton = $derived(userGameState?.cardsWon.length !== maxCards)    

</script>

{#if tarot && table && userGameState}
    <p>Chien : </p>
    <div class="dog">
        {#each table.gameState.dog as card }
            <Card value={card.value} suit={card.suit} /> 
        {/each}
    </div>

    {#if userGameState.hasTaken}
        <ProgressBar />
        <p>Nouveau Chien : </p>
        <div class="dog">
            {#each userGameState.cardsWon as card }
                <Card value={card.value} suit={card.suit}/> 
            {/each}
        </div>
        <button disabled={disabledButton} onclick={() => tarotController.validateDog()}> Valider </button>
        

    {/if}

{/if}



<style>
    .dog{
        gap: 3px;
        display: flex;
        flex-direction: row;
        width : 200px;
        min-width: 200px;
    }

    button:disabled{
        cursor: not-allowed;
        color : red;
    }
    button{
        cursor:pointer;
        color : green;
    }
</style>
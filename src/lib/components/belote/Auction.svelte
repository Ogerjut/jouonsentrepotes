<script lang='ts'>
	import { useBelote } from "$lib/client/games/belote/useBelote.svelte";
	import { SvelteMap } from "svelte/reactivity";
	import Card from "./Card.svelte";
	import { beloteController } from "$lib/client/games/belote/BeloteController.svelte";
	import type { Suit } from "$lib/types/games/belote";
	import ProgressBar from "../ProgressBar.svelte";

    const belote = useBelote()
    let table = $derived(belote?.table)
    let auctionRound = $derived(table?.gameState.auctionRound)
    let potentialTrump = $derived(table?.gameState.potentialTrump)
    const isCurrentPlayer = $derived(table?.gameState.currentPlayer === belote?.me.id)
    
    const mapSuits = $derived.by(() => {
        const map = new SvelteMap<Suit, string>()
        map.set("spade", "Pique")
        map.set("heart", "Coeur")
        map.set("diamond", "Carreau")
        map.set("club", "Trêfle")

        if (potentialTrump) {
            map.delete(potentialTrump.suit)
        }

        return map
    })
        
    

</script>

{#if potentialTrump && belote}
    <Card value={potentialTrump.value} suit={potentialTrump.suit}/>
    <div class:isCurrentPlayer={isCurrentPlayer} class="bid">

        {#if isCurrentPlayer}
            <ProgressBar />
        {/if}
   
        <p> {isCurrentPlayer ? "Choisis ton annonce ! " : "Ce n'est pas ton tour !"} </p>

        <div id="buttons">
            <button disabled = {!isCurrentPlayer} onclick={() => beloteController.sendBid(0, potentialTrump.suit)}> Passer </button>
            {#if auctionRound === 1 }
                <button disabled = {!isCurrentPlayer} onclick={() => beloteController.sendBid(1, potentialTrump.suit)}> Prendre </button>
            {:else if auctionRound === 2}
                {#each mapSuits.entries() as [key, val] (key)}
                <button disabled = {!isCurrentPlayer} onclick={() => beloteController.sendBid(1, key)}> {val} </button>
                {/each}
            {/if}
        </div>
    </div>
{/if}



<style>
    .bid {
        display : flex; 
        background: var(--color-bg-box);
        padding: 10px;
        border: var(--border-4);
        border-radius: 10px;
        align-items: center;
        flex-direction: column;
        color : var(--color-text-2)

    }
    
    button:disabled{
      cursor:not-allowed;
      opacity: 90%;
    }

    #buttons{
        display: flex;
        flex-direction: column-reverse;
        gap: 4px;
    }

    .isCurrentPlayer{
      border: 4px solid orange
    }
  
</style>
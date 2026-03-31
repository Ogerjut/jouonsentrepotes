<script lang='ts'>
	import { tarotController } from "$lib/client/games/tarot/TarotController.svelte";
	import { useTarot } from "$lib/client/games/tarot/useTarot.svelte";
	import type { Suit } from "$lib/types/games/tarot";
	import ProgressBar from "../ProgressBar.svelte";
	import Card from "./Card.svelte";

    const tarot = useTarot()
    const table = $derived(tarot?.table)
    const userGameState = $derived(tarot?.userGameState)

    const suits : Suit[]= ["spade", "heart", "diamond", "club"]

    let kingCalled = $derived(table?.gameState.calledSuit)

</script>

<div class="king-call">
    <ProgressBar />
    {#if !kingCalled}
        <h1>Appel du roi </h1>
        {#if tarot && table && userGameState && userGameState.hasTaken}
            <p>Choisissez le roi que vous appelez : </p>
            <div class="kings">
                {#each suits as suit, i (i)}
                    <button onclick={() => tarotController.kingCall(suit)}>
                        <Card value={14} suit={suit} /> 
                    </button>
                {/each}
            </div>
        {/if}
    {:else}
        <h1>Roi appelé : </h1>
        <Card value={14} suit={kingCalled} /> 
    {/if}
</div>




<style>
    .king-call{
        display: flex;
        flex-direction: column;
        align-items: center;
        background: var(--color-bg-box);
        padding: 10px;
        border:var(--border-4);
        border-radius: 15px;
        justify-items: center;
        justify-content: center;
        width : fit-content;
    }

    .kings{
        display: flex;
        flex-direction: row;
    }

    button:disabled{
        cursor: not-allowed;
        color : red;
    }
    button{
        cursor:pointer;
        color : green;
        background: var(--color-bg-box);
        box-shadow: 0 0 0;
    }
</style>
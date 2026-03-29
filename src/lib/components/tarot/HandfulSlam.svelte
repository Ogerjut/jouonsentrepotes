<script lang="ts">
	import { tarotController } from '$lib/client/games/tarot/TarotController.svelte';
	import { useTarot } from '$lib/client/games/tarot/useTarot.svelte';
	import type { Handful } from '$lib/types/games/tarot';
	import { onMount } from 'svelte';
	import ProgressBar from '../ProgressBar.svelte';

    let hasHandful = $state(false)
    let handfulSize : Handful = $state(0)

    const tarot = useTarot()
    const userGameState = $derived(tarot?.userGameState)
    let registeredHandful = $state(false)

    onMount(async ()=>{
        if (!tarot?.userGameState.declaredHandful) {
            const result = await tarotController.checkHandful()
            hasHandful = result.hasHandful
            handfulSize = result.handfulSize
        }
    })

    async function registerHandful(){
        registeredHandful = await tarotController.declareHandful(handfulSize)
    }

</script>

<div>
    <ProgressBar />
    <h1><u>Poignées & Chelem ? </u></h1>
    {#if hasHandful}
        <button disabled={registeredHandful} id="handful" onclick={async () => await registerHandful()}> Poignée ({handfulSize} atouts) </button>
    {:else}
        <p>Pas de poignée à montrer !</p>
    {/if}
    {#if userGameState?.hasTaken && !userGameState?.declaredSlam}
        <button id="slam" onclick={()=>tarotController.declareChelem()}> Chelem </button>
    {/if}
    
</div>

<style>
    div{
        background-color: var(--color-bg-box);
        display: flex;
        flex-direction: column;
        padding: 15px;
        gap: 5px;
        border-radius: 15px;
    }

    button:disabled{
        opacity: 80%;
    }
</style>
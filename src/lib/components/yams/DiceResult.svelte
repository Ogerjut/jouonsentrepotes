<script lang="ts">
	import { useYams } from "$lib/client/games/yams/Yams.svelte";
	import { yamsController } from "$lib/client/games/yams/yamsController.svelte";
	import type { DiceResult } from "$lib/types/games/yams";

    interface DiceResultProp {
        diceResult : DiceResult,
        diceResultOwner : string
    }


    let {diceResult, diceResultOwner} : DiceResultProp = $props()
    
    const yams = useYams()

    let displayValue = $derived(diceResult.done ? diceResult.value : diceResult.possibleValue)
    

</script>

{#if yams}
    <p class:notdone={!diceResult.done} class:notOwn={diceResultOwner !== yams?.me.id}>
        <button disabled={diceResult.done || diceResultOwner !== yams?.me.id } onclick={()=>yamsController.sendPossibleDiceResult(diceResult, diceResultOwner, yams)} >{displayValue}</button>
    </p>  
{/if}


<style>
    .notdone{
        font-style: italic;
    }

    button{
        padding: 0;
        background-color: var(--color-bg-box);
        box-shadow: 0px 0px 0px;
        padding-right: 3px;
        padding-left: 3px;
    }

    button:disabled{
        cursor:default;
        font-weight: bold;
    }

    .notOwn{
        font-style: normal;
        font-weight: normal;
    }
</style>
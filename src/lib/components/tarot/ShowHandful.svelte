<script lang='ts'>
	import { useTarot } from "$lib/client/games/tarot/useTarot.svelte";
	import ProgressBar from "../ProgressBar.svelte";
	import Card from "./Card.svelte";
    
    const tarot = useTarot()
    const table = $derived(tarot?.table)

</script>

{#if table }

    <div id="poignee-container">
        <ProgressBar />
        {#each Object.entries(table.gameState.handfuls) as [username, cards], ind}
            <p>Poignée de <strong>{username}</strong> ({cards.length})</p>
            <div id="card-area">
            {#each cards as card}
                <Card value={card.value} suit={card.suit}/>
            {/each}
            </div>
        {/each}
    

    </div>
    
{/if}





<style>

    #card-area{
        display: flex;
        flex-direction: row;
        padding: 10px;
        border-radius: 15px;
        justify-items: center;
        justify-content: center;
    }

    #poignee-container{
        background-color: var(--color-bg-box);
        align-items: stretch;
        justify-items: center;
        padding: 10px;
        border-radius: 15px;

    }
</style>
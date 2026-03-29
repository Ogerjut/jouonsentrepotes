<script lang="ts">
	import { fetchOpponents, useOpponents } from "$lib/client/games/hook/UseOpponents.svelte";
	import { fetchOpponentsYamsState, useYams } from "$lib/client/games/yams/Yams.svelte";
	import { onMount } from "svelte";
	import DiceResult from "./DiceResult.svelte";
    
    let opponents = $derived(useOpponents())
    
    const yams = useYams()
    const table = $derived (yams?.table)
    const userGameState = $derived(yams?.userGameState)

    const state = $derived(table?.gameState.state)
    const launches = $derived(userGameState?.launches)

    let players = $derived([yams?.me, ...opponents])
    let playersGameState = $derived([userGameState, ...yams?.opponentsGameState || []])

    const tableRow1 = [
        "1", "2", "3", "4", "5", "6",
    ]
    const tableRow2 = [
        "brelan", "carré", "full", "petite suite", "grande suite", "yam's", "chance"
    ]

    $inspect("game states : ", playersGameState, players)

    onMount(async ()=>{
        await fetchOpponents()
        await fetchOpponentsYamsState()
    })

</script>

<table>
    <thead>
        <tr>
            <th></th> 
            {#each players as player}
                <th>{player.name}</th>
            {/each}
        </tr>
    </thead>
    <tbody>
        {#each tableRow1 as item, key }
            <tr>
                <th class="item">
                    <p>{item}</p>
                </th>
                {#each playersGameState as playerGameState (`${playerGameState.id}-${key}-${launches}`) }
                    <td> <DiceResult diceResult={playerGameState.listResults[key]} diceResultOwner={playerGameState.id}/> </td>
                {/each}
            </tr>
        {/each}
        <tr>

            <th class="endGameItem">Bonus (>63)</th>
            {#if state === "endGame"}
                {#each playersGameState as playerGameState, key}
                    <td class="endGameItem"> {playerGameState.finalScore.hasBonus ? +35 : 0}</td>
                {/each}
            {/if}
            
        </tr>
        <tr>
            <th class="endGameItem">Total 1</th>
            {#if state === "endGame"}
                {#each playersGameState as playerGameState, key}
                    <td class="endGameItem"> {playerGameState.finalScore.score1}</td>
                {/each}
            {/if}
            
        </tr>
        {#each tableRow2 as item, key}
            <tr>
                <th class="item">
                    <p>{item}</p>
                </th>
                {#each playersGameState as playerGameState (`${playerGameState.id}-${key+tableRow1.length}-${launches}`)}
                    <td> <DiceResult diceResult={playerGameState.listResults[key+tableRow1.length]} diceResultOwner={playerGameState.id}/> </td>
                {/each}
            </tr>
        {/each}
        <tr>
            <th class="endGameItem">Total 2</th>
            {#if state === "endGame"}
                {#each playersGameState as playerGameState, key}
                    <td class="endGameItem"> {playerGameState.finalScore.score2}</td>
                {/each}
            {/if}
        </tr>
        <tr>
            <th class="endGameItem">Total</th>
            {#if state === "endGame"}
                {#each playersGameState as playerGameState, key}
                    <td class="endGameItem"> {playerGameState.finalScore.total}</td>
                {/each}
            {/if}
            
        </tr>
    </tbody>
</table>
    



<style>
    table {
        border-collapse: collapse;
        width: 100%;
        font-size: small;
        background-color: var(--color-bg-box);
    }
    
    th, td {
        border: 1px solid #ddd;
        padding: 2px;
        text-align: center;
    }
    
    thead th {
        font-weight: bold;
    }
    
    tbody th {
        text-align: center;
    }

    
    .endGameItem{
        border-width: 2px;
        /* border-color: brown; */
        color : brown;
        font-weight: bold;
    }


</style>
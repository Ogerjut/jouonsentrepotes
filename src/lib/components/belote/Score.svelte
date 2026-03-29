<script lang="ts">
	import { useBelote } from "$lib/client/games/belote/useBelote.svelte";
	import type { UserBeloteState } from "$lib/types/games/belote";


    const belote = useBelote()
    const table = $derived(belote?.table.gameState)

    const teams = $derived(table?.teams)
    const opponentsGameState = $derived(belote?.opponentsGameState)
    const usersGameState : UserBeloteState[] = $derived([belote?.userGameState, ...opponentsGameState])

    const teamUsernames = $derived.by(() => {
        if (!usersGameState || !teams) return []
        
        return teams.map(t =>
            t.players.map(p =>
                usersGameState.find(u => u.id === p)?.username))
    })

</script>

{#if table && teams}
    <div id="score" style="grid-area: 3 / 3">
        <table>
            <thead>
                <tr>
                    <th>round</th>
                    <td>{teamUsernames[0][0]} & {teamUsernames[0][1]}</td>
                    <td>{teamUsernames[1][0]} & {teamUsernames[1][1]}</td>
                </tr>
            </thead>
            <tbody>
                {#each Object.entries(table.scores) as [round, score] (round) }
                   <tr>
                     <th>{round}</th>
                     <td>{score[teams[0].id]}</td>
                     <td>{score[teams[1].id]}</td>
                    </tr> 
                {/each}
                <tr>
                    <th>Total :</th>
                    <td>{teams[0].score}</td>
                    <td>{teams[1].score}</td>
                </tr>
                
            </tbody>
        </table>

    </div>
{/if}

<style>

    table {
        border-collapse: collapse;
        width: 200px;
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

</style>
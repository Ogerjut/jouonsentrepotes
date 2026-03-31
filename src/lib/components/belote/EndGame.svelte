<script lang='ts'>
	import { useBelote } from "$lib/client/games/belote/useBelote.svelte";
	import type { UserBeloteState } from "$lib/types/games/belote";
	import { leave } from "$lib/client/CoreSocket.svelte";

    
    const belote = useBelote()
    const opponentsGameState = $derived(belote?.opponentsGameState)
    const usersGameState : UserBeloteState[] = $derived([belote?.userGameState, ...opponentsGameState])

    const teams = $derived(belote?.table.gameState.teams)

    const winnerTeam = $derived.by(() => {
        if (!teams) return null
        const teamsScore = teams.map(t => t.score)
        return teams.find(t => t.score === Math.max(...teamsScore))
    })

     const winnerUsernames = $derived.by(() => {
        if (!usersGameState || !winnerTeam) return []
        
        return winnerTeam.players.map(p =>
                usersGameState.find(u => u.id === p)?.username)
    })

    
</script>

<div id="endGame">
    <span>Fin de la partie </span>
    <p>{winnerUsernames[0]} et {winnerUsernames[1]} ont gagné la partie !</p>
    <p>avec un total de {winnerTeam?.score} pts</p>
    <button onclick={() => leave()}>
        Retour au menu
    </button>
    
</div>

<style>
    div{
        background-color: var(--color-bg-box);
        border-radius: 15px;
        text-align: center;
        display: flex;
        flex-direction: column;
        border: var(--border-2);
        width : 250px
        
    }

    span{
        background-color: var(--color-text);
        color : white;
        width : 100%;
        border-top-right-radius: 10px;
        border-top-left-radius: 10px;
        padding: 5px;
    }

    button{
        border-radius : 0px;
        border-bottom-right-radius: 13px;
        border-bottom-left-radius: 13px;
    }

</style>
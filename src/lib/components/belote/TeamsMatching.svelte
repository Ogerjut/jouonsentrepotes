<script lang="ts">
	import { useBelote } from "$lib/client/games/belote/useBelote.svelte";
	import type { UserBeloteState } from "$lib/types/games/belote";
	import { onMount } from "svelte";
	import { fly } from "svelte/transition";


    const belote = useBelote()
    const teams = $derived(belote?.table.gameState.teams)
    const opponentsGameState = $derived(belote?.opponentsGameState)
    const usersGameState : UserBeloteState[] = $derived([belote?.userGameState, ...opponentsGameState])

    const teamUsernames = $derived.by(() => {
        if (!usersGameState || !teams) return []
        
        return teams.map(t =>
            t.players.map(p =>
                usersGameState.find(u => u.id === p)?.username))
    })

    let show = $state(false)
    onMount(() =>{
        show = true
    })

</script>

{#if show && teams}

        <div id='match-box' in:fly={{y : 50, duration : 1000 }}>
            <p id='team' in:fly={{ x: -100, duration: 2000 }}>{teamUsernames[0][0]} & {teamUsernames[0][1]} </p>
            <p id='vs'>VS</p>
            <p id='team' in:fly={{ x: 100, duration: 2000 }}>{teamUsernames[1][0]} & {teamUsernames[1][1]} </p>
        </div>
   
    
{/if}

<style>
    #match-box{
        background: var(--color-bg-box);
        padding: 5px;
        border: var(--border-4);
        border-radius: 15px;
        align-items: center;
        justify-content: center;
        text-align: center;
        color : var(--color-text-2);
        /* width: 200px; */
        min-width : 150px;
        height : 150px;
        font-weight: bold;
        gap: 5px;
        display: flex;
        flex-direction: column;
       
    }

    #team{
        /* color : var(--color-text); */
        color : white;
        font-size: larger;
        background-color: var(--color-text-2);
        border-radius: 5px;
        padding: 5px;

    }

    
</style>
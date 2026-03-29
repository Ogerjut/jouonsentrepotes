<script lang="ts">
	import { fetchOpponentsBeloteState, useBelote } from "$lib/client/games/belote/useBelote.svelte";
	import { onMount } from "svelte";
	import UserBeloteCard from "./UserBeloteCard.svelte";

    const belote = useBelote()
    
    const userGameState = $derived(belote?.userGameState)

    let playersGameState = $derived([userGameState, ...(belote?.opponentsGameState || [])])
    const teams = $derived(belote?.table.gameState.teams)

    let playersOrdered = $derived.by(() => {
        const ids = belote?.table.playersId
        if (!ids) return []
        return ids.map(id => playersGameState.find(u => u?.id === id) || undefined)
    })

    let myIndex = $derived.by(() =>
        playersOrdered.findIndex(p => p?.id === belote?.me.id)
    )

    let playersRelative = $derived.by(() => {
        if (!playersOrdered.length) return []

        return [
            playersOrdered[(myIndex + 0) % 4], // moi → bottom
            playersOrdered[(myIndex + 1) % 4], // droite
            playersOrdered[(myIndex + 2) % 4], // haut
            playersOrdered[(myIndex + 3) % 4]  // gauche
        ]
    })


    let playersByTeam = $derived.by(()=>{
        const ids = belote?.table.playersId
        if (!teams || !ids ) return []
        const myIndex = ids.findIndex(id => id === belote?.me.id)
        const players = ids.map(id => playersGameState.find(u => u?.id === id) || undefined)

        return [
            players[(myIndex + 0) % 4], // moi → bottom
            players[(myIndex + 1) % 4], 
            players[(myIndex + 2) % 4], 
            players[(myIndex + 3) % 4], 

        ]
    })

    onMount(async ()=> {
        await fetchOpponentsBeloteState()
    })

</script>

{#if teams}

    <div class="player" style="grid-area: 2 / 3;">
        <UserBeloteCard username = {playersByTeam[1]?.username} userGameState = {playersGameState.find(u => u?.id === playersByTeam[1]?.id)!}/>
    </div>

    <div class="player" style="grid-area: 1 / 2;">
        <UserBeloteCard username = {playersByTeam[2]?.username} userGameState = {playersGameState.find(u => u?.id === playersByTeam[2]?.id)} />
    </div>

    <div class="player" style="grid-area: 2 / 1;">
        <UserBeloteCard username = {playersByTeam[3]?.username} userGameState = {playersGameState.find(u => u?.id === playersByTeam[3]?.id)} />
    </div>

    <div class="player" style="grid-area: 3 / 2;">
        <UserBeloteCard username = {playersByTeam[0]?.username} userGameState = {playersGameState.find(u => u?.id === playersByTeam[0]?.id)}/>
    </div>

{:else}
    
    <div class="player" style="grid-area: 2 / 3;">
        <UserBeloteCard username = {playersRelative[1]?.username} userGameState = {playersGameState.find(u => u?.id === playersRelative[1]?.id)}/>
    </div>

    <div class="player" style="grid-area: 1 / 2;">
        <UserBeloteCard username = {playersRelative[2]?.username} userGameState = {playersGameState.find(u => u?.id === playersRelative[2]?.id)} />
    </div>

    <div class="player" style="grid-area: 2 / 1;">
        <UserBeloteCard username = {playersRelative[3]?.username} userGameState = {playersGameState.find(u => u?.id === playersRelative[3]?.id)} />
    </div>

    <div class="player" style="grid-area: 3 / 2;">
        <UserBeloteCard username = {playersRelative[0]?.username} userGameState = {playersGameState.find(u => u?.id === playersRelative[0]?.id)}/>
    </div>
{/if}



<style>
    .player{
        display: flex;
        align-items: center;
    }
</style>
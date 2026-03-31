<script lang="ts">
	import { fetchOpponentsTarotState, useTarot } from "$lib/client/games/tarot/useTarot.svelte";
	import { onMount } from "svelte";
	import UserTarotCard from "./UserTarotCard.svelte";

    const tarot = useTarot()
    // $inspect("tarot /player seat", tarot)
    
    const userGameState = $derived(tarot?.userGameState)

    let playersGameState = $derived([userGameState, ...(tarot?.opponentsGameState || [])])

    let playersOrdered = $derived.by(() => {
        const ids = tarot?.table.playersId
        if (!ids) return []
        return ids.map(id => playersGameState.find(u => u?.id === id) || undefined)
    })

    let myIndex = $derived.by(() =>
        playersOrdered.findIndex(p => p?.id === tarot?.me.id)
    )

    let playersRelative = $derived.by(() => {
        if (!playersOrdered.length) return []

        return [
            playersOrdered[(myIndex + 0) % 5], // moi → bottom
            playersOrdered[(myIndex + 1) % 5], // droite
            playersOrdered[(myIndex + 2) % 5], // haut
            playersOrdered[(myIndex + 3) % 5],  // gauche
            playersOrdered[(myIndex + 4) % 5]  // gauche
        ]
    })

    // $inspect("players ordered / relative :",playersOrdered, playersRelative)
    // $inspect('playersGameState : ', playersGameState)

    onMount(async ()=> {
        await fetchOpponentsTarotState()
    })

</script>

<div class="player" style="grid-area: 2 / 3;">
    <UserTarotCard username = {playersRelative[1]?.username!} userGameState = {playersGameState.find(u => u?.id === playersRelative[1]?.id)!}/>
</div>

<div class="player" style="grid-area: 1 / 3;">
    <UserTarotCard username = {playersRelative[2]?.username!} userGameState = {playersGameState.find(u => u?.id === playersRelative[2]?.id)!} />
</div>

<div class="player" style="grid-area: 1 / 1;">
    <UserTarotCard username = {playersRelative[3]?.username!} userGameState = {playersGameState.find(u => u?.id === playersRelative[3]?.id)!} />
</div>

<div class="player" style="grid-area: 2 / 1;">
    <UserTarotCard username = {playersRelative[4]?.username!} userGameState = {playersGameState.find(u => u?.id === playersRelative[4]?.id)!}/>
</div>

<div class="player" style="grid-area: 3 / 2;">
    <UserTarotCard username = {playersRelative[0]?.username!} userGameState = {playersGameState.find(u => u?.id === playersRelative[0]?.id)!}/>
</div>


<style>
    .player{
        display: flex;
        align-items: center;
    }
</style>
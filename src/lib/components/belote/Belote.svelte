<script lang='ts'>
    import ActivePlayerPanel from '$lib/components/ActivePlayerPanel.svelte';
	import { onDestroy, onMount } from 'svelte';
    import { beforeNavigate} from '$app/navigation'
    import PlayerSeat from '$lib/components/belote/PlayerSeat.svelte';
	import Table from '$lib/components/Table.svelte';
    import Card from '$lib/components/belote/Card.svelte'
	import type { UserBeloteState } from '$lib/types/games/belote.js';
	import { initBeloteState, initBeloteSocket, type Belote, useBelote, destroyBeloteSocket } from '$lib/client/games/belote/useBelote.svelte.js';
	import type { BeloteTable } from '$lib/types/table.js';
	import { socket } from '$lib/client/socket.js';
	import Auction from '$lib/components/belote/Auction.svelte';
	import { initTimerListerner } from '$lib/client/games/hook/useTimer.svelte.js';
	import Round from '$lib/components/Round.svelte';
	import ShowRoundScore from '$lib/components/belote/ShowRoundScore.svelte';
	import RoundInfo from '$lib/components/belote/RoundInfo.svelte';
	import type { PageProps } from '../../../routes/games/belote/[id]/$types';
	import TeamsMatching from './TeamsMatching.svelte';
	import Score from './Score.svelte';
	import BeloteEvent from './BeloteEvent.svelte';
	import EndGame from './EndGame.svelte';
	import { sendLeaveTable } from '$lib/client/coreModale.svelte';


   let {data} : PageProps = $props()
    
    let belote = $state<Belote | null>(null)
    let tableState = $derived(belote?.table.gameState)

    // let dialog = $state()

    onMount(async () => {
        if (data.user && data.table.gameType === 'belote'){
			await initBeloteState(data.table as BeloteTable, data.user, data.userBeloteState as UserBeloteState)
			initBeloteSocket()
            initTimerListerner()
			belote = useBelote()
		}
		if (belote){
			socket.emit("joinTable", belote.table.id)
		}
		console.log('Belote.svelte mounted')
    })

    beforeNavigate((nav)=>{
            console.log(nav.type)
            if (nav.type === "leave" || nav.type === "goto") return
            if (belote && !nav.to?.url.pathname.startsWith(`games/belote/${belote.table.id}`) && nav.to?.url.pathname ){
                if (belote.table.ready){
                    nav.cancel()
                    sendLeaveTable()
                } else {
                    socket.emit("leaveTable")
                }
            }
    })

    onDestroy(()=>{
        destroyBeloteSocket()
    })
    
</script>

 {#if belote}
    <div >
        <div id="game-container">
            <div id="table-area">
            <!-- <i>{tableState?.state} mode</i> -->
            <Table/>
            <PlayerSeat/>
        
            <div style="grid-area: 2 / 2;">
                    {#if !belote.table?.ready }
                        <ActivePlayerPanel table={belote?.table} me={belote.me}/>
                    {:else}

                        {#if tableState?.state === 'auction'}
                            <div id='auction-container'>
                                <Auction />
                            </div>
                        {/if}

                        {#if tableState?.state === 'teams'}
                                <TeamsMatching />
                        {/if}
                
                        {#if tableState?.state === 'round'}
                                <Round game={belote} />
                                <BeloteEvent />
                        {/if}
                        {#if tableState?.state === 'endRound'}
                                <ShowRoundScore />
                        {/if}
                    {/if}

                    {#if belote.table?.completed && tableState?.state === 'endGame'}
                        <EndGame />
                    {/if}
            </div>
            
            {#if tableState?.state === 'round'}
                <RoundInfo game={belote}  />
            {/if}
        </div>

       <Score/>  
        
        </div>
         {#if belote?.userGameState.hand}
            <div id="hand-area">
            {#each belote?.userGameState.hand as card (`${card.value}:${card.suit}`)}
                <Card value={card.value} suit={card.suit}/> 
            {/each}
            </div>
        {/if}
    
        
    </div>
   
{/if} 




<!-- <Modale
    bind:dialog
    text={"Veux-tu vraiment quitter la table en cours ?"}
    action={"Quitter la table"}
    onaction={()=>quitTable()}
    /> -->


<style>
    #table-area{
        display: grid;
        grid-template-columns: 0.1fr 0.1fr 0.1fr;
        grid-template-rows: 0.1fr 1fr 0.1fr 0.1fr;
        align-items: center;
        justify-items: center;
        
    }

    #hand-area {
        display : flex;
        flex-direction:row;
        padding: 3px;
        border-radius: 5px;
        justify-content: center;
        flex-wrap: wrap;
        width: 100%;
        background: var(--color-bg-box);
        margin-top: -22px;
        border : var(--border-4);
        min-height : 112px;
        
        
    }


    #auction-container {
        display: flex;
        align-items: center;
        gap : 3px;
    }

    #game-container{
        display : flex;

    }



</style>
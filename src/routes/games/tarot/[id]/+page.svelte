<script lang='ts'>
    import ActivePlayerPanel from '$lib/components/ActivePlayerPanel.svelte';
	import { onDestroy, onMount } from 'svelte';
    import { beforeNavigate} from '$app/navigation'
    import PlayerSeat from '$lib/components/tarot/PlayerSeat.svelte';
	import Table from '$lib/components/Table.svelte';
    import Card from '$lib/components/tarot/Card.svelte'
	import type { UserTarotState } from '$lib/types/games/tarot.js';
	import { initTarotState, initTarotSocket, type Tarot, useTarot, destroyTarotSocket } from '$lib/client/games/tarot/useTarot.svelte.js';
	import type { TarotTable } from '$lib/types/table.js';
	import { socket } from '$lib/client/socket.js';
	import Auction from '$lib/components/tarot/Auction.svelte';
	import SetupDog from '$lib/components/tarot/SetupDog.svelte';
	import HandfulSlam from '$lib/components/tarot/HandfulSlam.svelte';
	import ShowHandful from '$lib/components/tarot/ShowHandful.svelte';
	import { initTimerListerner } from '$lib/client/games/hook/useTimer.svelte.js';
	import Round from '$lib/components/Round.svelte';
	import EndGame from '$lib/components/EndGame.svelte';
	import ShowRoundScore from '$lib/components/tarot/ShowRoundScore.svelte';
	import RoundInfo from '$lib/components/tarot/RoundInfo.svelte';
	import { sendLeaveTable } from '$lib/client/coreModale.svelte.js';
	import PlayerSeat5P from '$lib/components/tarot/PlayerSeat5P.svelte';
	import KingCall from '$lib/components/tarot/KingCall.svelte';


   let {data} = $props()
    
    let tarot = $state<Tarot | null>(null)
    let tableState = $derived(tarot?.table.gameState)

    onMount(async () => {
        if (data.user && data.table.gameType === 'tarot'){
			await initTarotState(data.table as TarotTable, data.user, data.userTarotState as UserTarotState)
			initTarotSocket()
            initTimerListerner()
			tarot = useTarot()
		}
		if (tarot){
			socket.emit("joinTable", tarot.table.id)
		}
		console.log('Tarot.svelte mounted')
    })

    beforeNavigate((nav)=>{
            console.log(nav.type)
            if (nav.type === "leave" || nav.type === "goto") return
            if (tarot && !nav.to?.url.pathname.startsWith(`games/tarot/${tarot.table.id}`) && nav.to?.url.pathname ){
               if (tarot.table.ready){
                    nav.cancel()
                    sendLeaveTable()
                } else {
                    socket.emit("leaveTable")
                }
            }
    })

    onDestroy(()=>{
        destroyTarotSocket()
    })
        
</script>

 {#if tarot}
    <div id="game-container">
        <div id="table-area">
            <i>{tableState?.state} mode</i>
            <p>Round : {tableState?.round} / {tableState?.maxRound} </p>
            <Table/>

            {#if tarot.table.maxPlayers === 4}
                <PlayerSeat/>
            {:else}
                <PlayerSeat5P/>
            {/if}
            
        
            <div style="grid-area: 2 / 2;">
                
                    {#if !tarot.table?.ready }
                        <ActivePlayerPanel table={tarot?.table} me={tarot.me}/>
                    {:else}

                        {#if tableState?.state === 'auction'}
                            <div id='auction-container'>
                                <Auction />
                            </div>
                        
                        {/if}
                        {#if tableState?.state === 'kingCall' && tarot.table.maxPlayers === 5}
                            <KingCall />
                        {/if}
                        {#if tableState?.state === 'afterAuction' && tableState?.actualBid < 3}
                            <div id='chien-container'>
                                <SetupDog />
                            </div>
                        
                        {/if}
                        {#if tableState?.state === 'beforeRound'}
                                <HandfulSlam />
                        {/if}
                        {#if tableState?.state === 'showHandful'}
                                <ShowHandful />
                        {/if}
                        {#if tableState?.state === 'round'}
                                <Round game={tarot} />
                        {/if}
                        {#if tableState?.state === 'afterRound'}
                                <ShowRoundScore />
                        {/if}
                    {/if}

                    {#if tarot.table?.completed && tableState?.state === 'endGame'}
                        <EndGame game={tarot} />
                    {/if}
            </div>
            
            {#if tableState?.state === 'round'}
                <RoundInfo game={tarot}  />
            {/if}
           

        </div>

        {#if tarot?.userGameState.hand}
            <div id="hand-area">
            {#each tarot?.userGameState.hand as card (`${card.value}-${card.suit}`)}
                <Card value={card.value} suit={card.suit}/> 
            {/each}
            </div>
        {/if}
            
    

    </div>
{/if}    


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

    #chien-container{
        background: var(--color-bg-box);
        padding: 10px;
        border:var(--border-4);
        border-radius: 15px;
        justify-items: center;
        justify-content: center;
    }

</style>
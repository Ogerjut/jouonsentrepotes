<script lang='ts'>
	import { beforeNavigate } from "$app/navigation";
	import { destroyChessSocket, initChessSocket, initChessState, useChess, type Chess } from "$lib/client/games/chess/useChess.svelte";
	import { socket } from "$lib/client/socket";
	import type { UserChessState } from "$lib/types/games/chess";
	import type { ChessTable } from "$lib/types/table";
	import { onDestroy, onMount } from "svelte";
	import type { PageProps } from "../../../routes/games/chess/[id]/$types";
	import ChessBoard from "./ChessBoard.svelte";
	import ActivePlayerPanel from "../ActivePlayerPanel.svelte";
	import PlayerInfo from "./PlayerInfo.svelte";
	import ChessGameInfo from "./ChessGameInfo.svelte";
	import PawnPromotion from "./PawnPromotion.svelte";
	import Modale from "../Modale.svelte";
	import { useModale } from "$lib/client/games/hook/useModale.svelte";
	import EndGame from "./EndGame.svelte";
	import { getCoreActionsModale, sendLeaveTable } from "$lib/client/coreModale.svelte";
	// import { sendLeaveTable } from "$lib/client/coreModale.svelte";
    
    let {data} : PageProps = $props()
    
    let chess = $state<Chess | null>(null)
    const opponent = $derived(chess?.opponentsGameState[0])
    const user = $derived(chess?.userGameState)
    const tableState =  $derived(chess?.table.gameState.state)
    const modale = useModale()

    // function sendLeaveTable(){
    //     modale.show(
    //         "Quitter la partie",
    //         "Es-tu sûr de vouloir quitter la partie en cours ?\n Une défaite te sera comptée.",
    //         getCoreActionsModale(["leave", "cancel"])
    //     )
    // }

    onMount(async () => {
        if (data.user && data.table.gameType === 'chess'){
            initChessSocket()
			await initChessState(data.table as ChessTable, data.user, data.userChessState as UserChessState)
			chess = useChess()
		}
		if (chess){
			socket.emit("joinTable", chess.table.id)
		}
		console.log('Chess.svelte mounted')
    })

    beforeNavigate((nav)=>{
            console.log(nav.type)
            if (nav.type === "leave" || nav.type === "goto") return
            if (chess && !nav.to?.url.pathname.startsWith(`games/chess/${chess.table.id}`) && nav.to?.url.pathname){
                if (chess.table.ready){
                    nav.cancel()
                    sendLeaveTable()
                } else {
                    socket.emit("leaveTable")
                }
                
            }
    })

    onDestroy(() => {
        destroyChessSocket()
    })

</script>


{#if chess}
    <div id="game-container">
        
        <div id="game-board">
            <PlayerInfo username={opponent?.username} team = {opponent?.team}/>

            <ChessBoard />

            {#if !chess?.table.ready }
                <div class="overlay">
                    <ActivePlayerPanel table={chess.table} me={chess.me}/>
                </div>
            {/if}
            
            <PlayerInfo username={user?.username} team = {user?.team} />
            

            {#if tableState === "pawnPromotion"}
            <div class="overlay">
                 <PawnPromotion />
            </div>
               
            {/if}

             {#if tableState === "endGame"}
                <div class="overlay">
                    <EndGame />
                </div>
            {/if}

            {#if modale.visible}
                <div class="overlay">
                    <Modale 
                    title={modale.data.title}
                    message={modale.data.message}
                    actions={modale.data.actions}
                />
                </div>
                
            {/if}

        </div>
        
        {#if tableState !== "created" }
            <ChessGameInfo/>
        {/if}
    
    </div>
    
{/if} 


<style>
    #game-container{
        display : flex;
        position: relative;
        width: fit-content;
        align-items : center;
        justify-content: center;

    }

    #game-board{
        display: flex;
        flex-direction: column;
        align-items : center;
        justify-content: center;
    }

    .overlay{
        position:absolute;
        z-index: 10;
        inset : 0;
        display: flex;
        justify-content: center;
        align-items: center;
        pointer-events: all;
        backdrop-filter: blur(1px);
    }



</style>
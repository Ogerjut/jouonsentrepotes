<script lang="ts">
	import { onDestroy, onMount } from "svelte";
	import { beforeNavigate } from "$app/navigation";
	import { destroyYamsSocket, initYamsSocket, initYamsState, useYams, type Yams } from "$lib/client/games/yams/Yams.svelte";
	import { socket } from "$lib/client/socket";
	import type { YamsTable } from "$lib/types/table.js";
	import ActivePlayerPanel from "$lib/components/ActivePlayerPanel.svelte";
	import Arena from "$lib/components/yams/Arena.svelte";
	import Scores from "$lib/components/yams/Scores.svelte";
	import type { UserYamsState } from "$lib/types/games/yams.js";
	import YamsInfos from "$lib/components/yams/YamsInfos.svelte";
	import { sendLeaveTable } from "$lib/client/coreModale.svelte.js";

	let {data} = $props()

	let yams = $state<Yams | null>(null)
	
	onMount(async () => {
		if (data.user && data.table.gameType === 'yams'){
			await initYamsState(data.table as YamsTable, data.user, data.userYamsState as UserYamsState)
			initYamsSocket()
			yams = useYams()
		}
		if (yams){
			socket.emit("joinTable", yams.table.id)
			
		}
		console.log('Yams.svelte mounted')
		
	})

	beforeNavigate((nav)=>{
		console.log(nav.type)
        if (nav.type === "leave" || nav.type === "goto") return
        if (yams && !nav.to?.url.pathname.startsWith(`games/yams/${yams.table.id}`) && nav.to?.url.pathname ){
			if (yams.table.ready){
                    nav.cancel()
                    sendLeaveTable()
                } else {
                    socket.emit("leaveTable")
                }
        }
    })

	onDestroy(()=>{
        destroyYamsSocket()
    })
    

</script>

<div id="game-container">
	{#if yams && !yams?.table.ready }
		<ActivePlayerPanel table={yams.table} me={yams.me}/>
    {/if}

	{#if yams?.table.ready}
		
		<div id="game-arena">
			<Arena/>
			<YamsInfos />
			
		</div>
		<div id="scores">
			<Scores />	
		</div>
		
    {/if}
</div>


<style>
	#game-container{
		display: flex;
		align-items: center;
		width: 100%;
		justify-content: center;
		gap: 10px;
	}

	#game-arena{
		width: 50%;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
</style>





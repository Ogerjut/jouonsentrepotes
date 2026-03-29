<script lang="ts">
	import { useChess } from "$lib/client/games/chess/useChess.svelte";
	import { onDestroy, onMount } from "svelte";

    let {team} = $props()

	let now = $state(Date.now())
	let interval : NodeJS.Timeout | undefined = $state()
	

	const chess = useChess()
	const timerMinute = $derived(chess?.table.gameState.timer)
	// const remainingTime = $derived(team === "white" ? chess?.clocksData?.whiteRemainingTime : chess?.clocksData?.blackRemainingTime)

	const {textColor, bg} = $derived.by(() => {
		if (team === "white"){
		return {textColor : "brown", bg : "white"}
	} else {
		return {textColor : "white", bg : "brown"}
	}
	})

	onMount(() => {
		interval = setInterval(() => {
			now = Date.now()
		}, 200)	
	})

	onDestroy(() => {
		if (!interval) return 
		clearInterval(interval)
	})
	
	const remainingTime = $derived.by(() => {
		if (!chess?.clocksData) return null

		// const now = Date.now()
		const elapsed = now - chess.clocksData.serverDate

		let time = team === "white"
			? chess.clocksData.whiteRemainingTime
			: chess.clocksData.blackRemainingTime

		if (chess.clocksData.current === team) {
			time -= elapsed
		}

		if (time <= 0 || chess.table.completed){
			clearInterval(interval)
			return null
		}

	
		return Math.max(0, time)
	})



	function format(time : number) {
		const t = Math.floor(time)
		let min = String(Math.floor(t / 60)).padStart(2, '0');
		let sec = String(t % 60).padStart(2, '0');
		return `${min}:${sec}`;
	}
	
</script>

{#if timerMinute}
	<div style="--bg : {bg} ; --textColor : {textColor}" id="timer">
	<!-- <strong>{duration ? format(duration/1000) : format(timerMinute*60)} </strong>  -->
	<strong>{remainingTime ? format(remainingTime/1000) : format(timerMinute*60)} </strong> 

</div>
{/if}

<style>
	#timer {
		color: var(--textColor);
		font-size: large;
		padding: 2px;
		background-color: var(--bg);
		border: 2px solid orange;
		border-radius: 10px;
	}

	div{
		user-select: none;
	}
</style>






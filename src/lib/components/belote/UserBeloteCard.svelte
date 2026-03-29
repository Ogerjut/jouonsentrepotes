<script lang='ts'>
	import { useTimer } from '$lib/client/games/hook/useTimer.svelte';
	import { useBelote } from '$lib/client/games/belote/useBelote.svelte';
	import type { UserBeloteState } from '$lib/types/games/belote';
	import CircularProgressBar from '../CircularProgressBar.svelte';
	import MiniCard from './MiniCard.svelte';

	interface BeloteCardProps {
		username : string,
		userGameState : UserBeloteState
	}

	let { username, userGameState }: BeloteCardProps = $props()

	const belote = useBelote()
	const timer = useTimer()
    const table = $derived(belote?.table)
    const isCurrentPlayer = $derived(table?.gameState.currentPlayer === userGameState?.id)
	const isTargetedUserId = $derived(userGameState?.id === timer.targetUserId)
	
</script>

<div id="user-card">
	<p class="username">{username ?? "siège vide"}</p>
	<hr />
	{#if belote?.me && userGameState}
	<div class="user-bottom">
		<div class="user-info">
			{#if table?.gameState.state === "auction" && isCurrentPlayer}
				<i>Parie...</i> 
			{:else if table?.gameState.state === "auction" && userGameState.hasBid}
				<i>A parlé...</i>
			{:else if table?.gameState.state === "round" &&  isCurrentPlayer}
				<i>Joue...</i>

			{:else if table?.gameState.state === "round" && userGameState.hasPlayed && userGameState.playedCard}
				<MiniCard value={userGameState.playedCard.value} suit={userGameState.playedCard.suit} />
			{/if}
		</div>
	</div>
	{/if}
	
	
</div>


<div id="badge">

	{#if userGameState && userGameState.hasTaken}
		<div>
			<p id="badge-preneur">P</p>
		</div>
	{/if}

	{#if isTargetedUserId && table?.gameState.state === "round"}
		<CircularProgressBar />
	{/if}

</div>





<style>
	#user-card {
		border: var(--border-4);
		border-radius: 10px;
		max-width: 150px;
		width: 130px;
		padding: 6px;
		margin: 5px;
		background: var(--color-bg-box);
		display: flex;
		flex-direction: column;
		justify-content: space-auctionween;
	}

	.username {
		text-align: center;
		font-weight: bold;
		color : black
	}

	hr {
		border: none;
		border-top: var(--border-1);
		margin: 4px;
	}

	.user-bottom {
		display: flex;
		justify-content: space-auctionween;
		align-items: center;
		gap: 8px;
	}

	.user-info {
		flex: 1;
		text-align: left;
		font-size: 0.9rem;
	}

	#badge-preneur {
		background: blueviolet;
		color: white;
		border-radius: 50%;
		text-align: center;
		font-size: 1.1rem;
		font-weight: bold;
		width: 30px;
		font-family: "Kurale" ;
		box-shadow: 1px 1px 2px grey;
	
	}

	#badge{
		display: flex;
		flex-direction: column;
		gap: 5px;
		padding: 5px;
	}



</style>

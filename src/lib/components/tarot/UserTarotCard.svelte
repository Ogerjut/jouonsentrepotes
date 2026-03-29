<script lang='ts'>
	import { useTimer } from '$lib/client/games/hook/useTimer.svelte';
	import { useTarot } from '$lib/client/games/tarot/useTarot.svelte';
	import type { UserTarotState } from '$lib/types/games/tarot';
	import CircularProgressBar from '../CircularProgressBar.svelte';
	import MiniCard from './MiniCard.svelte';

	interface TarotCardProps {
		username : string,
		userGameState : UserTarotState
	}

	let { username, userGameState }: TarotCardProps = $props()

	const tarot = useTarot()
	const timer = useTimer()
    const table = $derived(tarot?.table)
    const isCurrentPlayer = $derived(table?.gameState.currentPlayer === userGameState?.id)
	const isTargetedUserId = $derived(userGameState?.id === timer.targetUserId)
	const auctionConvertion : Record<number, string> = {
		0 : "a passé",
        1 : "prise",
        2 : "garde",
        3 : "garde sans",
        4 : "garde contre"
    }


</script>

<div id="user-card">
	<p class="username">{username ?? "siège vide"}</p>
	<hr />
	{#if tarot?.me && userGameState}
	<div class="user-bottom">
		<div class="user-info">
			{#if table?.gameState.state === "auction" && isCurrentPlayer}
				<i>Parie...</i> 
			{:else if table?.gameState.state === "auction" && userGameState.hasBid && userGameState.bid}
				<p>{auctionConvertion[userGameState.bid] }</p> 
			{:else if table?.gameState.state === "round" &&  isCurrentPlayer}
				<i>Joue...</i>

			{:else if table?.gameState.state === "round" && userGameState.hasPlayed && userGameState.playedCard}
				<MiniCard value={userGameState.playedCard.value} suit={userGameState.playedCard.suit} />
			{/if}
		</div>
		<div class="score">
			<p>{userGameState.score || 0} pts</p>
		</div>
	</div>
	{/if}
	
	
</div>


<div id="badge">

	{#if userGameState && userGameState.hasTaken && userGameState.bid}
		<div>
			<p id="badge-preneur">P</p>
			<p class="text-badge"> {auctionConvertion[userGameState.bid]}</p>
		</div>
	{/if}

	{#if userGameState && userGameState.declaredSlam}
		<div>
			<p id="badge-chelem">C</p>
			<p class="text-badge">Chelem</p>
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

	.score {
		text-align: right;
		font-style: italic;
		color : var(--color-text-2)
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

	#badge-chelem {
		background: orangered;;
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

	.text-badge{
		font-size: small;
		margin-top: -3px;
		
	}


</style>

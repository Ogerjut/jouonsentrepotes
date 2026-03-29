<script lang="ts">
	
    let {inviter, gameType, onAccept, onDecline} = $props()

</script>

<div id="invite-modal">
    <p>{inviter} t'invite à rejoindre une partie de {gameType} !</p>
    <div id="button-modal">
    <button onclick={onAccept}>Accepter</button>
    <button onclick={onDecline}>Refuser</button>
    </div>
</div>

<style>
	


	#invite-modal {
		display: flex;
		position: absolute;
		border : var(--border-1);
		padding : 15px;
		border-radius : 15px;
		flex-direction: column;
		justify-self: center;
		background: var(--color-bg-box);
	}

	#button-modal{
		display: flex;
		justify-content: space-around;
		padding: 3px;
	}


  
</style>
<script lang="ts">
	import '../app.css';
	import jouonsentrepotes from '$lib/assets/jouonsentrepotes-icon.png'
	import { onMount } from 'svelte';

	import Header from '$lib/components/Header.svelte';
	import { initCoreSocket } from '$lib/client/CoreSocket.svelte';
	import Invitation from '$lib/components/Invitation.svelte';
	import { useInvitation } from '$lib/client/games/hook/useInvitation.svelte';
	import { useToast } from '$lib/client/games/hook/useToast.svelte';
	import Toast from '$lib/components/Toast.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { useModale } from '$lib/client/games/hook/useModale.svelte';
	import Modale from '$lib/components/Modale.svelte';
	
	let { children, data } = $props();
	const invitation = useInvitation()
	const toast = useToast()
	const modale = useModale()

	// toast.data.visible = true
	// toast.data.message = "test toast"

	onMount(() => {
		const cleanup = initCoreSocket()
		return ()=>{
			cleanup()
		}
	})

</script>

<svelte:head>
	<link rel="icon" href={jouonsentrepotes} />
</svelte:head>

<Header {data} />



<main>
	{@render children?.()}

	{#if invitation.show && invitation.data}
    <Invitation 
      inviter={invitation.data.from}
      gameType={invitation.data.gameType}
      onAccept={() => invitation.accept()}
      onDecline={() => invitation.decline()}
    />
  	{/if}

	{#if toast.data.visible && toast.data.message}
		<Toast 
			message = {toast.data.message}
		/>
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
	
	
</main>


<Footer/>


<style>
	
	main {
		background-color : antiquewhite;
		display : flex;
		flex-direction: column;
		min-height: 400px;
		min-width: 400px;
		width : 700px;
		border-radius: 10px;
		margin-top: 5px;
		justify-content: center;
		align-items: center;
		
	
		
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


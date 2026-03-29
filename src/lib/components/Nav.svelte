<script lang='ts'>
	import LogOut from "@lucide/svelte/icons/log-out"
    import { enhance } from "$app/forms";
	import type { PageData } from '../../routes/$types';
	import { socket } from '$lib/client/socket';

	interface NavProp {
		data : PageData
	}
	
    let {data} : NavProp = $props()
    
    const MENU = [
        {name : "menu", url : "/"},
        {name : "tarot", url : "/games/tarot"},
		{name : "belote", url : "/games/belote"},
		{name : "yam's", url : "/games/yams"},
		{name : "échec", url : "/games/chess"},
		{name : "chat", url : "/chat"},
		{name : "compte", url : "/dashboard"},
    ]


	let signout = $state(false)


</script>

{#if data.user}
	<nav id="main-navbar">
		<form method="POST" action="/?/signout"
            use:enhance ={() => {
                signout = true
            return async ({ update }) => {
                await update()
                signout = false
				socket.disconnect()
                };
        }}>
        <button id="logout" type="submit" disabled={signout}> <LogOut/> </button>
        </form>

		{#each MENU as link (link.name) }
			<a class='link-nav' href={link.url}>{link.name.toUpperCase()}</a>
		{/each}
		{#if data.user.role ==="admin"}
            <a class='link-nav' href="/admin"> ADMIN </a>
        {/if}
	</nav>
{/if}

<style>
	#logout{
		background-color: red;
		color : white;
	}

	#logout:hover {
		box-shadow: 0px 0px 15px brown;
	}

	#main-navbar{
		display: flex;
		gap: 2px;
		background-color: var(--color-bg);
		margin-top: 3px;
		margin-bottom: 3px;
		border-radius: 10px;
		padding: 5px;
	}

	.link-nav{
		background-color: var(--color-text-2);
		padding: 10px;
		color: var(--color-bg);
		border-radius:10px;
		text-align: center;
		
	}

	.link-nav:first-child{
		margin-left: 1px;
	}

	.link-nav:hover{
		box-shadow: 0px 0px 10px maroon;
		color: darkgoldenrod;
	}

</style>
<script lang='ts'>
    import Title from "./Title.svelte";
	import logo from '$lib/assets/logo.png'
	import type { PageData } from "../../routes/$types";
	import { usePresence } from "$lib/client/games/hook/usePresence.svelte";
	import  Circle from "@lucide/svelte/icons/circle";
	import Nav from "./Nav.svelte";

    interface HeaderProp {
        data : PageData
    }

    let {data} : HeaderProp = $props()

    const presence = usePresence()

</script>

<header>

    <div id="header-head">
        <div id="title-logo">
            <img src={logo} alt="logo">
            <Title />
        </div>
   
        {#if data.user}
            <div id="user-info">
                <p > {data.user.name}</p>
                {#if data.user?.role === "admin"}
                <p>Admin mode</p>
                {/if}
                <div class="presence"> 
                    {#if presence.online}
                        <Circle color="lime" fill="lime" size={20}/>
                    {/if}
                    {#if presence.inGame}
                        <Circle color="blue" fill="blue" size={20}/>
                    {/if}
                </div>
                
            </div>
        {/if}
    </div>

    <Nav {data} />


</header>


<style>
  
	header{
		display: flex;
        flex-direction: column;
        /* border : 1px solid black; */
        width : 100%;
        /* justify-self: start; */
        align-self: start;
        /* align-items: flex-start; */
		/* align-content: center; */
		/* background-color:var(--color-bg); */
		/* align-items:center; */
        /* justify-content: space-between; */
        /* align-content: space-between; */
        /* gap: 100px;
        margin-top: 5px;
        align-self: center;
        justify-self: center; */
       
	}

    #header-head, #title-logo{
        display: flex;
        align-items: center;
    }

    #header-head{
        justify-content: space-between;
        /* border : 1px solid black; */
        
    }

    #title-logo{
        /* border : 1px solid black; */
        gap: 10px;
    }

    #user-info{
        display: flex;
		text-align: center;
        justify-items : center;
        align-items : center;
        justify-content : center;
        align-content : center;
		min-width: 100px;
        height : 50px;
        gap: 15px;
        border : 1px solid var(--color-text);
        background: antiquewhite;
        border-radius: 15px;

	}

    img{
        zoom : 0.2;
    }

    .presence{
        display : flex;
    }

</style>
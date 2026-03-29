<script lang="ts">
	import type { ModaleData } from "$lib/client/games/hook/useModale.svelte";
	import { onMount } from "svelte";

    
    let {title, message, actions} : ModaleData =  $props()

    onMount(()=> {
        console.log("modale mounted")

    })

</script>

<div id="modale">
    <h1><b><u>{title}</u></b></h1>
    <p>{message}</p>
    {#if actions.length}
        <div class="actions">
            {#each actions as action, i (i)}
                <button class="btnactions" onclick={action.onclick}> {action.name}</button>
            {/each}
        </div>
        
    {/if}
    </div>

<style>
    #modale{
        position : absolute;
        display: flex;
        flex-direction: column;
        align-items: center;
        background-color: var(--color-bg);
        pointer-events: all;
        backdrop-filter: blur(2px);
        border-radius: 10px;
        padding: 10px;
        gap: 10px;
        width: 300px;
        text-align: center;

    }

    .actions{
        display: flex;
        align-self: normal;
        justify-content: space-around;
    }

</style>
<script lang="ts">
	import { useToast } from "$lib/client/games/hook/useToast.svelte";

    let {message} = $props()

    const toast = useToast()

</script>

<div id="toast">
    <div id="toast-body"> {message}</div>
    <button onclick={() => toast.close()}>Ok</button>
</div>


<style>

    #toast{
        display: flex;
        position: absolute;
        box-shadow: 2px 2px 2px var(--color-text-2);
        border : var(--border-1);
        padding : 5px;
        padding-right: 15px;
        padding-left: 15px;
        border-radius : 15px;
        flex-direction: column;
        justify-self: center;
        align-content: center;
        background: var(--color-bg-box);
        width : 400px
    }

    button{
        padding: 0;
        width : 50px;
        align-self: center;

    }

    #toast-body{
        justify-content: center;
        text-align: center;
        color : red
    }
    

</style>
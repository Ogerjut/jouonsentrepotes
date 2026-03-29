<script lang="ts">
	import Handshake from "@lucide/svelte/icons/handshake";
    import Flag from "@lucide/svelte/icons/flag";
	import { useModale } from "$lib/client/games/hook/useModale.svelte";
	import { getChessActionsModale } from "$lib/client/games/chess/modaleChess.svelte";

    function sendGiveUp(){
        const modale = useModale()
        const data = {
            title : "Confirmation abandon",
            reason : "Es-tu sûr de vouloir abandonner ?",
            actions : ["giveup", "cancel"]
        }
        modale.show(data.title, data.reason, getChessActionsModale(data.actions))
    }

    function sendAskDraw(){
        const modale = useModale()
        const data = {
            title : "Confirmation demande de nulle",
            reason : "Es-tu sûr de vouloir demander un match nul ?",
            actions : ["askDraw", "cancel"]
        }
        modale.show(data.title, data.reason, getChessActionsModale(data.actions))
    }
    
</script>

<div class="options">
    <button onclick={() => sendGiveUp()} id="giveup"> <Flag size={20}/> </button>
    <button onclick = {() => sendAskDraw()} id='draw'> <Handshake size={20}/> </button>
</div>

<style>
    
    .options {
       display: flex;
    }

    button{
        border-radius: 15px;
        padding: 2px;
        margin: 2px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height : 32px;
        background-color: orange;
        border : 2px solid orangered ;
        box-shadow: 0 0 0 ;

    }
    
    button:hover{
        cursor: pointer;
        box-shadow: 0px 2px 3px red;
        
    }

    #giveup{
        border : 2px solid red ;
    }



</style>
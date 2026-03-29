<script lang='ts'>
	import { tarotController } from "$lib/client/games/tarot/TarotController.svelte";
	import { useTarot } from "$lib/client/games/tarot/useTarot.svelte";
	import type { Card, Suit } from "$lib/types/games/tarot";
	import { fade, fly } from "svelte/transition";

    interface CardProps {
        value : Card['value']
        suit : Card['suit']
    }

    let {value, suit} : CardProps = $props()

    let tarot = useTarot()

    let mapValue = {
        14 : "R",
        13 : "D",
        12 : "C",
        11 : "V",
    }
    let mapSuit = {
        spade : "&#9824", 
        heart : "&#9829",
        diamond : "&#9830", 
        club : "&#9827"
    }
    
    let isExcuse = $derived(value === 0 && suit === "atout")
    let displayValue = $derived.by(()=>{
        if (isExcuse){
            return "Excuse"
        } else if (suit === "atout"){
            return value
        } else {
            return mapValue[value] || value
        }
    })

    let displaySuit = $derived(mapSuit[suit]) 

    let color = $derived((suit === "heart" || suit === "diamond") ? "#CC0000" : suit === "atout" ? '#0000CC' : 'black')

    
</script>

{#if tarot}
    <div
        role="button"
        tabindex=0
        class="card"
        class:isExcuse = {isExcuse}
        class:isAtout = {suit === "atout"}
        style="--color : {color};"
        onmousedown={() => tarotController.onCardClick({value, suit}, tarot)}
        transition:fly={{ y: -100, duration: 1000 }}
        >
        <p id="value">{displayValue}</p>
        <p id='suit'> {@html displaySuit}</p>
    </div>
{/if}
    

<style>
    
    .card{
        background:white;
        color : var(--color);
        width: 58px;
        height: 100px;
        border: 2px solid var(--color);
        padding: 2px;
        border-radius: 6px;
        font-size: x-large;
        font-weight: bold;
        cursor: grab;
        align-self: center;
        margin-top : 6px;
        margin-bottom : 6px;
        font-family: 'Kurale';
       
        
    }

    .card:not(:first-child) {
        margin-left: -21px; /* seulement pour les suivantes */
    }

    #suit{
        font-size:32px;
        margin-top: -10px;
    }

    .card:active{
        cursor:grabbing
    }

    .card:hover{
        margin-top : 0px;
        margin-bottom : 0px;
        zoom: 1.1;
        border: 3px solid var(--color);
    }

    .isExcuse{
        writing-mode:vertical-lr;
    }

    .isAtout {
        background-color:lemonchiffon
    }


</style>
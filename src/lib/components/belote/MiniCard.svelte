<script lang='ts'>
	import type { Card, Suit } from "$lib/types/games/belote";

    interface CardProps {
        value : Card['value']
        suit : Suit
    }

    let {value, suit} : CardProps = $props()
    
    

    const mapValue : Record<number, string> = {
        14 : "A",
        13 : "10",
        12 : "R",
        11 : "D",
        10 : "V"
    }

    let mapSuit = {
        spade : "&#9824", 
        heart : "&#9829",
        diamond : "&#9830", 
        club : "&#9827"
    }
    
    let displayValue = $derived(mapValue[value] || value)
    let displaySuit = $derived(mapSuit[suit]) 

    let color = $derived((suit === "heart" || suit === "diamond") ? "#CC0000" : 'black')

</script>

<div class="card"
    style="--color : {color}"
>
    <p>{displayValue}</p>
    <p id='suit'> {@html displaySuit}</p>
</div>

<style>
    .card{
        background:white;
        color : var(--color);
        width: 26px;
        height: 50px;
        border: 2px solid var(--color);
        padding: 2px;
        gap: 20px;
        border-radius: 5px;
        cursor: none;
        align-self: center;
    }

    #suit{
        font-size: large;
    }

    
</style>
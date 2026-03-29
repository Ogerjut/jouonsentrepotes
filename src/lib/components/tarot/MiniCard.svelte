<script lang='ts'>
	import type { Card } from "$lib/types/games/tarot";

    interface CardProps {
        value : Card['value']
        suit : Card['suit']
    }

    let {value, suit} : CardProps = $props()
    
    const mapValue = {
        14 : "R",
        13 : "D",
        12 : "C",
        11 : "V",
    }
    const mapSuit = {
        spade : "&#9824", 
        heart : "&#9829",
        diamond : "&#9830", 
        club : "&#9827"
    }

    let isExcuse = $derived(value === 0 && suit === "atout")
    let displayValue = $derived.by(()=>{
        if (isExcuse){
            return "Exc"
        } else if (suit === "atout"){
            return value
        } else {
            return mapValue[value] || value
        }
    })
    
    let color = $derived((suit === "heart" || suit === "diamond") ? "red" : suit === "atout" ? 'blue' : 'black')

</script>

<div class="card"
    style="--color : {color}"
    class:isExcuse = {isExcuse}
>
    <p>{displayValue}</p>
    <p id='suit'> {@html mapSuit[suit]}</p>
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

    .isExcuse{
        writing-mode:vertical-lr;
    }
    
</style>
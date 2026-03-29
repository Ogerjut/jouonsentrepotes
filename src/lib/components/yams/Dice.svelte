<script lang="ts">
    import Lock from '@lucide/svelte/icons/lock';
    import D1 from '@lucide/svelte/icons/dice-1';
    import D2 from '@lucide/svelte/icons/dice-2';
    import D3 from '@lucide/svelte/icons/dice-3';
    import D4 from '@lucide/svelte/icons/dice-4';
    import D5 from '@lucide/svelte/icons/dice-5';
    import D6 from '@lucide/svelte/icons/dice-6';

    let {id, selected = $bindable(),  value, launches} = $props()
    
    const diceComponents = {
        1: D1,
        2: D2,
        3: D3,
        4: D4,
        5: D5,
        6: D6
    };

    const DiceIcon = $derived(diceComponents[value] || D1);

    function toggleisSelected(){
        if (launches >= 3) return
        selected = !selected
    }

</script>

<div id="dice-container">
    <button 
    class="dice-button" 
    class:selected={selected}
    onclick={() => toggleisSelected()}
    onmouseenter={() => toggleisSelected()}
    >
   
    <DiceIcon
    class="dice-icon"
    size={47}
    fill="#fff"
    strokeWidth={4}
    absoluteStrokeWidth
    />

    
    </button>
    {#if selected}
        <Lock color="maroon" strokeWidth={2.5} /> 
    {/if}
</div>

    


<style>
    #dice-container{
        display: flex;
        flex-direction: column;
        align-items: center;
        min-height: 50px;
        height: 80px;
        margin-top: 30px;
    }

    .dice-button {
        /* width: 40px;
        height: 40px; */
        padding: 0px;
        margin: 0px;
        border-radius: 0px;
        background: green;
        box-shadow:  0px 0px 0px;
        /* border: 1px solid black; */
        color : black;
    }
    #dice-container:first-child{
        margin-left: 25px;
    }
    
    .selected{
        color : maroon
    }

</style>
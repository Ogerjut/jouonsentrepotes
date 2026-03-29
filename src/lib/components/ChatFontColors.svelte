<script lang='ts'>
    let {fontColor = $bindable() } = $props()
    
    let colors = ["magenta","blueviolet",  "blue", "cyan", "green", "chartreuse", "yellow", "orange", "red","maroon", "black"]

</script>

<div id="colors">
    {#each colors as color}
        <button 
            aria-label="color selection"
            class="btn-color" 
            style="--color-btn:{color}"
            onclick={()=>fontColor = color}
            ></button>
    {/each}

</div>

<style>
    #colors{
        display: flex;
        flex-direction: column;
        background-color: white;
        padding: 5px;
        border-radius: 10px;
        border : var(--border-1);
        gap: 2px;
        
    }
    .btn-color{
        background-color: var(--color-btn);
    }
</style>
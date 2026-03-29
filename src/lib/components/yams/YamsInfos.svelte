<script lang="ts">
	import { InfoIcon } from "@lucide/svelte";

    let open = $state(false)

</script>

<div id="info" class:open={open}>
    <button onclick={()=>open = !open}> <InfoIcon /> </button> 
    {#if open}
        <hr>
            <ul>
                <li>Survoles ou cliques sur un dés pour le verrouiller</li>
                <li>Une fois ton résultat décidé, clique dessus dans la grille de score pour l'enregistrer</li>
            </ul>
        
    {/if}
</div>
<style>

button{
    background-color: transparent;
    box-shadow: none;
    padding: 2px;
    color : var(--color-text)

}

button:hover{
    color : var(--color-text-2)
}

#info{
    
    text-align: center;
    font-size:small ;
    color : var(--color-text-2);
    border-radius: 15px;
}

.open{
    background-color: azure;
    border : 1px solid var(--color-text-2)
}



</style>
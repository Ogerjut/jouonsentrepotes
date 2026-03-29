
<script lang='ts'>

    let {user, onclick, games, victories}= $props()

</script>


<div class="flexbox absolute border-2 p-5 w-40 ">

    
        <b><p>{user.name}</p></b>
        <p>Parties : {games}</p>
        <p>Victoires : {victories}</p>
        <!-- <p>En jeu : {user.inGame} </p> -->
        <button type="button"  onclick={() => onclick()}> Fermer </button>

    

</div>

<style>

    div{
        display: flex;
        flex-direction: column;
        background-color: var(--color-bg-box);
        border-radius: 15px;
        align-items: center;
        gap: 5px;
        
        
    }
</style>
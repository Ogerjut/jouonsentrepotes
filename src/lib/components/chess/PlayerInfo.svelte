<script>
    import Timer from  './Timer.svelte'

    let {username, team} = $props()

</script>

<div class='infoPlayer' >
    <strong>{username}</strong>
    <p>{team}</p>
    <Timer team = {team} /> 
</div>

<style>
    .infoPlayer {
            font-size: large;
            display: flex;
            justify-content:space-around;
            align-items: center;
            /* text-align: left; */
            border: 3px solid maroon;
            margin: 10px;
            padding: 5px;
            background-color :var(--color-bg);
            border-radius: 15px;
            width : 500px

        }
</style>
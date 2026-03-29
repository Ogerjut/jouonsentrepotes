

<script lang='ts'>
    import { useTimer } from "$lib/client/games/hook/useTimer.svelte";
	import { onMount } from "svelte";

    const timer = useTimer() 
    const duration = $derived(timer?.duration ?? 15000)
    const remainingTime = $derived(timer?.remainingTime ?? 0)

</script>

<div id="progress-bar">
    <div 
        class="bar"
        style="width : {(remainingTime / duration)*100}% "
        class:end={remainingTime < (duration / 4)}
        class:soonEnd={remainingTime < (duration / 2) && remainingTime >= (duration / 4)}
    > 
    </div>
</div>

<style>
    #progress-bar{
        width: 150px;
        background-color: lightgrey;
        border-radius: 10px;
        overflow: hidden;
        
        
    }

    .bar {
        background-color: green;
        height: 15px;
        /* transition: width 0.1s linear; */

        
    }

    .end {
        background-color: red;
    }

    .soonEnd {
        background-color: orange;
    }

</style>
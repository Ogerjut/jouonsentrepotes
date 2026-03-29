<script lang='ts'>
    import { useTimer } from "$lib/client/games/hook/useTimer.svelte";

    const timer = useTimer() 
    const duration = $derived(timer.duration ?? 15000)
    const remainingTime = $derived(timer.remainingTime ?? 0)
    // const displayRemainingTime = $derived(Math.ceil(remainingTime/1000) ?? 0)


</script>

<div id="progress-bar">
    <div 
        class="bar"
        style="height : {(remainingTime / duration)*100}% "
        class:end={remainingTime < (duration / 4)}
        class:soonEnd={remainingTime < (duration / 2) && remainingTime >= (duration / 4)}
    > 
    </div>
</div>

<style>
    #progress-bar{
        rotate: 180deg;
        width: 15px;
        height: 50px;
        background-color: lightgrey;
        border-radius: 10px;
        overflow: hidden;
        
        
    }

    .bar {
        background-color: green;
        width: 100%;
    }

    .end {
        background-color: red;
    }

    .soonEnd {
        background-color: orange;
    }

</style>
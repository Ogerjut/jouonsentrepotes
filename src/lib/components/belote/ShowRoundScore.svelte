<script lang="ts">
	import { useBelote } from "$lib/client/games/belote/useBelote.svelte";
	import ProgressBar from "../ProgressBar.svelte";


const belote = useBelote()
const table = $derived(belote?.table.gameState)
const roundDataScore = $derived(table?.roundDataScore)

</script>

{#if table}
    <div id="endRound">
        <h1> <b><u>Fin de manche</u> </b> </h1>
        <p>Score preneurs : {roundDataScore?.takersScore}</p>
        <hr>
        <p>Bonus belote : {roundDataScore?.takersBelote ? "Preneurs" : roundDataScore?.defBelote ? "Défense" : "Pas de bonus"}</p>
        <p>{roundDataScore?.status === "hasWin" ? "Les preneurs ont gagné" : 
            roundDataScore?.status === "litige" ? "Litige ! " : "Les preneurs ont chuté"}</p>
        <hr>
        <h2><u><b> Scores finaux</b></u></h2>
        <p> preneurs : {roundDataScore?.takersFinalScore}</p>
        <p> defenses : { roundDataScore?.defFinalScore}</p>
        <hr>
        <ProgressBar />

    </div>
{/if}

<style>
    #endRound{
        display: flex;
        flex-direction: column;
        align-items: center;
        padding : 5px;
        background-color: var(--color-bg-box);
        font-size: 14px;
        color : maroon;
        width : 500px;
        border-radius: 25px;
    }

    hr{
        align-self: normal;
        margin-top: 3px;
        margin-bottom: 3px;
    }

</style>
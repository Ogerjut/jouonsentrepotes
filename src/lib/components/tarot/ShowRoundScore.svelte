<script lang="ts">
	import { useTarot } from "$lib/client/games/tarot/useTarot.svelte";
	import MiniCard from "./MiniCard.svelte";
	import ProgressBar from "../ProgressBar.svelte";

    const tarot = useTarot()
    const scoreData = $derived(tarot?.table.gameState.roundDataScore)
    const dog = $derived(tarot?.table.gameState.dog)

</script>

<div id="afterRound">
    <h1> <b><u>Fin de manche</u> </b> </h1>
    <div id="dog">
        {#if dog}
            <p>Chien :</p> 
            <div id="cards">
                {#each dog as card (card.value + ':' + card.suit)}
                    <MiniCard value={card.value} suit={card.suit} /> 
                {/each}
            </div>
            
        {/if}
    </div>
    
    {#if scoreData}
        <div id="score">
            <table>
                <tbody>
                    <tr>
                        <th>Nombre de bouts</th><td>{scoreData.oudlers}</td>
                    </tr>
                    <tr>
                        <th>Contrat (coef)</th><td>{scoreData.contrat} ({scoreData.coef})</td>
                    </tr>
                    <tr>
                        <th>Score</th><td>{scoreData.score}</td>
                    </tr>
                </tbody>
            </table>
            
            <p> <b>{scoreData.hasWin ? `Le déclarant a gagné, il marque ${scoreData.takerScore} points !` : `Le déclarant a perdu, la défense marque ${scoreData.defScore} points ! ` }</b></p>
            <hr>
            <div id="score-detail">
                <i><p> <u>Marque  : </u> 25 + (score - contrat) x coef = <b>{scoreData.marque}</b> </p>
                <p> <u>Bonus :</u> Poignées ({scoreData.bonusHandfulDef+scoreData.bonusHandfulTaker}) + Chelem ({scoreData.bonusSlam}) + Petit au bout  x coef ({scoreData.bonusPetitAuBout*scoreData.coef})
                    = <b>{scoreData.bonusHandfulDef+scoreData.bonusHandfulTaker+scoreData.bonusSlam+scoreData.bonusPetitAuBout*scoreData.coef}</b>   
                </p></i>
            </div>
            <hr>

            <ProgressBar />
  
        </div>
    {/if}

</div>


<style>
    h1{
        font-size: larger;
    }

    table {
        border-collapse: collapse;
        background-color: var(--color-bg);
        
    }

    th, td {
        border: 1px solid #aaa;
        text-align: center;
        padding-left: 10px;
        padding-right: 10px;
    }
    
    th {
        font-weight: normal;
    }
    
    tbody th {
        text-align: center;
    }

    #afterRound, #score{
        display: flex;
        flex-direction: column;
        align-items: center;
        padding : 5px;
        background-color: var(--color-bg-box);
        font-size: 14px;
        /* opacity: 90%; */
        color : maroon;
        width : 500px;
        border-radius: 25px;
    }


    #cards{
        display: flex;
        
    }

    #dog{
        border : 1px solid saddlebrown;
        margin: 2px;
        padding: 5px;
        padding-left: 10px;
        background-color:burlywood;
        border-radius: 5px;
        padding-right : 10px;
        
    }
hr{
    align-self: normal;
    margin-top: 3px;
    margin-bottom: 3px;
}

#score-detail{
    color : black;
    font-size: small;
}

</style>
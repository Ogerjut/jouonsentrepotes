<script lang='ts'>

    type ScoreBoardProps = {
        score : Map<string, number>
    }
     
    let {score} : ScoreBoardProps = $props()

    let max = $derived(getHigherScore())

    function getHigherScore(){
        let scores = score.values().toArray()
        return Math.max(...scores, 0)
    }

</script>

<table id="score-board">
    <!-- <caption> <u> Score : </u> </caption> -->
    <tbody>
        {#each score as [user, userScore] (user)}
            <tr class:winner={userScore === max}>
                <th>{user} : </th> <td>{userScore} pts </td> 
            </tr>
        {/each}
    </tbody>
</table>

<style>
    #score-board{
        background-color: white;
        border-collapse: separate;
        border-radius:  15px;
    
    }

    th, td {
        padding: 10px;
    }

    .winner{
        background-color: lightgreen;
    }
</style>


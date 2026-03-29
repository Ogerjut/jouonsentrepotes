<script>
    let mapSuit = {
        spade : "&#9824", 
        heart : "&#9829",
        diamond : "&#9830", 
        club : "&#9827"
    }
</script>

<div id="table" >
    <div id="deco">
        <div id="N" style="grid-area: 1 / 2;"> {@html mapSuit["spade"]}</div>
        <div id="W" style="grid-area: 2 / 1;"> {@html mapSuit["diamond"]}</div>
        <div id="E" style="grid-area: 2 / 3;"> {@html mapSuit["club"]}</div>
        <div id="S" style="grid-area: 3 / 2;"> {@html mapSuit["heart"]}</div>
    </div>
</div>

<style>
    #table {
        grid-area: 2 / 2;
        height: 300px;
        width: 400px;
        border: 10px solid maroon;
        background-color: darkgreen;
        border-radius: 50%;
        box-shadow: 0px 0px 30px black;
    }

    #deco {
        display: grid;
        grid-template-columns: repeat(3, auto);
        grid-template-rows: repeat(3, auto);
        height: 100%;
        font-size: 64px;
        color: darkgoldenrod;
        
    }

    #N{
        text-align: center;
        align-self: start;
        margin-top: -12px;
    }

    #W{
        text-align: left;
        align-self: center;
        margin-left: 5px;
        
    }

    #E{
        text-align: right;
        align-self: center;
        margin-right: 5px;
       
    }

    #S{
        text-align: center;
        align-self: end;
       margin-bottom: -12px;
        
    }


</style>
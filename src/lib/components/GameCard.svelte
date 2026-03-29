<script lang='ts'>
	import { goto } from '$app/navigation';


  interface GameCardProp {
    row : number
    col : number
    name : string
    url : string
    image : string
    published : boolean
  }

	let { row, col, name, url, image, published } : GameCardProp = $props()

  function onClick(){
    if (published) goto(url)
  }
  
</script>

<div
  role="button"
  tabindex=0
  id="game-card"
  class:notpublished={!published}
  style={`grid-row: ${row}; grid-column: ${col};`}
  onmousedown={() => onClick()}

>
    <img src={image} alt={name} class="thumbnail" />
    <span>{name}</span>
</div>

<style>
  #game-card {
    border: var(--border-4);
    border-radius: 10px;
    width: 160px;
    height: 160px;
    padding : 3px;
    margin: 5px;
    background: var(--color-bg-box);
	  display: flex;
    flex-direction: column;
    justify-content: space-between;
	  align-items: center;
	
  }

  .notpublished >*{
    cursor: not-allowed;
    opacity: 60%;

  }

  #game-card:hover{
    cursor : pointer;
    box-shadow: var(--box-shadow-2);
    color : var(--color-text-2);
  }

  .thumbnail {
	width: 100%;
	height : 125px;
	border-top-right-radius: 8px;
	border-top-left-radius: 8px;
    object-fit: cover; /* 🔑 garde proportion sans coupe */
  }

  span {
	background-color:maroon;
	align-self: stretch;
	text-align: center;
	border-bottom-right-radius: 6px;
	border-bottom-left-radius: 6px;
	color: white
  }



  
</style>

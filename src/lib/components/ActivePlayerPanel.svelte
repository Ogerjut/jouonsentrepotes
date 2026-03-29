<script lang='ts'>
	import { onMount } from "svelte";
    import UserProfil from "./UserProfil.svelte";
	import type { User, UserStats } from "$lib/types/user";
	import { socket } from "$lib/client/socket";
	import type { GameType, Table } from "$lib/types/table";
	import { useInvitation } from "$lib/client/games/hook/useInvitation.svelte";

    interface Props {
        table : Table
        me : User
    }

    let {table, me} : Props = $props()

    const invitation = useInvitation()
    const invitedUsers = $derived(invitation.invitedUsers)

    let activeUsers = $state<User[]|[]>([])
    let selectedUser = $state<UserStats|null>(null)
    let searchTerm = $state("")

    let filteredUsers = $derived(
        activeUsers?.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
    )

    onMount(()=> {
        socket.emit("getActiveUsers")
        
        socket.on("activeUsers", (users) => {
            activeUsers = users.filter(u => u.id !== me.id)
        })

        return () => {
            socket.off("activeUsers")
        }
    })

    async function fetchSelectedUser(userId : User["id"]) {
        socket.emit("getUserStatsById", userId, (user : UserStats) => {
            selectedUser = user
        })
      
    }

    function sendInvitation(activeUserId : string, id : string, gameType : GameType){
        if (!invitedUsers.has(activeUserId)){
            socket.emit("inviteToPlay", activeUserId , id , gameType)
        }
    }
</script>


<div id="listplayers">
    <h1><u> Joueurs actifs :</u> </h1>
    <input 
    id="search-bar"
    type="search"
    placeholder="Rechercher un joueur"
    bind:value={searchTerm}
    />

    <ul>
        {#each filteredUsers as activeUser (activeUser.id)}
            <li> 
                <button id="pseudo-button" onclick={() => fetchSelectedUser(activeUser.id)}> {activeUser.name} </button> 
                <button disabled={invitedUsers.has(activeUser.id)} id="invite-button" onclick={() => sendInvitation(activeUser.id, me.id, table.gameType)}> 
                    {invitedUsers.has(activeUser.id) ? "Envoyée" : "Inviter"}
                </button>
            </li>
        {/each}
    </ul>

</div>

{#if selectedUser}
    <UserProfil user={selectedUser} onclick = {()=> selectedUser = null} games={selectedUser[table.gameType].games} victories={selectedUser[table.gameType].victories}/>
{/if}

<style>
    #listplayers{
        background : var(--color-bg-box);
        border-radius: 15px;
        margin: 10px;
        padding: 10px;
        height: 256px;
        width : 200px;
        text-align:center;
       
    }

    #search-bar{
        margin: 2px;
        padding: 1px;
        font-size: small;
        width : 100%;
        border-radius: 5px;
    }

    li{
        border-bottom : var(--border-1);
        display: flex;
        justify-content: space-between;
        font-size: small;
        
    }

    li:first-child{
        border-top : var(--border-1);
    }

    button{
        padding: 0px;
        border-radius: 5px;
        margin: 2px;
    }

    #pseudo-button{
        width: 100px;
        background-color: azure;
        box-shadow: 0px 0px 0px ;
    }

    #pseudo-button:hover{
        font-weight: bold;
    }

    #invite-button{
        width: auto;
        padding: 3px;
        background-color: var(--color-text-2);
        color : white
    }

    button:disabled{
        opacity: 70%;
    }

</style>
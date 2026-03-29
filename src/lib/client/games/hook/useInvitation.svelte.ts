import { goto } from "$app/navigation"
import { socket } from "$lib/client/socket"
import { SvelteSet } from "svelte/reactivity"
import { useToast } from "./useToast.svelte"

type InvitationData = {
  from: string
  tableId: string
  gameType: string
}

let showInvite = $state(false)
let invitationData = $state<InvitationData | null>(null)
const invitedUsers : SvelteSet<string> = new SvelteSet()

export function useInvitation() {
  return {
    get show() { return showInvite },
    get data() { return invitationData },
    get invitedUsers() {return invitedUsers},

    updateInvitedUsers(users: string[]) {
      invitedUsers.clear()
      users.forEach(id => invitedUsers.add(id))
    },
    
    setInvitation: (from: string, tableId: string, gameType: string) => {
      showInvite = true
      invitationData = { from, tableId, gameType }
    },
    
    hide: () => {
      showInvite = false
      invitationData = null
    },
    
    accept: async () => {
      showInvite = false
      if (invitationData){
        const res = await socket.emitWithAck("acceptedInvitation", invitationData.tableId)
        if (res.status === "not" && res.reason) {
          useToast().show(res.reason) 
        } else {
          goto(`/games/${invitationData?.gameType}/${invitationData?.tableId}`)
          
        }
      } else {useToast().show("impossible de rejoindre cette table")}
      
    },
    
    decline: () => {
      showInvite = false
      socket.emit("declinedInvitation")
    }
  }
}
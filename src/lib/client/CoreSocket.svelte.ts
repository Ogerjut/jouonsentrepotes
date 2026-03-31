import { goto } from '$app/navigation'
import { useToast } from './games/hook/useToast.svelte';
import { useInvitation } from './games/hook/useInvitation.svelte';
import { usePresence } from './games/hook/usePresence.svelte';
import { socket } from './socket'

export function initCoreSocket() {
  const invitation = useInvitation()
  const toast = useToast()
  
  const onError = (reason : string | undefined) => {
    if (reason){
      toast.show(reason)
    }
  }

  const onConnection = () => {
    console.log("Socket connected/reconnected");
    socket.emit("registerUserSocket");
  }
  
  const onTableAborted = () => {
    toast.show("Un joueur a quitté la partie en cours")
    goto('/')
  }

  const onInvitation = (tableId: string, from: string, game: string) => {
    console.log("invitation to play from", from)
    invitation.setInvitation(from, tableId, game)
  }

  const onUserPresence = (status : {online : boolean, inGame : boolean}) => {
      usePresence().setPresence(status)
  }

  const onInvitedUsers = (users : string[]) => {
    invitation.updateInvitedUsers(users)
  }

  socket.on('abortedTable', onTableAborted)
  socket.on("connect", onConnection);
	socket.on("invitationToPlay", onInvitation)
  socket.on("userPresence", onUserPresence)
  socket.on('invitedUsers', onInvitedUsers)
  socket.on('error', onError)
  socket.on("redirection", (url : string) => {goto(url)})
      
  return () => {
    socket.off('abortedTable')
    socket.off("invitationToPlay")
    socket.off("userPresence")
    socket.off('invitedUsers')
    socket.off("error")
    socket.off('redirection')
  }
}

export function leave(){
  socket.emit("leaveTable")
  goto("/")
}

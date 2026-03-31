import { goto } from "$app/navigation";
import { socket } from "$lib/client/socket";
import type { Card, Handful, TarotBid } from "$lib/types/games/tarot";
import type { Tarot } from "./useTarot.svelte";

export type HandfulResponse = {
  hasHandful: boolean;
  handfulSize: Handful;
};


class TarotController {
  constructor() {}

  sendBid(bid : TarotBid){
    socket.emit("tarot:hasBid", bid )
  }

  async onCardClick(card : Card, tarot : Tarot) {  
    const hasTaken = tarot?.userGameState.hasTaken
    const isCurrentPlayer = tarot?.table.gameState.currentPlayer === tarot?.me.id
    const state = tarot?.table.gameState.state

    if (state === "afterAuction" && hasTaken) {
      socket.emit("tarot:handleDog", card);
      // return;
    }

    if (state === "round" && isCurrentPlayer) {
      socket.emit("tarot:checkPlayableCard", card);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }

  quitTable(){
          socket.emit("leaveTable")
          goto('/')
  }

  declareChelem(){
    socket.emit("tarot:declareSlam")
  }

  async declareHandful(handfulSize : Handful){
    console.log("le preneur annonce une poignee")
    return socket.emitWithAck("tarot:registerHandful", handfulSize)
  }

  async checkHandful(): Promise<HandfulResponse> {
    return socket.emitWithAck("tarot:checkHandful")
  }

  validateDog(){
    socket.emit("tarot:registerDog")
  }

  kingCall(king : Card["suit"]){
    console.log("appel du roi de " + king)
    socket.emit("tarot:registerKingCall", king)
  }

}


export const tarotController = new TarotController()
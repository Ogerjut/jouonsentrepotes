import type { Suit } from "$lib/types/games/belote";


export const TRUMP_CARD_VALUE : Record<number, number>= {
    14 : 11,
    13 : 10, 
    12 : 4, 
    11 : 3, 
    10 : 20, 
    9 : 14, 
    8 : 1,
    7 : 0
}


export class Card {
    value : number 
    suit : Suit
    constructor(value : number, suit : Suit){
        this.value = value
        this.suit = suit
    }
}

export function isSameCard(a : Card, b : Card){
    return a.value === b.value && a.suit === b.suit;
  }

export class Deck {
    private suits : Suit[]
    private values : number[]
    private deck : Card[]

    static suitsOrder = ["spade", "diamond", "club", "heart"];

    static sort(hand : Card[]) {
        return hand.sort((a, b) => {
            // trier par couleur d'abord
            const suitDiff = Deck.suitsOrder.indexOf(a.suit) - Deck.suitsOrder.indexOf(b.suit);
            if (suitDiff !== 0) return suitDiff;

            // trier par valeur ensuite (du plus fort au plus faible)
            return b.value - a.value;
        });
    }

    constructor() {
        this.suits = ["diamond", "heart", "club", "spade"];
        this.values = Array.from({ length: 8 }, (_, i) => i + 7);
        this.deck = this.#create();
    }

    #create() {
        const deck : Card[] = [];
        this.suits.forEach(suit => {
            this.values.forEach(value => deck.push(new Card(value, suit)));
        });
        return deck;
    }

    shuffle() {
        // fisher yates
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
        return this.deck;
    }
}







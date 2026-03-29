import type { Suit } from "$lib/types/games/tarot";


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
    private valuesAtout : number[]
    private deck : Card[]

    static suitsOrder = ["spade", "diamond", "club", "heart", "atout"];

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
        this.values = Array.from({ length: 14 }, (_, i) => i + 1);
        this.valuesAtout = Array.from({ length: 22 }, (_, i) => i);
        this.deck = this.#create();
    }

    #create() {
        const deck : Card[]= [];
        this.suits.forEach(suit => {
            this.values.forEach(value => deck.push(new Card(value, suit)));
        });
        this.valuesAtout.forEach(value => deck.push(new Card(value, "atout")));
        return deck;
    }

    shuffle() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
        return this.deck;
    }
}

export const DECK_CHELEM = [
    new Card(21, "atout"), new Card(20, "atout"), new Card(19, "atout"), new Card(1, "heart"), new Card(2, "heart"), new Card(3, "heart"), 
    new Card(1, "spade"), new Card(2, "spade"), new Card(3, "spade"), new Card(1, "club"), new Card(2, "club"), new Card(3, "club"),
    new Card(18, "atout"), new Card(17, "atout"), new Card(16, "atout"), new Card(4, "heart"), new Card(5, "heart"), new Card(6, "heart"),
    new Card(4, "spade"), new Card(5, "spade"), new Card(6, "spade"), new Card(4, "club"), new Card(5, "club"), new Card(6, "club"),
    new Card(15, "atout"), new Card(14, "atout"), new Card(13, "atout"), new Card(7, "heart"), new Card(8, "heart"), new Card(9, "heart"),
    new Card(7, "spade"), new Card(8, "spade"), new Card(9, "spade"), new Card(7, "club"), new Card(8, "club"), new Card(9, "club"),
    new Card(12, "atout"), new Card(11, "atout"), new Card(10, "atout"), new Card(10, "heart"), new Card(11, "heart"), new Card(12, "heart"),
    new Card(10, "spade"), new Card(11, "spade"), new Card(12, "spade"), new Card(10, "club"), new Card(11, "club"), new Card(12, "club"),
    new Card(9, "atout"), new Card(8, "atout"), new Card(7, "atout"), new Card(1, "atout"), new Card(2, "atout"), new Card(3, "atout"),
    new Card(4, "atout"), new Card(5, "atout"), new Card(6, "atout"),  new Card(13, "club"), new Card(13, "spade"), new Card(13, "heart"), 
    new Card(14, "heart"), new Card(14, "spade"), new Card(14, "diamond"), new Card(1, "diamond"), new Card(2, "diamond"), new Card(3, "diamond"),
    new Card(4, "diamond"), new Card(5, "diamond"), new Card(6, "diamond"), new Card(7, "diamond"), new Card(8, "diamond"), new Card(9, "diamond"),
    new Card(14, "club"), new Card(0, "atout"), new Card(10, "diamond"), new Card(11, "diamond"), new Card(12, "diamond"), new Card(13, "diamond"),
   
]

export const DECK_CHELEM_PETIT_AU_BOUT = [
    new Card(21, "atout"), new Card(20, "atout"), new Card(19, "atout"), new Card(1, "heart"), new Card(2, "heart"), new Card(3, "heart"), 
    new Card(1, "spade"), new Card(2, "spade"), new Card(3, "spade"), new Card(1, "club"), new Card(2, "club"), new Card(3, "club"),
    new Card(18, "atout"), new Card(17, "atout"), new Card(16, "atout"), new Card(4, "heart"), new Card(5, "heart"), new Card(6, "heart"),
    new Card(4, "spade"), new Card(5, "spade"), new Card(6, "spade"), new Card(4, "club"), new Card(5, "club"), new Card(6, "club"),
    new Card(15, "atout"), new Card(14, "atout"), new Card(13, "atout"), new Card(7, "heart"), new Card(8, "heart"), new Card(9, "heart"),
    new Card(7, "spade"), new Card(8, "spade"), new Card(9, "spade"), new Card(7, "club"), new Card(8, "club"), new Card(9, "club"),
    new Card(12, "atout"), new Card(11, "atout"), new Card(10, "atout"), new Card(10, "heart"), new Card(11, "heart"), new Card(12, "heart"),
    new Card(10, "spade"), new Card(11, "spade"), new Card(12, "spade"), new Card(10, "club"), new Card(11, "club"), new Card(12, "club"),
    new Card(9, "atout"), new Card(8, "atout"), new Card(1, "atout"), new Card(7, "atout"), new Card(2, "atout"), new Card(3, "atout"),
    new Card(4, "atout"), new Card(5, "atout"), new Card(6, "atout"),  new Card(13, "club"), new Card(13, "spade"), new Card(13, "heart"), 
    new Card(14, "heart"), new Card(14, "spade"), new Card(14, "diamond"), new Card(1, "diamond"), new Card(2, "diamond"), new Card(3, "diamond"),
    new Card(4, "diamond"), new Card(5, "diamond"), new Card(6, "diamond"), new Card(7, "diamond"), new Card(8, "diamond"), new Card(9, "diamond"),
    new Card(14, "club"), new Card(0, "atout"), new Card(10, "diamond"), new Card(11, "diamond"), new Card(12, "diamond"), new Card(13, "diamond"),
   
]

export const DECK_PETIT_AU_BOUT = [
    new Card(21, "atout"), new Card(20, "atout"), new Card(19, "atout"), new Card(14, "heart"), new Card(2, "heart"), new Card(3, "heart"), 
    new Card(14, "spade"), new Card(2, "spade"), new Card(3, "spade"), new Card(14, "club"), new Card(2, "club"), new Card(3, "club"),
    new Card(18, "atout"), new Card(17, "atout"), new Card(16, "atout"), new Card(4, "heart"), new Card(5, "heart"), new Card(6, "heart"),
    new Card(4, "spade"), new Card(5, "spade"), new Card(6, "spade"), new Card(4, "club"), new Card(5, "club"), new Card(6, "club"),
    new Card(15, "atout"), new Card(14, "atout"), new Card(13, "atout"), new Card(7, "heart"), new Card(8, "heart"), new Card(9, "heart"),
    new Card(7, "spade"), new Card(8, "spade"), new Card(9, "spade"), new Card(7, "club"), new Card(8, "club"), new Card(9, "club"),
    new Card(12, "atout"), new Card(11, "atout"), new Card(10, "atout"), new Card(10, "heart"), new Card(11, "heart"), new Card(12, "heart"),
    new Card(10, "spade"), new Card(11, "spade"), new Card(12, "spade"), new Card(10, "club"), new Card(11, "club"), new Card(12, "club"),
    new Card(9, "atout"), new Card(8, "atout"), new Card(1, "atout"), new Card(7, "atout"), new Card(2, "atout"), new Card(3, "atout"),
    new Card(4, "atout"), new Card(5, "atout"), new Card(6, "atout"),  new Card(13, "club"), new Card(13, "spade"), new Card(13, "heart"), 
    new Card(1, "heart"), new Card(1, "spade"), new Card(14, "diamond"), new Card(1, "diamond"), new Card(2, "diamond"), new Card(3, "diamond"),
    new Card(4, "diamond"), new Card(5, "diamond"), new Card(6, "diamond"), new Card(7, "diamond"), new Card(8, "diamond"), new Card(9, "diamond"),
    new Card(1, "club"), new Card(0, "atout"), new Card(10, "diamond"), new Card(11, "diamond"), new Card(12, "diamond"), new Card(13, "diamond"),
   
]






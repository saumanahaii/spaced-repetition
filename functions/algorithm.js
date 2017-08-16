/** A deck which contains cards sorted into several decks and helper functions.
* @param {object} data - The data you want to make a deck with
* @param {object} timeFunction - An optional argument that determines how long a wait each category has before card is due
*/
class Deck{
  constructor(data, timeFunction, existingData=false){

    if(typeof timeFunction !== "undefined"){
      this.timeFunction = timeFunction;
    }else{
      //default times to increase due date by
      this.timeFunction = {
        soon: 360000,
        soonish: 28800000,
        later: 86400000,
        learned: 2592000000
      };
    }
    this.name = data.name;
    this.subject = data.subject;
    this.deck = existingData ? data : this.makeDeck();
    console.log("-")
    this.deck.scoresOverTime[0].toLearn = data.deck.length;
    this.populateDeck(data);
    this.stageCards(5, this.deck);
  }

  /** Pushes the question to the next queue as needed and toggles learning state
  * @param {object} card - Optionally the node in the queue to use.  Defaults to first card of 'now'
  */
  answeredQuestionCorrectly(card = this.fetchFirst("now"), deck=this.deck){
    if(card.study){
      card.study = false;
      this.switchStack("now", "soon", deck)
    }else{
      card.due = Date.now();
      card.due += card.currentStack === "now" ? this.timeFunction.soon :
        card.currentStack === "soon" ? this.timeFunction.soonish :
          card.currentStack === "soonish" ? this.timeFunction.later :
            this.timeFunction.learned;
      card.currentStack =
        card.currentStack === "now" ? "soon" :
          card.currentStack === "soon" ? "soonish" :
            card.currentStack === "soonish" ? "later" :
              "learned";

      this.switchStack("now", card.currentStack, deck);
    }
  }

  /** Moves card to end of stack and resets the currentStack*/
  answeredQuestionIncorrectly(deck = this.deck){
    //move the card to the end of the queue
    let failedCard = this.shift("now", deck);
    failedCard.currentStack = "now";
    this.fetchEnd("now", deck).child = failedCard;
  }

  /** Check a stack for whether the face card's due time is less than now
  * @param {string} target - The queue's name that is being targeted
  * @param {object} deck - Optional argument to target a specific deck.  Defaults to current deck.
  */
  checkStackforDueCards(target, deck = this.deck){
    if(deck[target]){
      if(this.fetchFirst(target, deck).due < Date.now()){
        this.switchStack(target, "now", deck);
        this.checkStackforDueCards(target, deck);
      }
    }
  }

  /** calls the checkStackforDueCards function on all stacks.  Also creates charts for learned and unlearned.
  * @param {object} deck - Optional argument to target a specific deck.  Defaults to current deck.
  */
  checkAllStackforDueCards(deck = this.deck){
    this.checkStackforDueCards("soon", deck);
    this.checkStackforDueCards("soonish", deck);
    this.checkStackforDueCards("later", deck);
    this.checkStackforDueCards("learned", deck);

    //evaluates whether to add in a new entry to the data logging
    if(Date.now()>deck.scoresOverTime[deck.scoresOverTime.length-1].date+60000){
      //create an entry
      deck.scoresOverTime.push({
        date: Date.now(),
        learned: deck.counts.learned,
        toLearn: deck.counts.unstaged
      });
    }
  }

  /** populates the deck from the provided json object
  * @param {object} data - The data with which to populate the deck as an object.
  */
  populateDeck(data){
    data.deck.forEach(el => {
      this.add(el, "unstaged");
    })
    //add the unstaged count into the counts object
    this.deck.counts.unstaged = data.deck.length;
  }

  /** Adds a card to the target deck.  Calls makeCard to turn data into a new card.
  * @param {object} data - The data to make a card with
  * @param {string} target - The sting name of the targeted queue
  * @param {object} deck - Optional argument to target a specific deck.  Defaults to current deck.
  */
  add(data, target, deck = this.deck){
    let card = this.makeCard(data);
    this.push(card, target, deck);

  }

  // /** Takes a list and pops an element off the end.
  // * @param {string} target - The string name of the queue being targeted
  // * @param {object} deck - Optional argument to target a specific deck.  Defaults to current deck.
  // */
  // pop(target, deck = this.deck){
  //   let item = deck[target];
  //   item.parent.child = null;
  //   item.parent = null;
  //   return item;
  // }

  /** Takes a list and removes the first item from it.
  * @param {string} target - The string name of the queue being targeted
  * @param {object} deck - Optional argument to target a specific deck.  Defaults to current deck.
  */
  shift(target, deck = this.deck){
    let item = this.fetchFirst(target, deck);
    if(deck[target].child){
        deck[target] = deck[target].child;
    }else{
      deck[target] = null
    }
    item.child = null;
    return item;
  }

  /** push item onto end of queue
  *@param {object} card - The card to push onto the queue, as formatted by the makeCard function
  * @param {string} target - The string name of the queue being targeted
  * @param {object} deck - Optional argument to target a specific deck.  Defaults to current deck.
  */
  push(card, target, deck = this.deck){
    let head = this.fetchEnd(target,deck);
    //if first element does not exist yet, make it
    if(!head){
      deck[target] = card;
    }else{
      head.child = card;
    }
  }

  /** Returns the first element of a queue without removing it.
  * @param {string} target - The string name of the queue being targeted
  * @param {object} deck - Optional argument to target a specific deck.  Defaults to current deck.
  */
  fetchFirst(target, deck = this.deck){
    return deck[target];
  }

  /** Returns the last element of a queue without removing it.
  * @param {string} target - The string name of the queue being targeted
  * @param {object} deck - Optional argument to target a specific deck.  Defaults to current deck.
  */
  fetchEnd(target, deck = this.deck){
    //fetches the end of the queue, so that we can stick on an element.
    if(deck[target]){
      let current = deck[target];
      while (current.child !== null){
        current = current.child;
      }
      return current;
    }
    return null;
  }

  /** Move a number of cards from unstaged to now
  * @param {integer} num - Optionally the number of cards to move from 'unstaged' to 'now'.  Defaults to 1.
  * @param {object} deck - Optional argument to target a specific deck.  Defaults to current deck.
  */
  stageCards(num = 1, deck = this.deck){
    for(let i=0;i<num;i++){
      this.switchStack("unstaged", "now", deck);
    }
    deck.counts["now"] += num;
    deck.counts["unstaged"] -= num;
  }

  /** Move face card from one stack to the end of another and manage count
  * @param {string} origin - The string name of the origin queue
  * @param {string} target - The string name of the queue being targeted
  * @param {object} deck - Optional argument to target a specific deck.  Defaults to current deck.
  */
  switchStack(origin, target,deck=this.deck){
    let item = this.shift(origin, deck);
    if(origin != "unstaged"){
      deck.counts[origin] -= 1;
      deck.counts[target] += 1;
    }
    this.push(item, target, deck);

  }

  // NOTE: I've toggled study to false so that I can test the code.
  /** Makes a card given the cardData.
  * @param {object} cardData - The data with which to make a card
  */
  makeCard(cardData){
    cardData.child = null;
    cardData.due = null;
    cardData.study = false;
    cardData.currentStack = "now"
    return cardData;
  }

  /** Creates an empty deck object ready to be populated.*/
  makeDeck(){
    //makes a tree/queus structure
    return {
      counts: {
        now: 0,
        soon: 0,
        soonish: 0,
        later: 0,
        learned: 0,
        unstaged: 0
      },
      scoresOverTime: [
        {
          date: Date.now(),
          learned: 0,
          toLearn: 0
        }
      ],
      now: null,
      //two hours
      soon: null,
      //same day
      soonish: null,
      //three days
      later: null,
      //memorized, pop them onto the deck once a month
      learned: null,
      //not yet tackled
      unstaged: null
    };
  }
}

console.log(Deck)
// let test = new Deck(d);
// console.log(test)
// test.answeredQuestionCorrectly();
// console.log(test)

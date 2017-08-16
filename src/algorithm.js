/** A deck which contains cards sorted into several decks and helper functions.
* @param {object} data - The data you want to make a deck with
* @param {object} timeFunction - An optional argument that determines how long a wait each category has before card is due
*/
class Deck{
  constructor(data, timeFunction){

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
    this.deck = this.makeDeck();
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

let d = {
  name: "The Modern Language",
  subject: "All the language you must know to understand the modern world.",
  deck: [
    {question:"bb",
      answer: "Big Brother",
      wrongAnswers: ["Boing Boing", "crimethink", "A playful name for a lover."]
    },
    {question:"Duckspeak",
      answer: "to speak without thinking",
      wrongAnswers: ["To quack like a duck.", "To quack like a bear.", "Unnecessarily aggressive and antisocial speech."]
    },
    {question:"Malquoted",
      answer: "Untrue claims about the powers that be",
      wrongAnswers: ["An improper string",
        "A breed of dog",
        "Something something 'verse"]
    },
    {question:"Oldthink",
      answer: "Thoughts that belong only in history, before the modern regime",
      wrongAnswers: ["What happens when someone suffers from Alzheimers",
        "A punk rock band from Ingersoll",
        "Facts which are now considered wrong."]
    },
    {question:"Upsub",
      answer: "To submit to a higher authority.",
      wrongAnswers: ["To upvote a submission",
        "When an underwater craft breaks the surface of the water.",
        "To fulfill your fiduciary monetary requirements."]
    },
    {question:"Facecrime",
      answer: "An indication that a person has committed thoughtcrime.",
      wrongAnswers: ["To be really, really  ugly.",
        "To wear disallowed hairstyles or makeup.",
        "To say thoughtcrime."]
    },
    {question:"Ownlife",
      answer: "To properly appreciate being alone and individualistic",
      wrongAnswers: ["A group that routinely commits thoughtcrime.",
        "A nutritional supplement company",
        "To strive to the the best that you can be."]
    },
    {question:"Goodthink",
      answer: "To properly align with the reality as put forth by the powers that be.",
      wrongAnswers: ["To have a really good idea.",
        "To commit deep thoughtcrime",
        "A candy bar manufactured in Guongzhao."]
    },
    {question:"Exit Strategy",
      answer: "To have a plan to leave one's current situation.",
      wrongAnswers: ["The proper procedure for leaving the highway",
        "A business move that involves a golden parachute",
        "To flip the table when you lose a game."]
    },
    {question:"Multiple Intelligences",
      answer: "To be competent in many different intelligence modalities.",
      wrongAnswers: ["To have two equally good ideas",
        "Bringing the team together to tackle a particualrly thorny problem.",
        "When a team is not harmonically synchronized for maximum synergy."]
    },
    {question:"Holistic Approach",
      answer: "To address the entirety of a problem at once.",
      wrongAnswers: ["To simplify a problem by breaking it into smaller pieces.",
        "A medical approach to health that focuses on minimizing the stressors that cause toxins to accumulate in your body.",
        "To aggressively take over a niche through massive buildout and dirty tactics."]
    },
    {question:"Sea Change",
      answer: "When the current environment shifts in such a way that some strategies are no longer viable.",
      wrongAnswers: ["The most worrying part of global warming.",
        "To pivot your company to a new heading.",
        "To transfer your business to a new, distant location."]
    },
    {question:"Potempkin Villiage",
      answer: "To deceive others into thinking things are better than they are.",
      wrongAnswers: ["The capital city of Palau",
        "When a new idea takes over an old one due to a vocal minority.",
        "To create a sense of false prosperity for outsiders."]
    },
    {question:"Knowledge Process Outsourcing",
      answer: "To outsource information services to an external company.",
      wrongAnswers: ["To outsource management to an overseas entity.",
        "To bring in new talent to tackle a troubling problem.",
        "A form of data binding popular in big data startups."]
    },
    {question:"Long Tail",
      answer: "Any grouping that falls outside of the center of a bell curve.",
      wrongAnswers: ["A delayed packet that halts program execuion",
        "A shot popular in tech hubs spiked with Modafinil.",
        "To successfully balance tricky and sometimes competing goals."]
    },
    {question:"Storytelling",
      answer: "To put forth a story about your business.",
      wrongAnswers: ["To misdirect with a half-truth.",
        "To relay critical information in monologue format.",
        "To entertain with a witty anecdote."]
    },
    {question:"Rightshoring",
      answer: "To properly locate the best place to locate your IT and manufacturing needs.",
      wrongAnswers: ["To always keep the goal in sight and properly maintain project scope.",
        "To locate your data centers close to your largest customer base.",
        "A form of data packing which results in short average retrieval time but with a long tail."]
    },
    {question:"U+1F648; U+1F649; U+1F64A;",
      answer: "See no evil, hear no evil, do no evil.",
      wrongAnswers: ["'I just watched a scary scene!'",
        "I'm at a club full of old people dancing!",
        "This band is lit!"]
    },
    {question:"U+1F63B;",
      answer: "love!",
      wrongAnswers: ["You/I see the world through rose-colored glasses.",
        "I just swooned!",
        "My blood sugar is over 9,000!"]
    },
    {question:"U+2744;",
      answer: "Its cold!",
      wrongAnswers: ["I just got frozen out by a cute girl.",
        "I'm totally lost.",
        "I just scored!"]
    },
    {question:"U+27B0;",
      answer: "I went out of my way",
      wrongAnswers: ["I'm exiting the highway.",
        "Onion",
        "crossed wires"]
    },
    {question:"U+261D;",
      answer: "pointing",
      wrongAnswers: ["Is it a bird?  Is it a plane?  No, its...",
        "A more polite way to ask someone to leave you alone.",
        "A gang sign for the Rowdy Nippers."]
    },
    {question:"U+264B;",
      answer: "Cancer",
      wrongAnswers: ["My girlfriend is pregant!",
        "Allegedly",
        "circling the point without getting to it."]
    },
    {question:"U+3030;",
      answer: "I  Moustache You a Question!",
      wrongAnswers: ["Its roughly that",
        "It was a long and windy road.",
        "The seas are rough."]
    },
    {question:"U+1F346;",
      answer: "References male anatomy",
      wrongAnswers: ["I left my food out too long.",
        "Metrosexual",
        "I'm vegetarian"]
    },

  ]
}

let test = new Deck(d);
console.log(test)
test.answeredQuestionCorrectly();
console.log(test)

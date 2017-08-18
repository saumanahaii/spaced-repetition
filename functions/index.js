const cors = require('cors')({origin: true});

const firebase = require('firebase');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
// /** Creates an empty deck object ready to be populated.*/
// exports.makeDeck = functions.https.onRequest((req,res) =>{
//   cors(req,res, ()=>{
//     res.send(makeDeck());
//   })
// })
//new experiment: bring in everything and then just export the functions we'll need to touch.


let timeFunction = {
  soon: 3600,
  soonish: 28800,
  later: 86400,
  learned: 259200
};

let makeDeck = () => {
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

/** Check a stack for whether the face card's due time is less than now
* @param {string} target - The queue's name that is being targeted
* @param {object} deck - Optional argument to target a specific deck.  Defaults to current deck.
*/
let checkStackforDueCards = (target, deck) => {
  if(deck[target]){
    if(fetchFirst(target, deck).due < Date.now()){
      switchStack(target, "now", deck);
      checkStackforDueCards(target, deck);
    }
  }
  return deck;
}

/** calls the checkStackforDueCards function on all stacks.  Also creates charts for learned and unlearned.
* @param {object} deck - Optional argument to target a specific deck.  Defaults to current deck.
*/
let checkAllStackforDueCards = (deck) => {
  checkStackforDueCards("soon", deck);
  checkStackforDueCards("soonish", deck);
  checkStackforDueCards("later", deck);
  checkStackforDueCards("learned", deck);

  //evaluates whether to add in a new entry to the data logging
  if(Date.now()>deck.scoresOverTime[deck.scoresOverTime.length-1].date+60000){
    //create an entry
    deck.scoresOverTime.push({
      date: Date.now(),
      learned: deck.counts.learned,
      toLearn: deck.counts.unstaged
    });
  }
  return deck;
}

/** populates the deck from the provided json object
* @param {object} data - The data with which to populate the deck as an object.
*/
let populateDeck = (data, deck) => {
  data.deck.forEach(el => {
    add(el, "unstaged", deck);
  })
  //add the unstaged count into the counts object
  deck.counts.unstaged = data.deck.length;
  return deck;
}

/** Adds a card to the target deck.  Calls makeCard to turn data into a new card.
* @param {object} data - The data to make a card with
* @param {string} target - The sting name of the targeted queue
* @param {object} deck - Optional argument to target a specific deck.  Defaults to current deck.
*/
let add = (data, target, deck) => {
  let card = makeCard(data);
  push(card, target, deck);
  return deck;

}

//Make a card.
let makeCard = (cardData) => {
  cardData.child = null;
  cardData.due = null;
  cardData.study = false;
  cardData.currentStack = "now"
  return cardData;
}

/** Takes a list and removes the first item from it.
* @param {string} target - The string name of the queue being targeted
* @param {object} deck - Optional argument to target a specific deck.  Defaults to current deck.
*/
let shift = (target, deck) => {
  let item = fetchFirst(target, deck);
  if(deck[target]){
    if(deck[target].child){
        deck[target] = deck[target].child;
    }else{
      deck[target] = null;
    }
  }
  if(item){
    item.child = null;
  }

  //console.log("deck in shift is...", deck);
  return [item,deck];
}

/** push item onto end of queue
*@param {object} card - The card to push onto the queue, as formatted by the makeCard function
* @param {string} target - The string name of the queue being targeted
* @param {object} deck - Optional argument to target a specific deck.
*/
let push = (card, target, deck) => {
  let head = fetchEnd(target,deck);
  //if first element does not exist yet, make it
  if(!head){
    deck[target] = card;
  }else{
    head.child = card;
  }
  return deck;
}

/** Returns the first element of a queue without removing it.
* @param {string} target - The string name of the queue being targeted
* @param {object} deck - Optional argument to target a specific deck.  Defaults to current deck.
*/
let fetchFirst = (target, deck) => {
  return deck[target];
}

/** Returns the last element of a queue without removing it.
* @param {string} target - The string name of the queue being targeted
* @param {object} deck - Optional argument to target a specific deck.
*/
let fetchEnd = (target, deck) => {
  // console.log("target in fetchend is",target)
  // console.log("fetchEnd deck with target is...",deck[target])
  //fetches the end of the queue, so that we can stick on an element.
  if(deck[target]){
    let current = deck[target];
    //console.log("...current child is....",current.child)
    while (current.child){
      current = current.child;
    }
    return current;
  }
  return null;
}

/** Move a number of cards from unstaged to now
* @param {integer} num - Optionally the number of cards to move from 'unstaged' to 'now'.  Defaults to 1.
* @param {object} deck - Optional argument to target a specific deck.
*/
let stageCards = (num = 1, deck) => {
  for(let i=0;i<num;i++){
    switchStack("unstaged", "now", deck);
  }
  deck.counts["now"] += num;
  deck.counts["unstaged"] -= num;
  return deck;
}

/** Move face card from one stack to the end of another and manage count
* @param {string} origin - The string name of the origin queue
* @param {string} target - The string name of the queue being targeted
* @param {object} deck - Optional argument to target a specific deck.
*/
let switchStack = (origin, target,deck) =>{
  let shiftVals = shift(origin, deck)
  let item = shiftVals[0];
  deck = shiftVals[1];
  item.due = Date.now();
  item.due += item.currentStack === "now" ? timeFunction.soon :
    item.currentStack === "soon" ? timeFunction.soonish :
      item.currentStack === "soonish" ? timeFunction.later :
        timeFunction.learned;
  item.currentStack =
    item.currentStack === "now" ? "soon" :
      item.currentStack === "soon" ? "soonish" :
        item.currentStack === "soonish" ? "later" :
          "learned";
  if(origin != "unstaged"){
    deck.counts[origin] -= 1;
    deck.counts[target] += 1;
  }
  push(item, target, deck);
  return deck;
}

let deckInit = (data) =>{
  let deck = makeDeck();
  deck.name = data.name;
  deck.subject = data.subject;
  deck = populateDeck(data, deck);
  deck = stageCards(5, deck);
  deck.scoresOverTime[0].toLearn = data.deck.length;
  return deck;
}

/** Pushes the question to the next queue as needed and toggles learning state
* @param {object} card - Optionally the node in the queue to use.  Defaults to first card of 'now'
*/
let answeredQuestionCorrectly = (deck, card) => {
  if(typeof card === "undefined"){
      //fetch the first card using the function
      fetchFirst(deck);
  }
  if(card.study){
    card.study = false;
    switchStack("now", "soon", deck)
  }else{
    card.due = Date.now();
    card.due += card.currentStack === "now" ? timeFunction.soon :
      card.currentStack === "soon" ? timeFunction.soonish :
        card.currentStack === "soonish" ? timeFunction.later :
          timeFunction.learned;
    card.currentStack =
      card.currentStack === "now" ? "soon" :
        card.currentStack === "soon" ? "soonish" :
          card.currentStack === "soonish" ? "later" :
            "learned";

    switchStack("now", card.currentStack, deck);
  }
  return deck;
}

exports.answeredQuestionCorrectly = functions.https.onRequest((req,res) => {
  cors(req,res,()=>{
    let body = JSON.parse(req.body);
    let deck = body.deck;
    let uId = body.uId;
    let deckId = body.deckId;
    console.log("...uid is",uId);
    //move the card to the end of the queue
    deck = switchStack("now", deck.now.currentStack, deck);

    return admin.database().ref(`/users/${uId}/decks/`).once('value').then(decks=>{
      decks = decks.val();
      console.log("Decks from the database:",decks);
      decks[deckId] = deck;
      return decks;
    }).then(decks=>{
      //do the database set
      return admin.database().ref('/users/' + uId).set({
        decks:decks
      })
    }).then(()=>{
      res.send("ok!");
    })
  })
})

/** Moves card to end of stack and resets the currentStack*/
exports.answeredQuestionIncorrectly = functions.https.onRequest((req,res) => {
  cors(req,res,()=>{
    let body = JSON.parse(req.body);
    let deck = body.deck;
    let uId = body.uId;
    let deckId = body.deckId;
    console.log("...uid is",uId);
    //move the card to the end of the queue
    let shiftVals = shift("now", deck);
    let failedCard = shiftVals[0];
    deck = shiftVals[1];

     failedCard.currentStack = "now";
     let question = fetchEnd("now", deck);
     if(question){
      question.child= failedCard;
    }else{
      deck.now = failedCard;
    }
    //return deck;
    //console.log("deck after fetching back and forth:", deck);
    //now I need to update the entry.  Start by fetching the array.
    return admin.database().ref(`/users/${uId}/decks/`).once('value').then(decks=>{
      decks = decks.val();
      console.log("Decks from the database:",decks);
      decks[deckId] = deck;
      return decks;
    }).then(decks=>{
      //do the database set
      return admin.database().ref('/users/' + uId).set({
        decks:decks
      })
    }).then(()=>{
      res.send("ok!");
    })
  })
})

//get the user's deck
exports.getspecificUserDeck = functions.https.onRequest((req,res)=>{
  cors(req,res, ()=>{
    let body = JSON.parse(req.body);
    //console.log("body is ",body);
    let uId = body.uid;
    let deckId = body.deckId;
    //console.log("uID...", uId);
    //console.log("deckId...", deckId);
    admin.database().ref(`/users/${uId}/decks/`).once('value').then(decks=>{
      decks = decks.val();
      let activeDeck = decks[deckId];
      //check for due cards
      activeDeck = checkStackforDueCards("soon",activeDeck);
      activeDeck = checkStackforDueCards("soonish",activeDeck);
      activeDeck = checkStackforDueCards("later",activeDeck);
      activeDeck = checkStackforDueCards("learned",activeDeck);
      console.log(activeDeck);
      //write the deck into the database
      //now I need to update the entry.  Start by fetching the array.
      return admin.database().ref(`/users/${uId}/decks/`).once('value').then(decks=>{
        decks = decks.val();
        console.log("Decks from the database:",decks);
        decks[deckId] = activeDeck;
        return decks;
      }).then(decks=>{
        //do the database set
        return admin.database().ref('/users/' + uId).set({
          decks:decks
        }).then(()=>{
          return decks;
        })
      }).then((decks)=>{
        res.send(decks[deckId]);
      })


      res.send(decks[deckId]);
    })
  })
})

//pass in the deck index and the userId, and it adds the deck to the user.
exports.deckInit = functions.https.onRequest((req,res) => {
  let body = JSON.parse(req.body);
  //console.log(body)
  cors(req,res, ()=>{
    let deckId = body.deckId;
    let uId = body.uid;
    //get deck from id
    admin.database().ref('/decks/').once('value').then(snapshot=>{
      let deck = snapshot.val()[deckId];
      //console.log(deck);
      deck = deckInit(deck);
      return {deck: deck, uId: uId}
    }).then(vals=>{
      //console.log(vals)
      return admin.database().ref(`/users/${vals.uId}/decks`).once('value').then(decks=>{
        decks = decks.val()
        //console.log('user decks are...', decks);
        if(!decks){
          decks = [];
        }
        decks[deckId] = vals.deck;
        return admin.database().ref('/users/' + vals.uId).set({
          decks:decks,
        })
      })
    }).then(()=>{
      res.send("ok!");

    })

  })
})

exports.queueCards = functions.https.onRequest((req,res) => {
  console.log("queue cards called")
  cors(req,res,()=>{
    let body = JSON.parse(req.body);
    let deck = body.deck;
    let uId = body.uId;
    let deckId = body.deckId;
    console.log("...uid is",uId);
    deck = stageCards(5, deck);

    //now I need to update the entry.  Start by fetching the array.
    return admin.database().ref(`/users/${uId}/decks/`).once('value').then(decks=>{
      decks = decks.val();
      console.log("Decks from the database:",decks);
      decks[deckId] = deck;
      return decks;
    }).then(decks=>{
      //do the database set
      return admin.database().ref('/users/' + uId).set({
        decks:decks
      })
    }).then(()=>{
      res.send("ok!");
    })
  })
})

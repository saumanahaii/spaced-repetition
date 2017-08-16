const cors = require('cors')({origin: true});
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

//the string that is used in fetch requests
let cloudString = 'https://us-central1-emojinal-485b9.cloudfunctions.net/makeDeck';



exports.makeCard = functions.https.onRequest((req,res) =>{
  let makeCard = (cardData) => {
    cardData.child = null;
    cardData.due = null;
    cardData.study = false;
    cardData.currentStack = "now"
    return cardData;
  }
  res.send(makeCard(req.body.cardData));
})

/** Creates an empty deck object ready to be populated.*/
exports.makeDeck = functions.https.onRequest((req,res) =>{
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
  cors(req,res, ()=>{
    res.send(makeDeck());
  })
})

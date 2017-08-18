import * as firebase from 'firebase';

export const SET_USER = "SET_USER";
export const setUser = (user) =>({
  type: SET_USER,
  user
});

export const SET_LOADING = "SET_USER";
export const setLoading = (loading) =>({
  type: SET_USER,
  loading
});

export const SET_CURRENT_DECK = "SET_CURRENT_DECK";
export const setCurrentDeck = (deck, currentDeckIndex) =>({
  type:SET_CURRENT_DECK,
  deck,
  currentDeckIndex
});

export const GET_DEFAULT_DECKS = "GET_DEFAULT_DECKS";
export const getDefaultDecks = (decks) =>({
  type: GET_DEFAULT_DECKS,
  decks
});
export const SET_USER_DECKS = "SET_USER_DECKS";
export const setUserDecks = (decks) =>({
  type: SET_USER_DECKS,
  decks
});
// export const SET_ACTIVE_DECK = "SET_ACTIVE_DECK";
// export const setActiveDeck = (deck) =>({
//   type: GET_DEFAULT_DECKS,
//   deck
// });


export const getDefaultDecksAsync = () => dispatch => {
  return firebase.database().ref('/decks/').once('value').then(function(snapshot) {
    dispatch(getDefaultDecks(snapshot.val()))

});
}

export const getUserDecksAsync = (uId) => dispatch => {
  console.log(uId)
  return firebase.database().ref('/users/' + uId).once('value').then(function(snapshot) {
    //console.log("decks are: ",snapshot.val());
    if(snapshot.val()){
      dispatch(setUserDecks(snapshot.val().decks))
    }else{
      dispatch(setUserDecks(null))
    }

});
}

export const setActiveDeckAsync = (deckId,uId) => dispatch => {
  //get the deck, then store it in the activeDeck place

  fetch('https://us-central1-emojinal-485b9.cloudfunctions.net/getspecificUserDeck',{
    method: 'POST',
    body: JSON.stringify({
      uid: uId,
      deckId: deckId
    })
  }).then((decks)=>decks.json()).then(deck=>{

    console.log("................");
    console.log(deck);
    console.log("...User's decks are ", deck)
    //dispatch(setUserDecks(decks))
    //dispatch(setLoading(false));
    dispatch(setCurrentDeck(deck, deckId))
  })

}

export const chooseDefaultDeck = (deckId, uId) => dispatch => {
  console.log("hit the chooseDefaultDeck")
  //first things first, lets set loading.
  dispatch(setLoading(true));
  fetch('https://us-central1-emojinal-485b9.cloudfunctions.net/deckInit',{
    method: 'POST',
    type: 'cors',
    body: JSON.stringify({
      uid: uId,
      deckId: deckId
    })
  }).then(()=>{
    dispatch(setLoading(false));
    console.log("................");
    dispatch(getUserDecksAsync(uId))
  })
}

export const chooseAnswerIncorrectly = (deck, deckId,uId) => dispatch =>{
  console.log("Passed in uId is...", uId);
  fetch('https://us-central1-emojinal-485b9.cloudfunctions.net/answeredQuestionIncorrectly',{
    method: 'POST',
    type: 'cors',
    body: JSON.stringify({
      uId: uId,
      deckId: deckId,
      deck: deck
    })
  }).then(()=>{
    console.log("................");
    setTimeout(()=>dispatch(setActiveDeckAsync(deckId, uId)),1500);

  })
}

export const chooseAnswerCorrectly = (deck, deckId,uId) => dispatch => {
  console.log("Passed in uId is...", uId);
  fetch('https://us-central1-emojinal-485b9.cloudfunctions.net/answeredQuestionCorrectly',{
    method: 'POST',
    type: 'cors',
    body: JSON.stringify({
      uId: uId,
      deckId: deckId,
      deck: deck
    })
  }).then(()=>{
    console.log("................");
    setTimeout(()=>dispatch(setActiveDeckAsync(deckId, uId)),1500);

  })
}

export const queueCards = (deck, deckId, uId) => dispatch => {
  fetch('https://us-central1-emojinal-485b9.cloudfunctions.net/queueCards',{
    method: 'POST',
    type: 'cors',
    body: JSON.stringify({
      uId: uId,
      deckId: deckId,
      deck: deck
    })
  }).then(()=>{
    console.log("................");
    dispatch(setActiveDeckAsync(deckId, uId));
  })
}

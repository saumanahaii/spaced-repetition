import * as firebase from 'firebase';

export const SET_USER = "SET_USER";
export const setUser = (user) =>({
  type: SET_USER,
  user
});
export const GET_DEFAULT_DECKS = "GET_DEFAULT_DECKS";
export const getDefaultDecks = (decks) =>({
  type: GET_DEFAULT_DECKS,
  decks
});
export const getDefaultDecksAsync = () => dispatch => {
  //console.log("Hit the get Default Deck List action");
  return firebase.database().ref('/decks/').once('value').then(function(snapshot) {
    dispatch(getDefaultDecks(snapshot.val()))
});
}

//export const SET_ACTIVE_DECK = "SET_ACTIVE_DECK";
export const setActiveDeckAsync = (deck) => dispatch => {
  //create the entry into the user's database
  console.log(deck)
}

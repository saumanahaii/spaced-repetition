import {SET_USER, GET_DEFAULT_DECKS, SET_USER_DECKS, SET_CURRENT_DECK, SET_LOADING} from '../actions/action';

const initialState = {
  user: {},
  defaultDecks: [],
  userDecks: [],
  activeDeck: {},
  loading: false
}

export default function reducer(state = initialState, action){
  //console.log(action)
  switch(action.type){
    case SET_USER:
      //console.log("setting user!");
      return {...state, user: action.user};
    case GET_DEFAULT_DECKS:
      //console.log("Getting the default deck!");
      //console.log(action)
      return {...state, defaultDecks : action.decks}
    case SET_USER_DECKS:
      //console.log("Getting the default deck!");
      //console.log(action)
      return {...state, userDecks : action.decks}
    case SET_CURRENT_DECK:
      //console.log("setting user!");
      return {...state, activeDeck: action.deck,currentDeckIndex: action.currentDeckIndex};
    case SET_LOADING:
      //console.log("setting user!");
      return {...state, loading: action.loading};

    default:
      // console.log("not in the list...")
      // console.log(action.type)
      return state;
  }
}

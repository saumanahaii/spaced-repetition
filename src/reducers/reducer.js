import {SET_USER, GET_DEFAULT_DECKS} from '../actions/action';

const initialState = {
  user: {},
  decks: [],
  activeDeck: {}
}

export default function reduxer(state = initialState, action){
  //console.log(action)
  switch(action.type){
    case SET_USER:
      //console.log("setting user!");
      return {...state, user: action.user};
    case GET_DEFAULT_DECKS:
      //console.log("Getting the default deck!");
      //console.log(action)
      return {...state, decks : action.decks}

    default:
      // console.log("not in the list...")
      // console.log(action.type)
      return state;
  }
}

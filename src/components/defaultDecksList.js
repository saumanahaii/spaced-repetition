import React, { Component } from 'react';
import { connect } from 'react-redux';
import {getDefaultDecksAsync, setActiveDeckAsync, chooseDefaultDeck} from '../actions/action';

export class DefaultDecksList extends Component{

  componentWillMount(){
    //dispatch the getDefaultDecks action
    this.props.dispatch(getDefaultDecksAsync());
  }
  clickedSelect(event,uId, index){
    event.preventDefault();
    //dispatch the deck to the user's database
    this.props.dispatch(chooseDefaultDeck(index, uId));
  }
  render(){
    let decks = this.props.defaultDecks.map((deck, index)=>{
      return (
        <div key={index} className="deckEntry">
          <h2>{deck.name}</h2>
          <h3>{deck.subject}</h3>
          <button onClick={(event)=>this.clickedSelect(event, this.props.user.uid, index)}>Select this Deck</button>
        </div> )
    })
    return (
      <div>
        <p>Import a deck from this list...</p>
        {decks}
      </div>
    )
  }

}

export const mapStateToProps = state => ({
  defaultDecks : state.defaultDecks,
  user : state.user
})

export default connect(mapStateToProps)(DefaultDecksList);

import React, { Component } from 'react';
import { connect } from 'react-redux';
import {getDefaultDecksAsync, setActiveDeckAsync} from '../actions/action';

export class DecksList extends Component{

  componentWillMount(){
    //dispatch the getDefaultDecks action
    this.props.dispatch(getDefaultDecksAsync());
  }
  clickedSelect(event,index){
    event.preventDefault();
    //dispatch the deck to the user's database
    //console.log("clicked deck:",this.props.decks[index]);
    this.props.dispatch(setActiveDeckAsync(this.props.decks[index]))

  }
  render(){
    let decks = this.props.decks.map((deck, index)=>{

      return (<div key={index} className="deckEntry"><h2>{deck.name}</h2><h3>{deck.subject}</h3><button onClick={(event)=>this.clickedSelect(event,index)}>Select Deck</button></div> )
    })

    //console.log("decks",decks)
    return (
      <div className="defaultDeckList">
        <p>Select a deck...</p>
        {decks}
      </div>
    )
  }

}

export const mapStateToProps = state => ({
  decks : state.decks
})

export default connect(mapStateToProps)(DecksList);

import React, { Component } from 'react';
import { connect } from 'react-redux';
import {getUserDecksAsync, setActiveDeckAsync, chooseDefaultDeck} from '../actions/action';

export class UserDecksList extends Component{

  componentWillMount(){
    //dispatch the getDefaultDecks action
    this.props.dispatch(getUserDecksAsync(this.props.user.uid));
  }
  clickedSelect(event,index){
    event.preventDefault();
    //dispatch the deck to the user's database
    console.log('uid is ',this.props.user.uid);
    this.props.dispatch(setActiveDeckAsync(index,this.props.user.uid))
  }
  render(){
    console.log("hit the render function!")
    let decks;
    //console.log(this.props.userDecks)
    if(this.props.userDecks){
      decks = this.props.userDecks.map((deck, index)=>{
        //console.log(deck)
        return (
          <div key={index} className="deckEntry">
            <h2>{deck.name}</h2>
            <h3>{deck.subject}</h3>
            <button onClick={(event)=>this.clickedSelect(event,index)}>Select Deck</button>
          </div> )
      })
    }else{
      return (<h2>You have no decks.  Please select one in the list below</h2>)
    }

    return (
      <div>
        <p>Select a deck...</p>
        {decks}
      </div>
    )
  }

}

export const mapStateToProps = state => ({
  userDecks : state.userDecks,
  user : state.user
})

export default connect(mapStateToProps)(UserDecksList);

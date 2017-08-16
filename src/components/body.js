import React, { Component } from 'react';
import { connect } from 'react-redux';
//import Card from './card';
import DecksList from './decksList';

export class Body extends Component{

  fbTest = () => {
    fetch('https://us-central1-emojinal-485b9.cloudfunctions.net/makeDeck').then(response=>{
      console.log(response);
    })
  }

  render(){
    let body;
    let card = (<card />);
    if(Object.keys(this.props.activeDeck).length===0){
      if(Object.keys(this.props.user).length===0){
        body = (<p>Log into your account.</p>)
      }else{
        body = (<DecksList />);
      }

    }else{
      body = card;
    }

    return (
      <div className="body">
        {body}
        <button onClick={()=>this.fbTest()}>Testing Firebase stuff...</button>
      </div>
    )
  }
}

export const mapStateToProps = state => ({
  activeDeck : state.activeDeck,
  user: state.user
})

export default connect(mapStateToProps)(Body);

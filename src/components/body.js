import React, { Component } from 'react';
import { connect } from 'react-redux';
import Card from './card';
import DefaultDecksList from './defaultDecksList';
import UserDecksList from './userDecksList';

export class Body extends Component{
  render(){
    console.log((<UserDecksList />))

    let body;
    let card = (<Card />);
    if(!this.props.loading){
      if(Object.keys(this.props.activeDeck).length===0){
        if(Object.keys(this.props.user).length===0){
          console.log("displaying the login message")
          body = (<h2>Log into your account.</h2>)
        }else{
          console.log("display defaultDecksList")
          body = (<div className="deckListHolder">
                    <UserDecksList />
                    <DefaultDecksList />
                  </div>);
        }

      }else{
        console.log("in the card display area.")
        body = card;
      }
    }else{
      //loading
      body=(<h1>...Loading...</h1>)
    }
    return (
      <div className="body">
        {body}
      </div>
    )
  }
}

export const mapStateToProps = state => ({
  activeDeck : state.activeDeck,
  user: state.user,
  loading: state.loading
})

export default connect(mapStateToProps)(Body);

import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as firebase from 'firebase';
import {getDefaultDecksAsync} from '../actions/action';


export class defaultDeckList extends Component{
  componentWillMount(){
    //dispatch the getDefaultDecks action
    this.props.dispatch(getDefaultDecksAsync());
  }

  render(){
    return (
      <div className="defaultDeckList">
        <p>Select a deck...</p>

      </div>
    )
  }

}

export const mapStateToProps = state => ({
  activeDeck : state.activeDeck,
  user: state.user
})

export default connect(mapStateToProps)(defaultDeckList);

import React, { Component } from 'react';
import { connect } from 'react-redux';
import {setCurrentDeck} from './actions/action';
import './App.css';
import Login from './components/login';
import Body from './components/body';
import './css/css.css';
import './css/scanlines.css';

class App extends Component {

  clickedHeader(){
    //clear the activeDeck
    console.log("clicked header!")
    this.props.dispatch(setCurrentDeck({}));
  }

  render() {
    return (
      <div className="App">

        <div className="header">
          <h1 onClick={()=>this.clickedHeader()}>Emojinal</h1>
          <Login />
        </div>
        <Body />
      </div>
    );
  }
}



export default connect()(App);

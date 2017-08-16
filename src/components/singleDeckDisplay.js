import React, { Component } from 'react';
import { connect } from 'react-redux';

export class SingleDeckDisplay extends Component{

  render(){
    return (
      <div className="deckDisplay">
        <h2>Deck</h2>
        <h3>The description</h3>
      </div>
    )
  }
}

export const mapStateToProps = state => ({

})

export default connect(mapStateToProps)(SingleDeckDisplay)

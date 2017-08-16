import React, { Component } from 'react';
import { connect } from 'react-redux';

export class Card extends Component{

  render(){
    return (
      <div className="card">
        <h2>Question</h2>
        <button>Answer 1</button>
        <button>Answer 2</button>
        <button>Answer 3</button>
        <button>Answer 4</button>
      </div>
    )
  }
}

export const mapStateToProps = state => ({

})

export default connect(mapStateToProps)(Card)

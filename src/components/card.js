import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from "underscore";
import {chooseAnswerCorrectly,chooseAnswerIncorrectly, queueCards} from '../actions/action';

export class Card extends Component{
  constructor(props){
    super(props);
    this.state={
      rightorWrong: null
    }
  }

  componentWillReceiveProps(){
    this.setState({rightorWrong: null})
  }

  clickedSelect(e, answer){
    let currentCard = this.props.deck.now
    if(answer === currentCard.answer){
      console.log("You're right!");
      //fire off answered correctly function
      this.props.dispatch(chooseAnswerCorrectly(this.props.deck,this.props.currentDeckIndex,this.props.user.uid))
      this.setState({rightorWrong: (<h2>You are right!</h2>)})
    }else{
      console.log("you're wrong!");
      //fire off answered correctly function
      this.props.dispatch(chooseAnswerIncorrectly(this.props.deck,this.props.currentDeckIndex,this.props.user.uid))
      this.setState({rightorWrong: (<h2>You are Wrong! Answer is {currentCard.answer}</h2>)})
    }
  }

  clickedQueue(e){
    this.props.dispatch(queueCards(this.props.deck, this.props.currentDeckIndex,this.props.user.uid));
  }

  render(){
    let currentCard = this.props.deck.now;
    if(currentCard){
      let answers = [...currentCard.wrongAnswers, currentCard.answer]
      answers = _.shuffle(answers);

      let renderedAnswers = this.state.rightorWrong !== null ? null : answers.map((answer, index)=>{
        return (<button onClick={(event)=>this.clickedSelect(event, answer)} key={index}>{answer}</button>)
      })
      return (
        <div>
          <div className="card">
            <h2>{currentCard.question}</h2>
            {renderedAnswers}
            {this.state.rightorWrong}
          </div>
        </div>
      )
    }else{
      return (
        <div className="card">
        <h2>Out of cards!</h2>
        <button onClick={(event)=>this.clickedQueue(event)}>Queue Up Some More</button>
        </div>
      )
    }
  }
}

export const mapStateToProps = state => ({
  user: state.user,
  deck: state.activeDeck,
  currentDeckIndex : state.currentDeckIndex
})

export default connect(mapStateToProps)(Card)

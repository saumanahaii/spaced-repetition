import React, { Component } from 'react';
import * as firebase from 'firebase';
import  '../firebase';
import { connect } from 'react-redux';

import  {setUser} from '../actions/action';

export class Login extends Component{
  constructor(props){
    super(props)
    this.provider = new firebase.auth.GoogleAuthProvider();
    this.login = this.login.bind(this)
    this.componentDidMount = this.componentDidMount.bind(this)
  }
  login(){
    console.log("clicked login button");
    firebase.auth().signInWithRedirect(this.provider);
  }

  componentDidMount(){
    let self = this;
    firebase.auth().getRedirectResult().then(function(result) {
    if (result.credential) {
      // This gives you a Google Access Token. You can use it to access the Google API.
      //var token = result.credential.accessToken;
      var user = result.user;
      //let action = setUser(user);

      //self.props.dispatch(action);
      self.props.dispatch(setUser(user));

      // ...
    }
    //this.props.dispatch(setUser(user));
    }).catch(function(error) {
      // Handle Errors here.
      //var errorCode = error.code;
      //var errorMessage = error.message;
      // The email of the user's account used.
      //var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      //var credential = error.credential;
      // ...
    });
  }

  render(){
    let loginForm = (<button onClick={()=>this.login()} id="login">Log In </button>);

    let loggedIn = (<p>User name: {this.props.user.displayName} </p>)

    let form = Object.keys(this.props.user).length>0 ? loggedIn : loginForm;

    return form
  }
}

export const mapStateToProps = state => ({
  user: state.user
})

export default connect(mapStateToProps)(Login);

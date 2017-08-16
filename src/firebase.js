import * as firebase from 'firebase';

var config = {
    apiKey: "AIzaSyB3OArI3iszCOy_2z6uUWF3SyKdzq-I_ew",
    authDomain: "emojinal-485b9.firebaseapp.com",
    databaseURL: "https://emojinal-485b9.firebaseio.com",
    projectId: "emojinal-485b9",
    storageBucket: "emojinal-485b9.appspot.com",
    messagingSenderId: "896852002235"
  };






export const fbApp = firebase.initializeApp(config);
export const auth = firebase.auth();
export const fbDb = firebase.database();

# Emojinal, a Spaced Repetition App

![Image of the Emojinal spaced repetition app](http://i.imgur.com/pXp7dtr.png)

## What is it?
A spaced repetition app powered by Mongo, React/Redux and Firebase.  It is a serverless application that runs its server code through Firebase Functions and its database through Firebase's real-time database.

## How to use it?
Sign in using the button at the top, then select a deck from the list of default decks.  Right now there is only one.  Once you click it, your user gets a copy of the deck stored in the database.  Select it to set it as the active deck, then answer the questions as they come.  
It uses a simple spaced-repetition algorithm based on a series of stacks: Now, Soon, Soonish, Later, and Learned.  Cards are queued from one more stack called Unstaged.  As you learn cards, they get moved to the various stacks and their due time is altered.  By checking the first card, you know whether there are any due cards in the entire stack.  If there are, the deck is looped over until all the due cards are in the Now stack.
## Who made it?
[Zach Williams](http://www.zachwilliams.xyz) while going through the Thinkful bootcamp.

## Can I use it?
Sure!  Do what you will with the code.  It is licensed under a Creative Commons 2.0 Attribution license.  If you want to use the deployed site, feel free to do that too!

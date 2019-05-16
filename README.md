# NIM game API

Coding Kata May 2019  
Author: Julius F. Martin

## Introduction
This project implements a simple RESTful API to play the [game of NIM](https://en.wikipedia.org/wiki/Nim) with a computer enemy. It supports two different game modes (hard, simple). The player who is able to take the last object from the game wins the game.

Tech stack:
- [Node.js](https://nodejs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Express.js](http://expressjs.com/)
- [Ava](https://github.com/avajs)  


    ¯\_( ͡☉ ͜ʖ ͡☉)_/¯  Thats IT

## Usage

### Installation and requirements
The system needs a recent version of node.js installed. This software was developed with node v8.9.4.  
To install the required packages run ```npm i```  

### Start application
To start the application in development mode run ```npm run start:```  
To build the application run ```npm run build```  
To use [pm2](http://pm2.keymetrics.io/docs/usage/quick-start/) an ```ecosystem.config.js``` is available.
  
*Hint*: If you are starting the application in a different environment you might want to set the environment variable ```DEBUG="nim:*"``` to see some logs on the console.
### Run tests
Run ```npm run test```

## Routes
You can find a Postman collection (```postmanCollection.json```) which contains all available routes in this repository.  
As base of all the following route the configured ```port``` and ```apiRoot``` are used. By default the base path is ```localhost:4263/nim```.  
### Start game
Route: /  
Method: POST  
Body: 
<pre>
{
	"mode": "simple"
}
</pre>
Attribute mode is (optional): If set to 'simple' the game mode is set to simple. Otherwise starts on hard mode.  

Starts a new game of NIM with the given game mode. If a game is already existing its overwritten by the new one.
### Get game status
Route: /  
Method: GET  
Returns a formatted current game state as described on chapter [Returned game status JSON object](#returned-game-status-json-object)
### Make a move
Route: /  
Method: PUT  
Body: 
<pre>
{
	"row": 2,
	"take" :5
}
</pre>
This route is to be used to perform a game move. The 'row' attribute selects the stack from which objects should be taken. Counting start at 0 for the first row. The 'take' attribute sets the number of object that the player want to remove from the selected stack.
Returns the status after the player performed his move and the current status after the following computer move. Example:
<pre>
{
    "message": "Computer also moved",
    "statusBefore": {...},
    "statusNow": {...}
}
</pre>
If the game is over the Message will show a win message. I the player wins and the computer can't perform another move the statusNow is null.
### Delete the current game
Route: /  
Method: DELETE  

#### Returned game status JSON object
The returned status object contains the following attributes:
* stacks: List of numbers representing the current game state
* readable: A string to be displayed on a console showing the game state in a more readable format
* playersChoice: Is true when the player is to perform a move. As the computer moved automatically its the standard case in the return send to the client.
* lastMove: False on game start. Shows who took how many objects from which stack on the last move.
* gameMode: Selected game mode as string. Hard or simple.
* isGameOver: Is true if there are no objects left in the stacks
Example:
<pre>
{
    "stacks": [
        1,
        3,
        5,
        7
    ],
    "readable": "0:1 \t |\n1:3 \t |||\n2:5 \t |||||\n3:7 \t |||||||",
    "playersChoice": true,
    "lastMove": {
        "player": true,
        "stack": 2,
        "take": 5
    },
    "gameMode": "hard",
    "isGameOver": false
}
</pre>

## Configuration
To configure the API and the game use the file ```config/default.json```  
Default configurations is
<pre>
{
  "port": 4263,
  "apiRoot": "/nim",
  "startSituation": [1,3,5,7]
}
</pre>
* port: Api port
* apiRoot: Root path that is used (example localhost:{port}/{apiRootPath})
* startSituation: Game stack situation at game start

## Game Modes
There are two different game modes existing which can be set on the start if the game. The hard mode is default.
### Hard
Playing the hard mode means the computer will always perform the ideal steps and the player only has a possibility of 30% to start the game if the start situation is unbalanced. In case of the computer starting the first round of an unbalanced start, its impossible for the player to win.
### Simple
Playing the simple mode means that the computer will not make the perfect moves. In 70% of the cases the computer will instead just remove a random object from a random stack. Also the player will have a good starting position in 75% of the cases.

## How to play now?

After installation, build and run or development start you can start a new game with
<pre>
POST:http://localhost:4263/nim/
</pre>
To perform a game move you have to use
<pre>
PUT:http://localhost:4263/nim
body: {
    "row": 3,
    "take" : 1
}
</pre>
The response in JSON format will show the current game state and the last move which was performed by the player and the computer.  
*If the configuration was changed the uris might differ.*

Enjoy the magic  
( ͡° ͜ʖ ͡°)━☆ﾟ.*･｡ﾟ

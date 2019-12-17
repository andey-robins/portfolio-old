const house = [
    "bedroom", "den", "storage",
    "library", "courtyard", "garage",
    "game", "kitchen", "foyer"
]

// player values
var position = "courtyard";
var inventory = [];

// this is the entry point from the html application and the place that processes game actions
function actOnUserInput() {
    // get the user input from the input box
    var userInput = document.getElementById("input").value;
    var dm = "";
    var commandList = cleanInput(userInput);

    console.log(commandList);   // debugging output

    if (commandList[0] == "go") {
        // go to the room
        // TODO: check out whether the room is adjacent to where you are
        if (house.includes(commandList[1])) {
            position = commandList[1];
            dm = "You go to the " + commandList[1];
            if (commandList[1] == "game") {
                dm += " room"
            }
        // failure case
        } else {
            dm = "That's not a valid room";
        }

    } else if (commandList[0] == "take") {
        // check to see if the object is in the room you're in
        if (gameObject.roomInventories[position].includes(commandList[1])) {
            inventory.push(commandList[1]);
            gameObject.roomInventories[position] = removeFromArray(gameObject.roomInventories[position], commandList[1]);
            dm = "You take the " + commandList[1];
        // failure case
        } else {
            dm = "You can't take " + commandList[1];
        }

    } else if (commandList[0] == "put") {


    } else if (commandList[0] == "look") {
        // a command to look at the room around you
        if (commandList[1] == "around") {
            dm = gameObject.descriptions[position];

        // look at a specific object
        // TODO: check to see if the object is in your inventory or in the room
        } else if (gameObject.itemList.includes(commandList[1])) {
            console.log(commandList[1]);
            dm = gameObject.items[commandList[1].toString()].description;

        // failure case
        } else {
            dm = "You don't see a " + commandList[1];
        }

    } else if (commandList[0] == "open") {
        if (gameObject.openableObjects.includes(commandList[1])) {
            dm = "You can open that object";
        } else {
            dm = "You can't open the " + commandList[1];
        }

    } else if (commandList[0] == "inventory") {
        // print out the inventory
        dm = getPrintableInventory();

    } else if (commandList[0] == "solve") {
        if (gameObject.puzzles[commandList[1]] == commandList[2]) {
            dm = gameObject.solutionText[commandList[1]];
        } else {
            dm = "You seem to be unable to solve the puzzle in that manner";
        }
    } else if (commandList[0] == "help") {
        dm = "Enter a command into the text box below. You can do thinks like, look, take, put, or solve. Follow the verb with some object that you want to act on like 'look at lockbox', 'take book', or 'solve lockbox'. When solving, use the syntax 'solve $PUZZLE with $CODE'";
    } else {
        // final failure case
        dm = "Unfortunately, I don't understand: " + userInput;
    }

    // these should be the final three lines of this function
    // they format and write out the DM response and then clear out the input box
    dm += "."
    print(dm);
    document.getElementById("input").value = "";
    window.scrollTo(0, document.body.scrollHeight);
}

// clean up the input by removing unnecessary words and phrases
function cleanInput(userInput) {
    // clean up the user input to have a list of parsable commands
    var command = userInput.split(" ");
    const incidentals = ["the", "at", "to", "a", "an", "room", "up", "down", "out", "with"];
    command = command.filter(function(item) {
        return incidentals.indexOf(item) < 0;
    });

    // parse commands and convert them to our action language
    // parse the verb
    command[0] = gameObject.verbs[command[0]];

    // return parsed command list
    return command;
}

// return a printable version of the players inventory
function getPrintableInventory() {
    if (inventory.length != 0) {
        var inv = "You have: ";
        for (var item in inventory) {
            inv += inventory[item];
            inv += ", ";
        }
        return inv.substring(0, inv.length - 2);
    } else {
        return "You have no items";
    }
}

// pass the DM response to this function to write it to the page
function print(text) {
    document.getElementById("response").innerHTML += "<p id=\"p\">" + text + "</p>"
}

// a function to remove an object from an array
function removeFromArray(arr, it) {
    return arr.filter(function(item) {
        return it != item;
    });
}

// the text content of the game stored within an object for reference
var gameObject = {
    "descriptions": {
        "bedroom": "The bedroom has a bed in the center. On the wall is a painting of a woman singing. The bed has a red comforter laid across it. To the east is the den and to the south is the library",
        "den": "The den has a fireplace on the north wall. In the center of the room is a comfy looking couch. A knife and a block of cheese sits on a silver plate on the couch. To the east is the box filled storage room, to the south is the courtyard and fountain, and to the west is the bedroom",
        "storage": "The storage room has a large number of boxes in it. The boxes are labeled 'spoons,' 'knives,' and 'forks.' To the south is the garage and to the west is the den",
        "library": "The library has lots of books in it. In the center of the room is an oak desk. On the desk sits a book, a notepad, and a pen. To the north is a doorway to a bedroom, to the east is a courtyard with a fountain, and to the south is a game room",
        "courtyard": "In the middle of the couryard is a large fountain. You can see a lockbox sitting on the edge of the fountain. Around the edge of the courtyard are a number of benches, chairs, and side-tables. The sky is open, and thousands of stars dot the sky. To the north is a doorway that opens to a den. To the east is what looks to be a garage. To the south is a kitchen, and to the west is a library",
        "garage": "In the garage is a pair of bycicles. Hanging from the back of one bike is a license plate. Between the handlebars of the other bike is a piece of paper. The room is dim, and there is no sign of anything else in the light. TO the north is the storage room, to the south is the foyer, and to the west is the courtyard",
        "game": "There is a table in the middle of the room and shelves with games along the walls. On the table is a chess board",
        "kitchen": "On the kitchen counter are three scales. Each scale is labeled with a sticky note that has a drawing of either a fork, a knife, or a spoon",
        "foyer": "In the foyer there is a door to the outside world. Along one wall is a pair of boots and a coat on a coat hanger. A welcome mat sits in front of the door"
    },

    "verbs": {
        "go": "go",
        "move": "go",
        "travel": "go",
        "walk": "go",
        "take": "take",
        "pick": "take",
        "get": "take",
        "put": "put",
        "place": "put",
        "set": "put",
        "look": "look",
        "check": "look",
        "open": "open",
        "inventory": "inventory",
        "solve": "solve",
        "help": "help"
    },

    "roomInventories": {
        "bedroom": [],
        "den": [],
        "storage": [],
        "library": [],
        "courtyard": ["lockbox", "key"],
        "garage": [],
        "game": [],
        "kitchen": [],
        "foyer": []
    },

    "items": {
        "lockbox": { "description": "The lockbox is made of glass with a combination lock on the front. Six numbers need to be input to the lock. Within the box, a key is visible", "canTake": false },
        "key": { "description": "Within the box, there is a stainless-steel house key. There is nothing remarkable about it", "canTake": false },
        "chairs": { "description": "The chairs are simple, but comfortable looking. You could sit down, but you should keep looking around", "canTake": false },
        "stars": { "description": "The stars twinkle in the sky above you. There's no telling what secrets they may hold. Oh well, you should continue on", "canTake": false }
    },

    "itemList": ["lockbox", "key", "chairs", "stars"],

    "puzzles": {
        "lockbox": "138142"
    },

    "solutionText": {
        "lockbox": "You open up the lockbox. You can now take the key"
    },

    "openableObjects": []
}

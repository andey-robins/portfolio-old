// this is the entry point from the html application and the place that processes game actions
function actOnUserInput() {
    // get the user input from the input box
    var userInput = document.getElementById("input").value;
    var dm = "";
    var commandList = cleanInput(userInput);

    console.log(commandList);   // debugging output

    //convert user information into game objects
    let targetObject = getItemObjectFromName(commandList[1]);
    let roomObject = roomNameMap[player.room];

    if (doorPuzzle.check(userInput)) {
        // if you solve the door puzzle, you win!!
        print("You fit the key into the door. It turns to the left and you're able to open the door. Finally, you're free of this puzzling room! Congratulations!");
        print("Thank you for playing my game :)");
        document.getElementById("input").value = "";
        window.scrollTo(0, document.body.scrollHeight);
    } else {
        switch(commandList[0]) {
            case "go":
                // go to the room
                if (rooms.includes(commandList[1])) {
                    dm += "You go to the " + commandList[1];
                    player.room = commandList[1].toString();
                // solution to the chess puzzle
                } else if (chessPuzzle.check(userInput)) {
                    chessPuzzle.solve();
                    dm += "A piece of paper falls out from the book cases around the room. You pick it up. It reads '1-13'"
                    player.inventory.push(new Item("puzzlePaperOne", "1-13", "A piece of paper that has the text '1-13'", () => {}));
                } else {
                    dm += "That is not a valid room"
                }
                break;

            case "take":
                // check if the item is in the room you're in
                if (roomObject.inventory.includes(targetObject)) {
                    player.inventory.push(targetObject);
                    roomObject.inventory = removeFromArray(roomObject.inventory, targetObject);
                    dm += "You take the " + targetObject.name;
                } else {
                    dm += "You can't take that";
                }
                break;

            case "put":
                // check if the player has the item
                if (player.inventory.includes(targetObject)) {
                    roomObject.inventory.push(targetObject);
                    player.inventory = removeFromArray(player.inventory, targetObject);
                    dm += "You put down the " + targetObject.name;

                    if (scalePuzzle.check()) {
                        scalePuzzle.solve();
                        dm += "."
                        print(dm)
                        dm = "A piece of paper falls out from the cabinets around the room. You pick it up. It reads '2-81'";
                        player.inventory.push(new Item("puzzlePaperTwo", "2-81", "A piece of paper that has the text '2-81'", () => {}));
                    }
                } else {
                    dm += "You don't have that item";
                }
                break;

            case "look":
                // edge case of looking at the coat
                if (commandList[1] == 'coat' && player.room == 'foyer') {
                    dm += foyerCoat.actions("check", {});
                }

                // one last effort to make sense of the command
                if (bookPuzzle.check(userInput)) {
                    bookPuzzle.solve();
                    dm += "A piece of paper falls out from underneath the desk. You pick it up. It reads '3-42'";
                    player.inventory.push(new Item("puzzlePaperThree", "3-42", "A piece of paper that reads '3-42'", () => {}))
                }

                // allow general looking
                else if (commandList[1] == 'around') {
                    dm += roomObject.description;
                    dm += ". In the room you see: "
                    roomObject.inventory.forEach((item) => {
                        dm += item.name;
                        dm += ', ';
                    });
                    dm = dm.substring(0, dm.length - 2);

                // item is in the players inventory
                } else if (player.inventory.includes(targetObject)) {
                    dm += targetObject.description;

                // item is in the room
                } else if (roomObject.inventory.includes(targetObject)) {
                    dm += targetObject.description;

                // failure case
                } else {
                    dm += "You don't see that object";
                }
                break;

            case "open":
                // call into object actionMap to see if it has an open action
                if (player.inventory.includes(targetObject) || roomObject.inventory.includes(targetObject)) {
                    let actionResponse = targetObject.actions("open", commandList[2]);
                    if (actionResponse != undefined) {
                        dm += actionResponse;
                    } else {
                        dm += "You cannot open that object";
                    }
                }
                break;

            case "inventory":
                // print out the inventory
                dm = getPrintableInventory();
                break;

            case "solve":
                // call into object actionMap to see if it has a solve action
                if (player.inventory.includes(targetObject) || roomObject.inventory.includes(targetObject)) {
                    let actionResponse = targetObject.actions("solve", commandList[2]);
                    if (actionResponse != undefined) {
                        dm += actionResponse;
                    } else {
                        dm += "You cannot solve that object";
                    }
                }
                break;

            case "help":
                dm = "Enter a command into the text box below. You can do thinks like, look, take, put, or solve. Follow the verb with some object that you want to act on like 'look at lockbox', 'take notepad', or 'solve lockbox'. When solving, use the syntax 'solve $PUZZLE with $CODE'";
                break;

            default:
                // refer to the current room to see if it has a relevant command
                dm += player.room.actions(commandList);

                // final fail safe.
                if (dm == "") {
                    print("I'm sorry, but I don't understand: " + userInput.toString());
                }
        }

        // these should be the final four lines of this function
        // they format and write out the DM response and then clear out the input box
        dm += "."
        print(dm);
        document.getElementById("input").value = "";
        window.scrollTo(0, document.body.scrollHeight);
    }
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
    command[0] = verbs[command[0]];

    // return parsed command list
    return command;
}

// return a printable version of the players inventory
function getPrintableInventory() {
    if (player.inventory.length != 0) {
        var inv = "You have: ";
        player.inventory.forEach(item => {
            inv += item.name;
            inv += ", ";
        });
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

function getItemObjectFromName(name) {
    let foundObject = null;
    items.forEach(item => {
        if (item.name == name) {
            foundObject = item;
        }
    });
    return foundObject;
}

//
// object declarations
//
class Room {
    constructor(description, actionMap, inventory) {
        this.description = description;
        this.actions = actionMap;
        this.inventory = inventory;
    }
}

class Item {
    constructor(id, name, description, actionMap) {
        this.itemId = id;
        this.name = name;
        this.description = description;
        this.actions = actionMap;
    }
}

class Player {
    constructor() {
        this.inventory = new Array();
        this.room = 'courtyard';
    }
}

class Puzzle {
    constructor(solutionCheck) {
        this.solved = false;
        this.checkForSolution = solutionCheck;
    }

    check(params) {
        return this.checkForSolution(params);
    }

    solve() {
        this.solved = true;
    }
}

const verbs = {
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
}

// create a player object
let player = new Player();

//
// define items
//
let libraryBook = new Item('libraryBook',
                        "book",
                        "The book is a copy of 'The Federalist Papers'",
                        (action, options) => {return undefined;});

let libraryNotepad = new Item('libraryNotepad',
                        "notepad",
                        "Some text is written on the notepad. It reads: 6.3.73 9.9.18 1.1.2 62.14.31",
                        (action, options) => {return undefined;});

let libraryKnife = new Item('libraryKnife',
                        "knife",
                        "A butter knife. It looks like it was previously used as a letter opener",
                        (action, options) => {return undefined;});

let courtyardLockbox = new Item('courtyardLockbox',
                        "lockbox",
                        "The glass topped box is secured by a six digit combination lock on the front. You can see a key on the inside",
                        (action, options) => {
                            switch (action) {
                                case 'solve':
                                    if (options == 138142) {
                                        player.inventory.push(courtyardKey);
                                        return "You open the lockbox and take the key";
                                     } else {
                                        return "Nothing happens";
                                     }
                                    break;
                                default:
                                    return undefined;
                            }
                        });

let courtyardKey = new Item('courtyardKey',
                        "key",
                        "The key is a normal house key",
                        (action, options) => {return undefined;});

let courtyardSpoon = new Item('courtyardSpoon',
                        "spoon",
                        "It's a spoon",
                        (action, options) => {return undefined;});

let denChessBoard = new Item('denChessBoard',
                        "chessboard",
                        "Three black pieces stare down the white king. A bishop, three rows directly below the king; a rook, sitting on the same file as the king; and the black king, two spaces from the white king",
                        (action, options) => {return undefined;});

let denGames = new Item('denGames',
                        "games",
                        "Dozens of games with names like 'Catan' and 'Race for the Galaxy' surround the room. None of them look important",
                        (action, options) => {return undefined;});

let kitchenScale = new Item('kitchenScale',
                        "scale",
                        "A standard kitchen scale. It's turned on and reads 0.0 oz",
                        (action, options) => {return undefined;});

let kitchenStickyNote = new Item('kitchenStickyNote',
                        "note",
                        "There's a note that has a crude drawing of a knife, fork, and spoon",
                        (action, options) => {return undefined;});

let foyerBoots = new Item('foyerBoots',
                        "boots",
                        "A heavy pair of working boots that are covered with mud",
                        (action, options) => {return undefined;});

let foyerCoat = new Item('foyerCoat',
                        "coat",
                        "A gray coat. It looks like there's something in one of the pockets",
                        (action, options) => {
                            switch (action) {
                                case 'check':
                                    player.inventory.push(foyerFork);
                                    return "You find a kitchen fork in the pocket! Neat!\n";
                                    break;
                                default:
                                    return "Maybe you should check the coat";
                            }
                        });

let foyerFork = new Item('foyerFork',
                        "fork",
                        "A simple dinner fork",
                        (action, options) => {return undefined;});

//
// define rooms
//
let library = new Room("Around the room, bookcases are filled with books. In the center of the room is a large oak desk",
                        (action) => {print(action)},
                        [libraryBook, libraryNotepad, libraryKnife]);

let courtyard = new Room("Throughout the courtyard are a number of green plants. You can see a lockbox sitting in the middle of the courtyard. The sky is open above with thousands of stars dotting the night. Four doorways lead away from the courtyard going to a den, a foyer, a kitchen, and a library",
                        (action) => {print(action)},
                        [courtyardLockbox, courtyardSpoon]);

let den = new Room("The has floor to ceiling book cases that are all filled with board games. In the middle is a table with a chess board set up on it",
                        (action) => {print(action)},
                        [denChessBoard, denGames]);

let kitchen = new Room("There's a kitchen scale on the counter. Otherwise, the kitchen is quaint and clean, as if nobody has ever used it to cook",
                        (action) => {print(action)},
                        [kitchenScale, kitchenStickyNote]);

let foyer = new Room("The front door is locked from the outside. Maybe you can find a key somewhere in here",
                        (action) => {print(action)},
                        [foyerBoots, foyerCoat]);

//
// define puzzles
//
let scalePuzzle = new Puzzle(() => {
    let flag = true;
    let requiredItems = [courtyardSpoon, libraryKnife, foyerFork];
    requiredItems.forEach((item) => {
        if (!kitchen.inventory.includes(item)) {
            flag = false;
        }
    });
    return flag;
});

let chessPuzzle = new Puzzle((command) => {
    if (command == "move rook") {
        return true;
    } else {
        return false;
    }
});

let bookPuzzle = new Puzzle((command) => {
    if (command == "look under the desk") {
        return true;
    } else {
        return false;
    }
});

let doorPuzzle = new Puzzle((command) => {
    if (scalePuzzle.solved && chessPuzzle.solved && bookPuzzle.solved && command == "use key on door" && player.inventory.includes(courtyardKey)) {
        return true;
    } else {
        return false;
    }
})

// a map to look up the room object by name
const roomNameMap = {
    'library': library,
    'courtyard': courtyard,
    'den': den,
    'kitchen': kitchen,
    'foyer': foyer,
}

// list of rooms
const rooms = ['library', 'courtyard', 'den', 'kitchen', 'foyer'];
// other items may exist, but these are the ones that can be picked up moved about and interacted with by the player
const items = [libraryBook, libraryNotepad, libraryKnife,
                courtyardLockbox, courtyardSpoon,
                denChessBoard, denGames,
                kitchenScale, kitchenStickyNote,
                foyerBoots, foyerCoat, foyerFork];

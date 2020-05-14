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

    switch(commandList[0]) {
        case "go":
            // go to the room
            if (house.includes(commandList[1])) {
                dm += "You go to the " + commandList[1];
                player.room = commandList[1].toString();
            } else {
                dm += "That is not a valid room."
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
            } else {
                dm += "You don't have that item";
            }
            break;

        case "look":
            // allow general looking
            if (commandList[1] == 'around') {
                dm += roomObject.description;
                roomObject.inventory.forEach((item) => {
                    dm += '. ';
                    dm += item.description;
                });
                dm.substring(0, dm.length - 2);

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
            print("I'm sorry, but I don't understand: " + userInput.toString());
    }

    // these should be the final four lines of this function
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
                        "description",
                        (action, options) => {return undefined;});

let libraryNotepad = new Item('libraryNotepad',
                        "notepad",
                        "description",
                        (action, options) => {return undefined;});

let libraryPen = new Item('libraryPen',
                        "pen",
                        "description",
                        (action, options) => {return undefined;});

let courtyardLockbox = new Item('courtyardLockbox',
                        "lockbox",
                        "description",
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
                        "description",
                        (action, options) => {return undefined;});

let courtyardSpoon = new Item('courtyardSpoon',
                        "spoon",
                        "description",
                        (action, options) => {return undefined;});

let denChessBoard = new Item('denChessBoard',
                        "chessboard",
                        "description",
                        (action, options) => {return undefined;});

let denGames = new Item('denGames',
                        "games",
                        "description",
                        (action, options) => {return undefined;});

let kitchenScale = new Item('kitchenScale',
                        "scale",
                        "description",
                        (action, options) => {return undefined;});

let kitchenStickyNote = new Item('kitchenStickyNote',
                        "note",
                        "description",
                        (action, options) => {return undefined;});

let foyerBoots = new Item('foyerBoots',
                        "boots",
                        "description",
                        (action, options) => {return undefined;});

let foyerCoat = new Item('foyerCoat',
                        "coat",
                        "description",
                        (action, options) => {return undefined;});

//
// define rooms
//
let library = new Room("The library has lots of books in it. In the center of the room is an oak desk. On the desk sits a book, a notepad, and a pen. To the north is a doorway to a bedroom, to the east is a courtyard with a fountain, and to the south is a game room",
                        (action) => {print(action)},
                        [libraryBook, libraryNotepad, libraryPen]);

let courtyard = new Room("In the middle of the couryard is a large fountain. You can see a lockbox sitting on the edge of the fountain. Around the edge of the courtyard are a number of benches, chairs, and side-tables. The sky is open, and thousands of stars dot the sky. To the north is a doorway that opens to a den. To the east is what looks to be a garage. To the south is a kitchen, and to the west is a library",
                        (action) => {print(action)},
                        [courtyardLockbox, courtyardSpoon]);

let den = new Room("There is a table in the middle of the room and shelves with games along the walls. On the table is a chess board",
                        (action) => {print(action)},
                        [denChessBoard, denGames]);

let kitchen = new Room("On the kitchen counter are three scales. Each scale is labeled with a sticky note that has a drawing of either a fork, a knife, or a spoon",
                        (action) => {print(action)},
                        [kitchenScale, kitchenStickyNote]);

let foyer = new Room("In the foyer there is a door to the outside world. Along one wall is a pair of boots and a coat on a coat hanger. A welcome mat sits in front of the door",
                        (action) => {print(action)},
                        [foyerBoots, foyerCoat]);

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
const items = [libraryBook, libraryNotepad, libraryPen,
                courtyardLockbox, courtyardSpoon,
                denChessBoard, denGames,
                kitchenScale, kitchenStickyNote,
                foyerBoots, foyerCoat];

const drawGameOver = () => {
  gameContainer.style.backgroundColor = "black";
  gameContainer.innerHTML = `
    <p>Final Score <br>${+document.querySelector(".meter__price")
      .innerText} </p>
  `;
};

const incrementMeter = () => {
  const meter = document.querySelector(".meter__price");
  let meterValue = +meter.innerText;
  meterValue += 1;
  meter.innerText = meterValue + ".00";
};

const getCoordinatesFromElement = (v) => {
  // Convert all the properties from strings to numbers
  let left = +v.style.left.replace("%", "");
  let bottom = +v.style.bottom.replace("%", "");
  let width = +v.style.width.replace("%", "");
  let height = +v.style.height.replace("%", "");
  // Find the coordinates of the start location
  let x1 = left / 20;
  let y1 = bottom / 20;
  // Find the coordinates of the end location
  let x2 = (width + left) / 20 - 1;
  let y2 = (height + bottom) / 20 - 1;
  return { x1, y1, x2, y2 };
};

const handleClick = (event) => {
  /**
   */
  let { x1, y1, x2, y2 } = getCoordinatesFromElement(event.target);
  if (x1 == x2) {
    //Vertical car case
    handleClickVertical(event.target, x1, y1, x2, y2);
  } else {
    // Horizontal car case
    handleClickHorizontal(event.target, x1, y1, x2, y2);
  }
  //check for win condition
  const player = document.querySelector("#player");
  const c = getCoordinatesFromElement(player);
  if (c.x2 == 4) {
    player.style.left = "200%";
    const nextLevel = ++document.querySelector(".level").innerText;
    if (nextLevel < 6) {
      new Promise((resolve) => setTimeout(resolve, 500)).then(() =>
        drawVehicles(importLevel(levels[nextLevel]))
      );
    } else {
      new Promise((resolve) => setTimeout(resolve, 500)).then(() =>
        drawGameOver()
      );
    }
    //levelNumber = document.querySelector("#level-number");
    //++levelNumber.innerHTML;
    //drawVehicles(importLevel(levels[+levelNumber.innerHTMl]));
  }
};

const handleClickVertical = (vehicle, x1, y1, x2, y2) => {
  let board = getBoardState();
  let success = true;
  // 1) Can we move up?
  // 2) Can we move down?
  // 3) Otherwise, we cannot move.
  if (isValidSpace(board, x2, y2 + 1)) {
    let newY2 = y2 + 1;
    while (isValidSpace(board, x2, newY2)) {
      newY2 += 1;
    }
    newY2 -= 1; // The while loop will always go 1 step too far
    newY2 -= y2 - y1; // Compensate for vehicle length
    vehicle.style.bottom = `${20 * newY2}%`;
  } else {
    if (isValidSpace(board, x2, y1 - 1)) {
      let newY1 = y1 - 1;
      while (isValidSpace(board, x2, newY1)) {
        newY1 -= 1;
      }
      newY1 += 1; // The while loop will always go 1 step too far
      // Do not compensate for vehicle length since y1 is already the bottom coord
      vehicle.style.bottom = `${20 * newY1}%`;
    } else {
      success = false;
      vehicle.classList.add("shake");
      new Promise((resolve) => setTimeout(resolve, 250)).then(() =>
        vehicle.classList.remove("shake")
      );
    }
  }
  if (success) {
    incrementMeter();
  }
};

const handleClickHorizontal = (vehicle, x1, y1, x2, y2) => {
  // 1) Can we move right?
  // 2) Can we move left?
  // 3) Otherwise, we cannot move.
  let board = getBoardState();
  let success = true;
  if (isValidSpace(board, x2 + 1, y2)) {
    document.querySelector(".game").style.overflow = "hidden";
    let newX2 = x2 + 1;
    while (isValidSpace(board, newX2, y2)) {
      newX2 += 1;
    }
    newX2 -= 1; // The while loop will always go 1 step too far
    newX2 -= x2 - x1; // Compensate for vehicle length
    vehicle.style.left = `${20 * newX2}%`;
  } else {
    if (isValidSpace(board, x1 - 1, y2)) {
      let newX1 = x1 - 1;
      while (isValidSpace(board, newX1, y2)) {
        newX1 -= 1;
      }
      newX1 += 1; // The while loop will always go 1 step too far
      // Do not compensate for vehicle length
      vehicle.style.left = `${20 * newX1}%`;
    } else {
      vehicle.classList.add("shake");
      success = false;
      new Promise((resolve) => setTimeout(resolve, 250)).then(() =>
        vehicle.classList.remove("shake")
      );
    }
  }
  if (success) {
    incrementMeter();
  }
};

const isValidSpace = (board, x, y) => {
  if (x < 0 || y < 0 || x > 4 || y > 4) {
    return false;
  } else {
    return !board[x][y];
  }
};
// Read the array of which grid squares are populated and which are not
const getBoardState = () => {
  let board = Array(5)
    .fill(0)
    .map(() => Array(5).fill(false));
  const vehicleElements = document.querySelectorAll(".vehicle");
  vehicleElements.forEach((v) => {
    let { x1, y1, x2, y2 } = getCoordinatesFromElement(v);
    // Mark as occupied
    if (x1 >= 0) {
      // The player car sometimes starts with a negative x1
      board[x1][y1] = true;
    }
    // Mark as occupied
    board[x2][y2] = true;
    // If length = 3, find the coordinates of the middle location
    if (y2 - y1 > 1) {
      // Vertical vehicle of length 3 condition
      let y3 = y1 + 1;
      let x3 = x1;
      board[x3][y3] = true;
    }
    if (x2 - x1 > 1) {
      // Horizontal vehicle of length 3 condition
      let x3 = x1 + 1;
      let y3 = y1;
      board[x3][y3] = true;
    }
  });
  return board;
};

// Accepts an array of vehicles and draws them all
const drawVehicles = (vehicles) => {
  gameContainer.innerHTML = "";
  vehicles.forEach((v, i) => {
    let newDiv = document.createElement("div");
    if (v.y1 > v.y2 || v.x1 > v.x2) {
      console.error(
        `Vehicle (${v.x1},${v.y1}),(${v.x2},${v.y2}) has backwards coordinates!`
      );
    }
    newDiv.style.left = `${20 * v.x1}%`;
    newDiv.style.bottom = `${20 * v.y1}%`;
    newDiv.style.height = `${(v.y2 - v.y1 + 1) * 20}%`;
    newDiv.style.width = `${(v.x2 - v.x1 + 1) * 20}%`;
    newDiv.style.backgroundColor = v.color;
    let backgroundImage = "url(./data-and-images/";
    if (v.x2 - v.x1 == 1 || v.y2 - v.y1 == 1) {
      // car case
      backgroundImage += "car";
      newDiv.classList.add("car");
    } else {
      //bus case
      backgroundImage += "bus";
      newDiv.classList.add("bus");
    }
    if (v.x1 == v.x2) {
      // vertical case
      backgroundImage += "-vert";
      newDiv.classList.add("vertical");
    } else {
      backgroundImage += "-horiz";
      newDiv.classList.add("horizontal");
    }
    backgroundImage += ".png";
    // If we are drawing the player, give it the player background image and id
    if (i == 0) {
      newDiv.id = "player";
      newDiv.style.backgroundImage = `url("/data-and-images/player.png")`;
    } else {
      newDiv.style.backgroundImage = backgroundImage;
    }
    //newDiv.innerText = `(${v.x1},${v.y1}),(${v.x2},${v.y2})`;
    newDiv.classList.add("vehicle");
    gameContainer.appendChild(newDiv);
  });
  const vehicleElements = document.querySelectorAll(".vehicle");
  vehicleElements.forEach((v) => {
    v.addEventListener("click", handleClick);
  });
};

const generateVehicle = (sprite, x1, y1, x2, y2) => {
  return {
    sprite: sprite,
    x1: x1,
    y1: y1,
    x2: x2,
    y2: y2,
  };
};

const importLevel = (level) => {
  let vehicles = [];
  level.forEach((v) => {
    vehicles.push(generateVehicle("a", v[0], v[1], v[2], v[3]));
  });
  return vehicles;
};

import levels from "./data-and-images/levels.js";
const gameContainer = document.querySelector(".game");

drawVehicles(importLevel(levels[0]));

let newDiv = document.createElement("div");
newDiv.innerHTML = `
        <h1>Crazy <br> Taxi</h1>
        <small>Tap the taxi to get started!</small>
`;
newDiv.classList.add("title-screen");
newDiv.style.position = "absolute";
newDiv.style.fontSize = "10rem";
newDiv.style.textAlign = "center";
gameContainer.insertBefore(newDiv, gameContainer.firstChild);
//function logKey(e) {
//  console.log("NEW");
//  board = getBoardState();
//  for (let x = 0; x < board.length; x++) {
//    for (let y = 0; y < board[x].length; y++) {
//      if (board[x][y]) {
//        console.log(`I see a car at ${x}, ${y}!`);
//      }
//    }
//  }
//}

//document.addEventListener("keypress", logKey);

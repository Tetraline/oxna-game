//const gameContainer = document.querySelector(".game");

// Accepts an array of vehicles and draws them all
const drawVehicles = () => {};

const generateVehicle = (length, color, x1, y1, x2, y2) => {
  return {
    length: length,
    color: color,
    x1: x1,
    y1: y1,
    x2: x2,
    y2: y2,
  };
};

console.log(generateVehicle(2, "red", 1, 1, 1, 1));

"use strict";

// Initialize the application.
function init() {
  // Get the canvas element.
  let canvas = document.getElementById("canvas");

  // Create the canvas 2D context.
  let ctx = canvas.getContext("2d");

  // Clear the canvas and fill it with a color.
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgb(255, 0, 0)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Add event listener for the load event.
window.addEventListener("load", init);

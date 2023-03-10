"use strict";

let canvas;
let ctx;
let data;
let dimensions;
let image;
let bitmap;
let slice = 0;

// Draw the data.
function draw() {
  if (!data) {
    return;
  }

  // Get the canvas width and height.
  let width = canvas.width;
  let height = canvas.height;

  // Clear the canvas.
  ctx.clearRect(0, 0, width, height);

  // Draw the image.
  //ctx.putImageData(image, 0, 0);
  ctx.drawImage(bitmap, 0, 0, width, height);

  // Draw the slice number.
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Slice: " + (slice + 1) + " / " + dimensions[2], 10, 30);
}

// Get the filename from the URL.
function getFilename(url) {
  return url.split('\\').pop().split('/').pop();
}

// Extract the xyz-size from the filename (e.g., data_150x150x150_uint8.raw).
function getDimensions(filename) {
  let dimensions = filename.split("_")[1].split("x").map((value) => parseInt(value));
  return dimensions;
}

// Load the data.
function loadData(url, callback) {
  fetch(url)
  .then((response) => {
    if (response.ok) {
      return response.arrayBuffer();
    }

    throw new Error("Could not load data from " + url);
  })
  .then((buffer) => {
    // Get the filename from the URL.
    let filename = getFilename(url);

    // Extract the xyz-size from the filename.
    let dimensions = getDimensions(filename);

    // Decompress the data and call callback function.
    const result = pako.inflate(buffer);
    callback(result, dimensions);
  });
}

// Update the data.
function updateData(newData, newDimensions) {
  // Update the data and dimensions.
  data = newData;
  dimensions = newDimensions;

  // Create image data.
  image = ctx.createImageData(dimensions[0], dimensions[1]);

  // Update the slice index and image.
  slice = Math.floor(dimensions[2] / 2);
  updateImage(slice).then(() => {
    // Draw the data.
    draw();
  });
}

// Update the image.
async function updateImage(slice) {
  // Fill image with slice data.
  for (let y = 0; y < dimensions[1]; y++) {
    for (let x = 0; x < dimensions[0]; x++) {
      // Compute the data index.
      let index = (dimensions[0] * dimensions[1]) * slice + dimensions[0] * y + x;
      let value = data[index];

      // Compute the image data index.
      let i = (image.width * y + x) * 4;
      image.data[i] = value;
      image.data[i + 1] = value;
      image.data[i + 2] = value;
      image.data[i + 3] = 255;
    }
  }

  bitmap = await createImageBitmap(image);
}

// Resize the canvas.
function resize() {
  const cssToRealPixels = window.devicePixelRatio || 1;
  const { width, height } = canvas.getBoundingClientRect();
  const displayWidth = Math.floor(width * cssToRealPixels);
  const displayHeight = Math.floor(height * cssToRealPixels);

  if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
    canvas.width = displayWidth;
    canvas.height = displayHeight;
    
    draw();
  }
}

// Initialize the application.
function init() {
  // Get the canvas element.
  canvas = document.getElementById("canvas");

  // Create the canvas 2D context.
  ctx = canvas.getContext("2d");

  // Get the slice slider.
  let sliceSlider = document.getElementById("sliceSlider");

  // Add event listener for the input event.
  sliceSlider.addEventListener("input", (event) => {
    // Get the normalized slice value.
    let value = (event.target.value - event.target.min) / event.target.max;
    slice = Math.min(Math.round(value * dimensions[2]), dimensions[2] - 1);

    // Update the image.
    updateImage(slice).then(() => {
      // Draw the data.
      draw();
    });
  });

  // Resize the canvas.
  resize();

  // Load the data.
  loadData("./data/engine_256x256x128_uint8.raw.gz", updateData);
}

// Add event listener for the load event.
window.addEventListener("load", init);

// Add event listener for the resize event.
window.addEventListener("resize", resize);

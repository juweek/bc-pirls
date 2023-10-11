/*
------------------------
METHOD: load in the images with Promises; this is best standard
------------------------
*/
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/*
------------------------
METHOD: serialized the svg into data to put into png
------------------------
*/
function convertSvgToDataURL(svg) {
  const svgData = new XMLSerializer().serializeToString(svg);
  const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  return URL.createObjectURL(svgBlob);
}

/*
------------------------
METHOD: call the html2canvas library to take a screenshot of the page
------------------------
*/
function htmlToCanvas(element) {
  return html2canvas(element);
}


/*
------------------------
METHOD: create a blank html element to use for the xAxis
------------------------
*/
function createEmptyCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = "transparent";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  return canvas;
}

/*
------------------------
METHOD: check if the platform is windows
------------------------
*/
function isWindowsOS() {
    const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];
    return windowsPlatforms.includes(window.navigator.platform);
}

/*
------------------------
METHOD: expand the area so it fits
------------------------
*/
function expandElementTemporarily(el) {
  const originalHeight = el.style.height;
  const originalOverflow = el.style.overflow;

  el.style.height = el.scrollHeight + 'px';  // Expanding to its full content height
  el.style.overflow = 'visible';             // Making sure all content is visible        
  el.style.flexDirection = 'column';         // Setting the direction to column

  return () => {                             // Return a function to revert the changes
    el.style.height = originalHeight;
    el.style.overflow = originalOverflow;
  };
}

/*
------------------------
METHOD: convert the html to a canvas for 2.1/2.2 and 2.3/2.4
------------------------
*/
function htmlToPngDownload(htmlEl, filename, padding = 10) {
  const keyImgElementSrc = document.querySelector(".modalContent img").src;

  const restoreFunction = expandElementTemporarily(htmlEl);  // Expand the original elemen
   const fontSize = isWindowsOS() ? 18 : 30; // Determine font size based on OS

  Promise.all([
    htmlToCanvas(htmlEl),
    loadImage(keyImgElementSrc)
  ]).then(canvases => {
    restoreFunction();  // Restore the element back to its original size
    const mainCanvas = canvases[0];
    const keyImg = canvases[1];

    // We won't include xAxisCanvas, but maintain the order for drawOntoCanvas
    const emptyCanvas = createEmptyCanvas(1, 1);
    const pngDataUrl = drawOntoCanvas([mainCanvas, emptyCanvas, keyImg], padding, fontSize, 600, 200);

    const downloadLink = document.createElement("a");
    downloadLink.href = pngDataUrl;
    downloadLink.download = filename;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    document.body.style.cursor = 'default'; // Revert the cursor back to default
  }).catch(error => {
    restoreFunction();  // Restore the element back to its original size
    console.error("Error processing elements:", error);
    document.body.style.cursor = 'default';
  });
}


/*
------------------------
METHOD: take the svgs you fetched and put them onto a canvas; this will be what you serialize and put in png
------------------------
*/
function drawOntoCanvas(images, padding, fontSize, KEY_WIDTH, KEY_HEIGHT) {
  const [mainImg, xAxisImg, keyImg] = images;
  const textMargin = 10;
  const keyMargin = 20; // space between graphTitle and key

  // Adjust canvas height to add space for the key and its margin
  const canvas = document.createElement("canvas");
  canvas.width = mainImg.width + 2 * padding;
  canvas.height = mainImg.height + xAxisImg.height + fontSize + textMargin + keyMargin + KEY_HEIGHT + 2 * padding;

  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#000000";
  ctx.font = `${fontSize}px PT Sans`;
  const graphTitle = document.getElementById("graphTitle");
  const content = graphTitle.textContent.replace(/\s+/g, ' ').trim();

  let destinationX = (canvas.width - KEY_WIDTH) / 2;  // center the key on the canvas width
  let destinationY = fontSize + padding + textMargin + 10;  // place it right below the title

  ctx.fillText(content, padding, fontSize + padding);

  // Draw the key immediately below the title
  ctx.drawImage(keyImg, 0, 0, keyImg.width, keyImg.height, destinationX, destinationY, KEY_WIDTH, KEY_HEIGHT);

  // Adjust the y-coordinate of the main graph and xAxis to account for the key
  ctx.drawImage(mainImg, padding, fontSize + textMargin + padding + KEY_HEIGHT + keyMargin);
  ctx.drawImage(xAxisImg, padding, fontSize + textMargin + padding + KEY_HEIGHT + keyMargin + mainImg.height);

   // Draw the additional text at the bottom-center of the canvas
  const additionalTextFontSize = 15;  // Set your desired font size here
  ctx.font = `${additionalTextFontSize}px PT Sans`;  // Set the font size for the additional text
  const additionalText = "Downloaded from ";
  const additionalTextWidth = ctx.measureText(additionalText).width;
  const linkText = "https://pirls2021.org/results";
  const linkTextWidth = ctx.measureText(linkText).width;
  const yOffset = 10;  // Y offset to move the text up by 10 pixels
  ctx.fillStyle = "#000000";
  ctx.fillText(additionalText, (canvas.width - (additionalTextWidth + linkTextWidth)) / 2, canvas.height - padding - yOffset);
  ctx.fillStyle = "#0000FF";
  ctx.fillText(linkText, (canvas.width + additionalTextWidth - linkTextWidth) / 2, canvas.height - padding - yOffset);


  return canvas.toDataURL("image/png");
}


/*
------------------------
METHOD: the function that combines all the steps. take in the html elements you want to print out, load them, serialize them, then draw them on the canvas
------------------------
*/
function svgToJpegDownload(svgEl, filename, padding = 10) {
  const xAxisEl = document.querySelector("#xAxisDiv");
  const keyImgElementSrc = document.querySelector(".modalContent img").src;

  Promise.all([
    loadImage(convertSvgToDataURL(svgEl)),
    loadImage(convertSvgToDataURL(xAxisEl)),
    loadImage(keyImgElementSrc)
  ]).then(images => {
    const pngDataUrl = drawOntoCanvas(images, padding, 17, 600, 200);

    const downloadLink = document.createElement("a");
    downloadLink.href = pngDataUrl;
    downloadLink.download = filename;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }).catch(error => {
    console.error("Error loading images:", error);
  });
}

export { svgToJpegDownload, htmlToPngDownload };


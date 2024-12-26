import html2canvas from 'html2canvas';

let effect;
let characters = '    .:-+*=%@#■90';
let backgroundColor = 'black';
let ASCIIColor = 'white';
let animationId = null;
const defaultCharacters = '   .:-+*=%@#■90';
let characterMap = {};
let currentColumn = 0;
let waveWidth = 20; // How many columns are affected at once
let rowColumns = []; // Track column position for each row
let rowSpeeds = [];  // Different speeds for each row
let isTransitioning = false;
let transitionComplete = false;

window.addEventListener('error', function(e) {
    console.error('Script error:', e);
});

function resizeImage(image) {
    const CANVAS_SIZE = 1080;
    const aspectRatio = image.width / image.height;
    
    let width, height;
    if (aspectRatio > 1) {
        // Landscape image
        width = CANVAS_SIZE;
        height = Math.floor(CANVAS_SIZE / aspectRatio);
    } else {
        // Portrait or square image
        height = CANVAS_SIZE;
        width = Math.floor(CANVAS_SIZE * aspectRatio);
    }
    
    // Calculate position to center in 1080x1080 canvas
    const x = Math.floor((CANVAS_SIZE - width) / 2);
    const y = Math.floor((CANVAS_SIZE - height) / 2);
    
    return {
        canvasSize: CANVAS_SIZE,
        width: width,
        height: height,
        x: x,
        y: y
    };
}

function createAsciiArt(image) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set fixed canvas size to 1080x1080
    const CANVAS_SIZE = 1080;
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    
    // Clear canvas with background color
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // Calculate dimensions and position
    const dimensions = resizeImage(image);
    
    // Draw image centered in canvas
    ctx.drawImage(
        image,
        dimensions.x, dimensions.y,
        dimensions.width, dimensions.height
    );
    
    const imageData = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    let asciiArt = '';
    
    // Calculate ASCII dimensions
    // We'll use a smaller number of characters for better visibility
    const ASCII_WIDTH = 150;  // Number of characters per line
    const ASCII_HEIGHT = Math.floor(ASCII_WIDTH * (dimensions.height / dimensions.width));
    
    // Calculate sampling steps
    const stepX = CANVAS_SIZE / ASCII_WIDTH;
    const stepY = CANVAS_SIZE / ASCII_HEIGHT;
    
    for (let y = 0; y < ASCII_HEIGHT; y++) {
        for (let x = 0; x < ASCII_WIDTH; x++) {
            const sampleX = Math.floor(x * stepX);
            const sampleY = Math.floor(y * stepY);
            
            const offset = (sampleY * CANVAS_SIZE + sampleX) * 4;
            const r = imageData.data[offset];
            const g = imageData.data[offset + 1];
            const b = imageData.data[offset + 2];
            
            // Convert to grayscale
            const brightness = (0.299 * r + 0.587 * g + 0.114 * b);
            
            // Map brightness to character
            const charIndex = Math.floor(brightness / 255 * (characters.length - 1));
            asciiArt += characters[charIndex] + ' ';
        }
        asciiArt += '\n';
    }
    
    // Start the initial wave animation with the generated ASCII art
    initialWaveAnimation(asciiArt);
}

// Add this function to create loading text
function showLoadingText() {
    const container = document.getElementById('ascii-container');
    container.innerHTML = 'Converting image to ASCII art...';
}

// Add this function to handle the initial wave animation
function initialWaveAnimation(asciiArt) {
    const container = document.getElementById('ascii-container');
    const ascii = document.createElement('div');
    ascii.style.fontFamily = 'monospace';
    ascii.style.whiteSpace = 'pre';
    ascii.style.lineHeight = '1';
    ascii.style.letterSpacing = '0px';
    ascii.style.fontSize = '8px';  // Smaller font size for better fit
    ascii.style.color = ASCIIColor;
    ascii.style.transform = 'scale(1)';  // Allow scaling if needed
    ascii.style.transformOrigin = 'center';
    
    const lines = asciiArt.split('\n');
    const width = lines[0].length;
    let currentColumn = 0;
    
    // Start with empty space
    ascii.textContent = lines.map(line => ' '.repeat(line.length)).join('\n');
    container.innerHTML = '';
    container.appendChild(ascii);
    
    // Animate the appearance
    const revealInterval = setInterval(() => {
        let newLines = lines.map(line => {
            let newLine = '';
            for (let x = 0; x < line.length; x++) {
                if (x <= currentColumn) {
                    newLine += line[x];
                } else {
                    newLine += ' ';
                }
            }
            return newLine;
        });
        
        ascii.textContent = newLines.join('\n');
        currentColumn += 5; // Speed of reveal
        
        if (currentColumn >= width) {
            clearInterval(revealInterval);
            ascii.textContent = asciiArt; // Ensure final state is complete
        }
    }, 50);
}

// File upload handling
document.getElementById('file-selector').addEventListener('change', (event) => {
    try {
        const file = event.target.files[0];
        if (file) {
            showLoadingText();
            
            setTimeout(() => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const image = new Image();
                    image.onload = () => createAsciiArt(image);
                    image.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }, 1000);
        }
    } catch (error) {
        console.error('Error handling file:', error);
    }
});

// Light/Dark mode toggle
document.getElementById('lightDark').addEventListener('click', () => {
    const isDark = backgroundColor === 'black';
    backgroundColor = isDark ? 'white' : 'black';
    ASCIIColor = isDark ? 'black' : 'white';
    
    document.body.style.backgroundColor = backgroundColor;
    const ascii = document.querySelector('#ascii-container > div');
    if (ascii) {
        ascii.style.color = ASCIIColor;
    }
});

// Screenshot functionality
document.getElementById('screenshotButton').addEventListener('click', () => {
    const container = document.getElementById('ascii-container');
    
    // Create a wrapper div with white background for PNG export
    const wrapper = document.createElement('div');
    wrapper.style.padding = '20px';
    wrapper.style.backgroundColor = backgroundColor;
    wrapper.style.display = 'inline-block';
    
    // Clone the ASCII art
    const asciiClone = container.firstChild.cloneNode(true);
    wrapper.appendChild(asciiClone);
    
    // Temporarily add wrapper to document (hidden)
    wrapper.style.position = 'absolute';
    wrapper.style.left = '-9999px';
    document.body.appendChild(wrapper);
    
    html2canvas(wrapper, {
        backgroundColor: backgroundColor,
        scale: 2, // Increase resolution
        logging: false,
    }).then((canvas) => {
        // Create download link
        const link = document.createElement("a");
        link.download = "ASCII_art.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
        
        // Cleanup
        document.body.removeChild(wrapper);
    });
});

function shuffleCharacters() {
    const currentChars = characters.split('');
    const shuffledChars = [...currentChars];
    
    // Get all characters except space
    const charsNoSpace = currentChars.filter(char => char !== ' ');
    const shuffledNoSpace = [...charsNoSpace].sort(() => Math.random() - 0.5);
    
    // Create mapping between current and shuffled characters
    characterMap = {};
    currentChars.forEach((char, index) => {
        if (char === ' ') {
            characterMap[char] = ' '; // Preserve spaces
        } else {
            // Find the position of this char in charsNoSpace and map to corresponding shuffled char
            const noSpaceIndex = charsNoSpace.indexOf(char);
            characterMap[char] = shuffledNoSpace[noSpaceIndex];
        }
    });
}

function initializeRowTracking(numRows) {
    rowColumns = new Array(numRows).fill(0);
    // Generate random speeds between 3 and 8 for each row
    rowSpeeds = new Array(numRows).fill(0).map(() => 
        Math.floor(Math.random() * 6) + 3
    );
}

function animateAscii() {
    const asciiContainer = document.querySelector('#ascii-container > div');
    if (!asciiContainer) return;

    let currentArt = asciiContainer.textContent;
    const lines = currentArt.split('\n');
    const width = lines[0].length;

    // Initialize row tracking if not already done
    if (rowColumns.length !== lines.length) {
        initializeRowTracking(lines.length);
        shuffleCharacters(); // Initial character mapping
    }

    if (!isTransitioning) {
        // Start new transition
        isTransitioning = true;
        transitionComplete = false;
        rowColumns = new Array(lines.length).fill(0);
    }

    // Process the wave effect
    let newLines = lines.map((line, rowIndex) => {
        let newLine = '';
        for (let x = 0; x < line.length; x++) {
            // Check if this column is within the current wave window
            if (x >= rowColumns[rowIndex] && x < rowColumns[rowIndex] + waveWidth) {
                newLine += characterMap[line[x]] || line[x];
            } else {
                newLine += line[x];
            }
        }

        // Move the wave window for this row
        rowColumns[rowIndex] += rowSpeeds[rowIndex];
        return newLine;
    });

    // Check if all rows have completed their transition
    const allRowsComplete = rowColumns.every(col => col >= width);
    
    if (allRowsComplete && !transitionComplete) {
        // Reset positions and create new mapping for next wave
        rowColumns = new Array(lines.length).fill(0);
        shuffleCharacters();
        transitionComplete = true;
        isTransitioning = false;
    }

    asciiContainer.textContent = newLines.join('\n');
}

// Update the animation button click handler
document.getElementById('animateButton').addEventListener('click', () => {
    const button = document.getElementById('animateButton');
    
    if (animationId === null) {
        // Reset animation state
        isTransitioning = false;
        transitionComplete = false;
        
        // Reset all row positions when starting animation
        const asciiContainer = document.querySelector('#ascii-container > div');
        if (asciiContainer) {
            const numRows = asciiContainer.textContent.split('\n').length;
            initializeRowTracking(numRows);
        }
        
        // Start animation
        button.textContent = 'Stop Animation';
        animationId = setInterval(animateAscii, 50);
    } else {
        // Stop animation
        button.textContent = 'Toggle Animation';
        clearInterval(animationId);
        animationId = null;
    }
});

document.getElementById('resetASCII').addEventListener('click', () => {
    characters = defaultCharacters;
    
    // Get the last uploaded image and recreate ASCII art
    const fileInput = document.getElementById('file-selector');
    if (fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const image = new Image();
            image.onload = () => createAsciiArt(image);
            image.src = e.target.result;
        };
        reader.readAsDataURL(fileInput.files[0]);
    }
    
    // If animation is running, stop it
    if (animationId !== null) {
        const button = document.getElementById('animateButton');
        button.textContent = 'Toggle Animation';
        clearInterval(animationId);
        animationId = null;
    }
});
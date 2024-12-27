import html2canvas from 'html2canvas';

let effect;
let characters = '    .:-+o*=%S$#■90';
let backgroundColor = 'black';
let ASCIIColor = 'white';
let animationId = null;
const defaultCharacters = '   .:-+o*=%S$#■90';
let characterMap = {};
let currentColumn = 0;
let waveWidth = 20; // How many columns are affected at once
let rowColumns = []; // Track column position for each row
let rowSpeeds = [];  // Different speeds for each row
let isTransitioning = false;
let transitionComplete = false;
let blinkAnimationId = null;
const blinkPairs = [
    { chars: ['o', '9'], probability: 0.3 },
    { chars: ['S', '$'], probability: 0.3 }
];

// Add special block character for random swapping
const BLOCK_CHAR = '■';

// Add this to track original characters
let originalArt = '';

// Add these variables at the top
let restoreWaveColumns = []; // Track restore wave position for each row
let restoreWaveSpeeds = []; // Speeds for restore wave
let restoreWaveStarted = false;
let restoreDelay = 1000; // 1 second delay

// Add this variable at the top
const ROW_WAVE_PROBABILITY = 0.3; // 30% chance for each row to participate in the wave

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
    // Initialize arrays with -1 to indicate inactive rows
    rowColumns = new Array(numRows).fill(-1);
    restoreWaveColumns = new Array(numRows).fill(-1);
    
    // Randomly activate some rows for the first wave
    rowColumns = rowColumns.map(() => 
        Math.random() < ROW_WAVE_PROBABILITY ? 0 : -1
    );
    
    // Generate speeds for all rows (will only be used by active rows)
    rowSpeeds = new Array(numRows).fill(0).map(() => 
        Math.floor(Math.random() * 6) + 3
    );
    restoreWaveSpeeds = [...rowSpeeds];
    restoreWaveStarted = false;
}

function animateAscii() {
    const asciiContainer = document.querySelector('#ascii-container > div');
    if (!asciiContainer) return;

    let currentArt = asciiContainer.textContent;
    const lines = currentArt.split('\n');
    let newLines = [...lines];
    const width = lines[0].length;

    // Start restore wave after delay
    if (!restoreWaveStarted && Math.max(...rowColumns.filter(col => col !== -1)) > waveWidth) {
        restoreWaveStarted = true;
        setTimeout(() => {
            // Activate same rows for restore wave that were active in first wave
            restoreWaveColumns = rowColumns.map(col => col !== -1 ? 0 : -1);
        }, restoreDelay);
    }

    // Process each line
    lines.forEach((line, rowIndex) => {
        let newLine = '';
        for (let x = 0; x < line.length; x++) {
            const char = line[x];
            let newChar = char;

            // First wave: change characters (only if row is active)
            if (rowColumns[rowIndex] !== -1 && 
                x >= rowColumns[rowIndex] && 
                x < rowColumns[rowIndex] + waveWidth) {
                if (!characterMap[char]) {
                    shuffleCharacters();
                }
                newChar = characterMap[char] || char;
            }
            
            // Restore wave: revert to original characters (only if row is active)
            if (restoreWaveColumns[rowIndex] !== -1 && 
                x >= restoreWaveColumns[rowIndex] && 
                x < restoreWaveColumns[rowIndex] + waveWidth) {
                const originalChar = originalArt.split('\n')[rowIndex][x];
                newChar = originalChar;
            }

            newLine += newChar;
        }
        newLines[rowIndex] = newLine;

        // Move the waves only for active rows
        if (rowColumns[rowIndex] !== -1) {
            rowColumns[rowIndex] += rowSpeeds[rowIndex];
        }
        if (restoreWaveColumns[rowIndex] !== -1) {
            restoreWaveColumns[rowIndex] += restoreWaveSpeeds[rowIndex];
        }
    });

    // Check if both waves are complete for active rows
    const allComplete = rowColumns.every(col => col === -1 || col >= width) && 
                       restoreWaveColumns.every(col => col === -1 || col >= width);
    
    if (allComplete) {
        // Reset for next transition with new random row selection
        rowColumns = new Array(lines.length).fill(-1).map(() => 
            Math.random() < ROW_WAVE_PROBABILITY ? 0 : -1
        );
        restoreWaveColumns = new Array(lines.length).fill(-1);
        restoreWaveStarted = false;
        shuffleCharacters();
    }

    asciiContainer.textContent = newLines.join('\n');
}

// Update the Toggle Animation button handler
document.getElementById('animateButton').addEventListener('click', () => {
    const button = document.getElementById('animateButton');
    const asciiContainer = document.querySelector('#ascii-container > div');
    
    if (animationId === null) {
        // Store original art when starting animation
        if (asciiContainer) {
            originalArt = asciiContainer.textContent;
            const numRows = asciiContainer.textContent.split('\n').length;
            initializeRowTracking(numRows);
        }
        
        // Start animation
        button.textContent = 'Stop Animation';
        animationId = setInterval(animateAscii, 50);
    } else {
        // Stop animation and restore original art
        button.textContent = 'Toggle Animation';
        clearInterval(animationId);
        animationId = null;
        if (asciiContainer) {
            asciiContainer.textContent = originalArt;
        }
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
    
    // Stop animations if running
    if (animationId !== null) {
        const waveButton = document.getElementById('animateButton');
        waveButton.textContent = 'Toggle Animation';
        clearInterval(animationId);
        animationId = null;
    }
    
    if (blinkAnimationId !== null) {
        const blinkButton = document.getElementById('blinkBlink');
        blinkButton.textContent = 'BlinkBlink';
        clearInterval(blinkAnimationId);
        blinkAnimationId = null;
    }
});

// Update the animateBlink function
function animateBlink() {
    const asciiContainer = document.querySelector('#ascii-container > div');
    if (!asciiContainer) return;

    let currentArt = asciiContainer.textContent;
    const lines = currentArt.split('\n');
    let newLines = [...lines];
    
    // Process each line
    lines.forEach((line, lineIndex) => {
        // Increase chance to process each line (50%)
        if (Math.random() < 0.5) {
            let newLine = '';
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                let newChar = char;
                
                // Increase chance to process each character (20%)
                if (Math.random() < 0.2) {
                    const originalChar = originalArt.split('\n')[lineIndex][i];
                    
                    // First check if it's currently a block character or was swapped with block
                    if (char === BLOCK_CHAR || 
                        (originalChar !== BLOCK_CHAR && char !== originalChar && char !== ' ')) {
                        // Revert to original character
                        newChar = originalChar;
                    } else {
                        // Then check regular blink pairs
                        let foundInPairs = false;
                        for (const pair of blinkPairs) {
                            if (pair.chars.includes(char)) {
                                if (char !== originalChar) {
                                    newChar = originalChar;
                                } else {
                                    newChar = char === pair.chars[0] ? pair.chars[1] : pair.chars[0];
                                }
                                foundInPairs = true;
                                break;
                            }
                        }
                        
                        // If not in pairs and not a space, maybe swap with block (1% chance)
                        if (!foundInPairs && char !== ' ' && Math.random() < 0.001) {
                            newChar = BLOCK_CHAR;
                        }
                    }
                }
                newLine += newChar;
            }
            newLines[lineIndex] = newLine;
        }
    });
    
    asciiContainer.textContent = newLines.join('\n');
}

// Update the BlinkBlink button event listener
document.getElementById('blinkBlink').addEventListener('click', () => {
    const button = document.getElementById('blinkBlink');
    const asciiContainer = document.querySelector('#ascii-container > div');
    
    if (blinkAnimationId === null && asciiContainer) {
        // Store original art when starting animation
        originalArt = asciiContainer.textContent;
        
        // Start blink animation with faster interval (50ms)
        button.textContent = 'Stop Blink';
        blinkAnimationId = setInterval(animateBlink, 50);
        
        // Stop wave animation if it's running
        if (animationId !== null) {
            const waveButton = document.getElementById('animateButton');
            waveButton.textContent = 'Toggle Animation';
            clearInterval(animationId);
            animationId = null;
        }
    } else {
        // Stop blink animation and restore original art
        button.textContent = 'BlinkBlink';
        clearInterval(blinkAnimationId);
        blinkAnimationId = null;
        if (asciiContainer) {
            asciiContainer.textContent = originalArt;
        }
    }
});
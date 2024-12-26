async function loadHtml2Canvas() {
    try {
        const html2canvas = await import('html2canvas');
        return html2canvas.default;
    } catch (error) {
        console.error('Failed to load html2canvas:', error);
        throw error;
    }
}

// Modify the screenshot handler
document.getElementById('screenshotButton').addEventListener('click', async () => {
    try {
        const html2canvas = await loadHtml2Canvas();
        const container = document.getElementById('ascii-container');
        
        // Create a wrapper div with current background color
        const wrapper = document.createElement('div');
        wrapper.style.padding = '20px';
        wrapper.style.backgroundColor = backgroundColor;
        wrapper.style.display = 'inline-block';
        
        // Clone the ASCII art
        const asciiClone = container.firstChild.cloneNode(true);
        wrapper.appendChild(asciiClone);
        
        try {
            const canvas = await html2canvas(wrapper, {
                backgroundColor: backgroundColor,
                scale: 2,
                logging: false,
                useCORS: true,
                allowTaint: true,
                foreignObjectRendering: false
            });
            
            // Create a new window with the image
            const newWindow = window.open('', '_blank');
            if (newWindow) {
                newWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                        <head>
                            <title>ASCII Art Screenshot</title>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <style>
                                body {
                                    margin: 0;
                                    padding: 20px;
                                    display: flex;
                                    flex-direction: column;
                                    align-items: center;
                                    justify-content: center;
                                    min-height: 100vh;
                                    background: ${backgroundColor};
                                    color: ${ASCIIColor};
                                    font-family: Arial, sans-serif;
                                }
                                .container {
                                    max-width: 100%;
                                    text-align: center;
                                }
                                img {
                                    max-width: 100%;
                                    height: auto;
                                    margin-bottom: 20px;
                                    border: 1px solid ${ASCIIColor};
                                }
                                .instructions {
                                    padding: 10px;
                                    border-radius: 5px;
                                    background: ${backgroundColor === 'black' ? '#333' : '#eee'};
                                }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <img src="${canvas.toDataURL()}" alt="ASCII Art">
                                <div class="instructions">
                                    To save: Right-click the image and select "Save image as..."
                                </div>
                            </div>
                        </body>
                    </html>
                `);
                newWindow.document.close();
            } else {
                alert('Please allow popups to view and save your ASCII art');
            }
        } catch (error) {
            console.error('Screenshot error:', error);
            alert('Failed to create screenshot. Please try again.');
        }
        
        // Clean up
        document.body.removeChild(wrapper);
    } catch (error) {
        console.error('Screenshot setup error:', error);
        alert('Failed to setup screenshot. Please try again.');
    }
}); 
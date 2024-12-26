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
        
        // Add wrapper to document
        document.body.appendChild(wrapper);
        
        try {
            const canvas = await html2canvas(wrapper, {
                backgroundColor: backgroundColor,
                scale: 2,
                logging: false,
                useCORS: true,
                allowTaint: true,
                foreignObjectRendering: false
            });
            
            // Open image in new tab
            const imageUrl = canvas.toDataURL('image/png');
            const newTab = window.open();
            if (newTab) {
                newTab.document.write(`
                    <html>
                        <head>
                            <title>ASCII Art Screenshot</title>
                            <style>
                                body {
                                    margin: 0;
                                    display: flex;
                                    justify-content: center;
                                    align-items: center;
                                    min-height: 100vh;
                                    background: ${backgroundColor};
                                }
                                img {
                                    max-width: 100%;
                                    max-height: 100vh;
                                }
                                p {
                                    position: fixed;
                                    bottom: 10px;
                                    left: 50%;
                                    transform: translateX(-50%);
                                    color: ${ASCIIColor};
                                    font-family: Arial, sans-serif;
                                }
                            </style>
                        </head>
                        <body>
                            <img src="${imageUrl}" alt="ASCII Art">
                            <p>Right-click the image and select "Save image as..." to download</p>
                        </body>
                    </html>
                `);
            } else {
                alert('Please allow popups to view the screenshot');
            }
            
        } catch (error) {
            console.error('Screenshot error:', error);
            alert('Failed to create screenshot. Please try again.');
        } finally {
            // Cleanup
            document.body.removeChild(wrapper);
        }
    } catch (error) {
        console.error('Screenshot setup error:', error);
        alert('Failed to setup screenshot. Please try again.');
    }
}); 
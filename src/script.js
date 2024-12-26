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
            
            // Use Blob instead of data URL
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = 'ASCII_art.png';
                link.href = url;
                link.click();
                URL.revokeObjectURL(url);
            }, 'image/png');
            
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
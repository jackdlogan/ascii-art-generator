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
            
            // Create a temporary link and trigger download
            try {
                // Convert canvas to base64 string directly
                const dataUrl = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.href = dataUrl;
                link.download = 'ASCII_art.png';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (downloadError) {
                console.error('Download error:', downloadError);
                // Fallback method
                const tab = window.open();
                if (tab) {
                    tab.document.write('<img src="' + canvas.toDataURL('image/png') + '"/>');
                } else {
                    alert('Please allow popups to download the image');
                }
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
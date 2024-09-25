function applyColorsFromImage(imgElementId) {
    const img = document.getElementById(imgElementId);

    if (!img || !img.complete) {
        console.error('Image not found or not fully loaded!');
        return;
    }

    // Extract colors after ensuring the image is loaded
    const colorThief = new ColorThief();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = img.width;
    canvas.height = img.height;

    // Draw the image onto the canvas
    ctx.drawImage(img, 0, 0, img.width, img.height);

    try {
        const dominantColor = colorThief.getColor(canvas);
        const dominantColorRgb = `rgb(${dominantColor[0]}, ${dominantColor[1]}, ${dominantColor[2]})`;

        // Dynamically update CSS variables with the extracted color
        document.documentElement.style.setProperty('--accent-color', dominantColorRgb);
        const bgColor = `rgba(${Math.max(dominantColor[0] - 30, 0)}, ${Math.max(dominantColor[1] - 30, 0)}, ${Math.max(dominantColor[2] - 30, 0)}, 1)`;
        document.documentElement.style.setProperty('--bg-color', bgColor);

        console.log('Colors applied based on the image');
    } catch (error) {
        console.error('Error extracting colors from the image:', error);
    }
}

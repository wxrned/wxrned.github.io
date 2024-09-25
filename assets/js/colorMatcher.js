function applyColorsFromImage(imgElement) {
    if (!imgElement.complete) {
        console.error('Image not fully loaded!');
        return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = imgElement.width;
    canvas.height = imgElement.height;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(imgElement, 0, 0, imgElement.width, imgElement.height);

    try {
        // Get the dominant color from the image
        const dominantColor = colorThief.getColor(canvas);
        const dominantColorRgb = `rgb(${dominantColor[0]}, ${dominantColor[1]}, ${dominantColor[2]})`;

        // Update CSS variables
        document.documentElement.style.setProperty('--accent-color', dominantColorRgb);

        // Generate lighter and darker shades for additional variables
        const textColor = adjustColorBrightness(dominantColorRgb, -50); // Darker shade for text
        const lighterTextColor = adjustColorBrightness(dominantColorRgb, 20); // Lighter shade for light text
        const iconColor = dominantColorRgb; // Same as accent
        const scrollBarColor = dominantColorRgb; // Same as accent

        // Set the CSS variables
        document.documentElement.style.setProperty('--text-color', textColor);
        document.documentElement.style.setProperty('--text-color-light', lighterTextColor);
        document.documentElement.style.setProperty('--icon-color', iconColor);
        document.documentElement.style.setProperty('--scroll-bar', scrollBarColor);

        console.log('Colors applied based on the image:', {
            dominantColor: dominantColorRgb,
            textColor: textColor,
            lighterTextColor: lighterTextColor,
            iconColor: iconColor,
            scrollBarColor: scrollBarColor,
        });
    } catch (error) {
        console.error('Error extracting colors from the image:', error);
    }
}

// Helper function to adjust color brightness
function adjustColorBrightness(color, percent) {
    // Convert the rgb string to an array of RGB values
    const rgb = color.match(/\d+/g).map(Number);
    const adjust = (value, percent) => Math.min(255, Math.max(0, value + Math.floor(value * (percent / 100))));

    // Adjust the brightness of each RGB component
    const adjustedColor = rgb.map(value => adjust(value, percent));
    return `rgb(${adjustedColor[0]}, ${adjustedColor[1]}, ${adjustedColor[2]})`;
}

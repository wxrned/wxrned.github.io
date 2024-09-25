window.addEventListener('load', function() {
    const img = document.getElementById('dc-pfp'); // Ensure the GIF has the id "gif"
    const colorThief = new ColorThief();

    img.addEventListener('load', function() {
        // Create a canvas to extract the first frame of the GIF
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw the first frame of the GIF onto the canvas
        ctx.drawImage(img, 0, 0);

        // Extract the dominant color from the first frame using Color Thief
        const dominantColor = colorThief.getColor(canvas);

        // Convert the color array to a CSS-friendly format
        const dominantColorRgb = `rgb(${dominantColor[0]}, ${dominantColor[1]}, ${dominantColor[2]})`;

        // Dynamically update CSS variables with the extracted color
        document.documentElement.style.setProperty('--accent-color', dominantColorRgb);

        // Apply some variations of the dominant color for other CSS variables
        const lighterColor = `rgba(${dominantColor[0]}, ${dominantColor[1]}, ${dominantColor[2]}, 0.7)`;
        const darkerColor = `rgba(${Math.max(dominantColor[0] - 50, 0)}, ${Math.max(dominantColor[1] - 50, 0)}, ${Math.max(dominantColor[2] - 50, 0)}, 1)`;

        document.documentElement.style.setProperty('--img-border-color', dominantColorRgb);
        document.documentElement.style.setProperty('--btn-color', darkerColor);
        document.documentElement.style.setProperty('--btn-bg', lighterColor);
        document.documentElement.style.setProperty('--text-color', darkerColor);
        document.documentElement.style.setProperty('--text-color-light', lighterColor);
        document.documentElement.style.setProperty('--icon-color', dominantColorRgb);
        document.documentElement.style.setProperty('--scroll-bar', dominantColorRgb);

        // Update the background color with a slightly darker version of the dominant color
        const bgColor = `rgba(${Math.max(dominantColor[0] - 30, 0)}, ${Math.max(dominantColor[1] - 30, 0)}, ${Math.max(dominantColor[2] - 30, 0)}, 1)`;
        document.documentElement.style.setProperty('--bg-color', bgColor);
    });
});

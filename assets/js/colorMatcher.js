window.addEventListener('load', function() {
    const img = document.getElementById('dc-pfp'); 
    const colorThief = new ColorThief();

    img.addEventListener('load', function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0);

        const dominantColor = colorThief.getColor(canvas);

        const dominantColorRgb = `rgb(${dominantColor[0]}, ${dominantColor[1]}, ${dominantColor[2]})`;

        document.documentElement.style.setProperty('--accent-color', dominantColorRgb);

        const lighterColor = `rgba(${dominantColor[0]}, ${dominantColor[1]}, ${dominantColor[2]}, 0.7)`;
        const darkerColor = `rgba(${Math.max(dominantColor[0] - 50, 0)}, ${Math.max(dominantColor[1] - 50, 0)}, ${Math.max(dominantColor[2] - 50, 0)}, 1)`;

        document.documentElement.style.setProperty('--img-border-color', dominantColorRgb);
        document.documentElement.style.setProperty('--btn-color', darkerColor);
        document.documentElement.style.setProperty('--btn-bg', lighterColor);
        document.documentElement.style.setProperty('--text-color', darkerColor);
        document.documentElement.style.setProperty('--text-color-light', lighterColor);
        document.documentElement.style.setProperty('--icon-color', dominantColorRgb);
        document.documentElement.style.setProperty('--scroll-bar', dominantColorRgb);
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const squares = document.querySelectorAll('.square');
    
    let img = new Image();
    let secondImg = new Image();
    secondImg.src = 'meme.png';
    let userImg = new Image();
    let userImgLoaded = false;
    let currentText = 'tag text here...';

    // Canvas logo display
    const logoPositions = {
        logo1: { x: 730, y: 185, width: 344.4, height: 107.5 },
        logo2: { x: 730, y: 185, width: 344.4, height: 107.5 }
    };

    let currentBackgroundColor = getComputedStyle(squares[0]).backgroundColor;
    let currentTextColor = '#F5F5ED'; // Default color
    let currentLogoUrl = 'logo2.png'; // Default logo
    let showFrame = true; // Default to showing frame

    // Big text settings
    let bigTextSize = 240;
    let bigTextX = 900;
    let bigTextY = 1800;

    // Define roundRect function for CanvasRenderingContext2D
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radii) {
        const [topLeft, topRight, bottomRight, bottomLeft] = Array.isArray(radii) ? radii : [radii, radii, radii, radii];
        this.beginPath();
        this.moveTo(x + topLeft, y);
        this.lineTo(x + width - topRight, y);
        this.arcTo(x + width, y, x + width, y + height, topRight);
        this.lineTo(x + width, y + height - bottomRight);
        this.arcTo(x + width, y + height, x, y + height, bottomRight);
        this.lineTo(x + bottomLeft, y + height);
        this.arcTo(x, y + height, x, y, bottomLeft);
        this.lineTo(x, y + topLeft);
        this.arcTo(x, y, x + width, y, topLeft);
        this.closePath();
        return this;
    };    

    // Event listener for changing background color by clicking squares
    squares.forEach(square => {
        square.addEventListener('click', () => {
            // Update the background color based on the clicked square
            currentBackgroundColor = getComputedStyle(square).backgroundColor;
            drawCanvas();
        });
    });

    // Load custom font for big text
    const bigTextFont = new FontFace('GTEesti', 'url(GTEesti.woff2)');
    bigTextFont.load().then((font) => {
        document.fonts.add(font);
        console.log("Font loaded successfully!");
    }).catch((error) => {
        console.error("Failed to load font:", error);
    });

    // Draw the canvas with background, images, and text
    function drawCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Set background color
        ctx.fillStyle = currentBackgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw the user image (uploaded image or placeholder)
        if (userImgLoaded) {
            drawUserImage();
        } else {
            drawPlaceholderImage();
        }
    
        // Toggle between regular text and big text
        if (bigTextCheckbox.checked) {
            // Hide regular text and logo, only draw big text
            drawBigText();
        } else {
            // Draw regular text and logo if the checkbox is unchecked
            drawText();
            const pos = (currentLogoUrl === 'logo.png') ? logoPositions.logo1 : logoPositions.logo2;
            const logoY = showFrame ? pos.y : pos.y - 70; // Move logo up if the frame is not shown
            ctx.drawImage(img, pos.x, logoY, pos.width, pos.height);
        }
    }      

    function drawCenteredImage(img, isPlaceholder = true) {
        const wrapX = showFrame ? 70 : 0;
        const wrapY = showFrame ? 70 : 0;
        const targetSize = showFrame ? 1660 : 1800; // 1800px when frame is not shown
    
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        let scaledWidth, scaledHeight;
    
        // Resize the image to fit the target size
        if (aspectRatio > 1) {
            scaledHeight = targetSize;
            scaledWidth = targetSize * aspectRatio;
        } else {
            scaledWidth = targetSize;
            scaledHeight = targetSize / aspectRatio;
        }
    
        const centerX = wrapX + (targetSize - scaledWidth) / 2;
        const centerY = wrapY + (targetSize - scaledHeight) / 2;
    
        ctx.save();
        ctx.beginPath();
        if (showFrame) {
            // Apply rounded corners
            ctx.roundRect(wrapX, wrapY, targetSize, targetSize, [360, 0, 360, 0]);
        } else {
            ctx.rect(wrapX, wrapY, targetSize, targetSize);
        }
        ctx.clip();
    
        if ((isPlaceholder && secondImg.complete && secondImg.naturalHeight !== 0) || 
            (!isPlaceholder && userImgLoaded)) {
            ctx.drawImage(img, centerX, centerY, scaledWidth, scaledHeight);
        }
    
        ctx.restore();
    
        // Only draw the small text if the big text checkbox is NOT checked
        if (!bigTextCheckbox.checked) {
            drawText();
        }
    }    

    function drawPlaceholderImage() {
        drawCenteredImage(secondImg, true);
    }

    function drawUserImage() {
        drawCenteredImage(userImg, false);
    }

    function drawText() {
        const yOffset = showFrame ? 0 : 70;
        const yPosition = showFrame ? 1590 : 1590 + yOffset;
        const xPosition = canvas.width / 2;
    
        ctx.font = '38px Graphik';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
    
        const textWidth = ctx.measureText(currentText).width;
        const totalWidth = textWidth + 60;
    
        // Draw the rounded rectangle frame first
        ctx.save(); // Save the current context state
        ctx.beginPath();
        ctx.roundRect(xPosition - totalWidth / 2, yPosition - 38 / 2 - 8, totalWidth, 38 + 16, 20); // Use roundRect for rounded corners
        ctx.strokeStyle = currentTextColor;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore(); // Restore the context state to remove the frame from the clipping path
    
        // Draw the text
        ctx.fillStyle = currentTextColor;
        ctx.fillText(currentText, xPosition, yPosition, totalWidth);
    }      

    // Big text drawing function
    function drawBigText() {
        ctx.font = `${bigTextSize}px GTEesti`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom'; // Align the baseline to the bottom of the canvas
        ctx.fillStyle = currentBackgroundColor; // Text color matches the background color
    
        // Draw the big text at the current position
        ctx.fillText(currentText, bigTextX, bigTextY);
    }    

    // Handle file upload
    document.getElementById('upload').addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                userImg = new Image();
                userImg.onload = () => {
                    userImgLoaded = true;
                    drawCanvas();
                };
                userImg.src = event.target.result;
            };
            reader.readAsDataURL(file);
        };
        input.click();
    });

    // Text input handler
    document.getElementById('userText').addEventListener('input', (e) => {
        currentText = e.target.value;
        drawCanvas();
    });

    // Color picker handler
    document.getElementById('textColorSelect').addEventListener('change', (e) => {
        currentTextColor = e.target.value;
        currentLogoUrl = (currentTextColor === '#3d8054') ? 'logo.png' : 'logo2.png';
        img.src = currentLogoUrl;
        img.onload = drawCanvas;
    });

    // Frame checkbox handler
    document.getElementById('frameCheckbox').addEventListener('change', (e) => {
        showFrame = e.target.checked;
        drawCanvas();
    });

    // Big text checkbox and sliders
    const bigTextCheckbox = document.getElementById('bigTextCheckbox');
    const bigTextSliders = document.getElementById('bigTextSliders');
    const textSizeSlider = document.getElementById('textSizeSlider');
    const textXPositionSlider = document.getElementById('textXPositionSlider');
    const textYPositionSlider = document.getElementById('textYPositionSlider');

    bigTextCheckbox.addEventListener('change', (e) => {
        bigTextSliders.style.display = e.target.checked ? 'block' : 'none';
        drawCanvas();
    });

    // Sliders for big text adjustment
    textSizeSlider.addEventListener('input', () => {
        bigTextSize = textSizeSlider.value;
        drawCanvas();
    });
    textXPositionSlider.addEventListener('input', () => {
        bigTextX = textXPositionSlider.value;
        drawCanvas();
    });
    textYPositionSlider.addEventListener('input', () => {
        bigTextY = textYPositionSlider.value;
        drawCanvas();
    });

    // Ensure the logo image is ready
    img.onload = () => {
        drawCanvas();
    };
    img.src = currentLogoUrl;

    // Draw the initial canvas
    drawCanvas();
});
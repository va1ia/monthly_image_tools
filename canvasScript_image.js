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
    
        // Draw the logo image on top of the user image
        const pos = (currentLogoUrl === 'logo.png') ? logoPositions.logo1 : logoPositions.logo2;
        const logoY = showFrame ? pos.y : pos.y - 70; // Move logo up by 70px if frame is not shown
        ctx.drawImage(img, pos.x, logoY, pos.width, pos.height);
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
                    drawCanvas(); // Draw the canvas as soon as the image is loaded
                };
                userImg.src = event.target.result;
            };
            reader.readAsDataURL(file);
        };
        input.click();
    });

    // Ensure the logo image is ready
    img.onload = () => {
        drawCanvas();
    };
    
    // Set the default logo
    img.src = currentLogoUrl;

    function drawCenteredImage(img, isPlaceholder = true) {
        console.log(isPlaceholder ? "Drawing placeholder image..." : "Drawing user-uploaded image...");
        const wrapX = showFrame ? 70 : 0;
        const wrapY = showFrame ? 70 : 0;
        const targetSize = showFrame ? 1660 : 1800; // 1800px when frame is not shown
        
        const borderRadius = showFrame ? [360, 0, 360, 0] : [0, 0, 0, 0];
        
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        let scaledWidth, scaledHeight;
    
        // Resize the image to fit the target size
        if (aspectRatio > 1) {
            // Landscape orientation, height is the shorter side
            scaledHeight = targetSize;
            scaledWidth = targetSize * aspectRatio;
        } else {
            // Portrait orientation, width is the shorter side
            scaledWidth = targetSize;
            scaledHeight = targetSize / aspectRatio;
        }
    
        // Calculate centered position
        const centerX = wrapX + (targetSize - scaledWidth) / 2;
        const centerY = wrapY + (targetSize - scaledHeight) / 2;
    
        ctx.save();
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(wrapX, wrapY, targetSize, targetSize, borderRadius);
        } else {
            ctx.rect(wrapX, wrapY, targetSize, targetSize);
        }
        ctx.clip();
    
        if ((isPlaceholder && secondImg.complete && secondImg.naturalHeight !== 0) || 
            (!isPlaceholder && userImgLoaded)) {
            ctx.drawImage(img, centerX, centerY, scaledWidth, scaledHeight);
        }
    
        ctx.restore();
        drawText();
    }

    function drawPlaceholderImage() {
        drawCenteredImage(secondImg, true);
    }
    
    function drawUserImage() {
        drawCenteredImage(userImg, false);
    }

    function drawText() {
        const yOffset = showFrame ? 0 : 70; // Move text down by 70px when frame is not shown
        const yPosition = showFrame ? 1590 : 1590 + yOffset; // Adjust y position if frame is not shown
        const xPosition = canvas.width / 2;
    
        ctx.font = '38px Graphik';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
    
        const textWidth = ctx.measureText(currentText).width;
        const totalWidth = textWidth + 60;
    
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(xPosition - totalWidth / 2, yPosition - 38 / 2 - 8, totalWidth, 38 + 16, 20);
        ctx.strokeStyle = currentTextColor;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
    
        ctx.fillStyle = currentTextColor;
        ctx.fillText(currentText, xPosition, yPosition, totalWidth);
    }
    

    document.getElementById('userText').addEventListener('input', (e) => {
        currentText = e.target.value;
        drawCanvas();
    });

    squares.forEach(square => {
        square.addEventListener('click', () => {
            currentBackgroundColor = getComputedStyle(square).backgroundColor;
            drawCanvas();
        });
    });

    document.getElementById('textColorSelect').addEventListener('change', (e) => {
        currentTextColor = e.target.value;
        currentLogoUrl = (currentTextColor === '#3d8054') ? 'logo.png' : 'logo2.png';
        img.src = currentLogoUrl;
        img.onload = drawCanvas;
    });

    document.getElementById('frameCheckbox').addEventListener('change', (e) => {
        showFrame = e.target.checked;
        drawCanvas();
    });

    drawCanvas();
});
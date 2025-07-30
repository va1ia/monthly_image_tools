document.addEventListener('DOMContentLoaded', () => {
    // 强制加载字体
    const fontLoader = new FontFace('Graphik', 'url(../graphik.woff)');
    const fontLoaderLight = new FontFace('Graphik', 'url(../graphik-light.woff)', { weight: '200' });

    Promise.all([
        fontLoader.load(),
        fontLoaderLight.load()
    ]).then((fonts) => {
        fonts.forEach(font => document.fonts.add(font));
        // 字体加载完成后再初始化
        initializeApplication();
    }).catch(() => {
        // 如果字体加载失败，仍然初始化应用
        console.warn('Font loading failed, using fallback');
        initializeApplication();
    });

    // 将原来的初始化代码包装成函数
    function initializeApplication() {
        // DOM elements
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        const squares = document.querySelectorAll('.square2');
        const userText = document.getElementById('userText');
        const charCount = document.getElementById('charCount');
        const widthSlider = document.getElementById('widthSlider');
        const uploadBtn = document.getElementById('upload');
        const downloadBtn = document.getElementById('download');

        // Application state
        const state = {
            currentText: 'type your text here... minimum 2 lines plz',
            currentBackgroundColor: getComputedStyle(squares[0]).backgroundColor,
            currentLogoUrl: '../logo.png',
            userImgLoaded: false
        };

    // Image objects
    const images = {
        logo: new Image(),
        placeholder: new Image(),
        userImage: new Image()
    };
    
    images.placeholder.src = '../meme.png';

    // Configuration constants
    const CONFIG = {
        logoPositions: {
            logo1: { x: 667.1, y: 190, width: 464.2, height: 100 },
            logo2: { x: 667.1, y: 190, width: 464.2, height: 100 }
        },
        text: {
            font: '105px Graphik',
            maxWidth: 1450,
            letterSpacing: '-1.1%'
        },
        image: {
            borderRadius: 80,
            defaultY: 480,
            userImageY: 480
        }
    };

    // Utility functions
    const utils = {
        getTextLines(ctx, text, maxWidth) {
            const words = text.split(' ');
            if (words.length === 0) return [''];
            
            const lines = [];
            let currentLine = words[0];

            for (let i = 1; i < words.length; i++) {
                const word = words[i];
                const testLine = currentLine + ' ' + word;
                const width = ctx.measureText(testLine).width;
                
                if (width < maxWidth) {
                    currentLine = testLine;
                } else {
                    lines.push(currentLine);
                    currentLine = word;
                }
            }
            lines.push(currentLine);
            return lines;
        },

        getImageHeight(lineCount) {
            const heights = {
                1: 1080,
                2: 1040,
                3: 950
            };
            return heights[lineCount] || 900; // 4+ lines
        },

        getTopPosition(lineCount) {
            const positions = {
                1: 1978,
                2: 1910,
                3: 1795
            };
            return positions[lineCount] || 1710; // 4+ lines
        },

        getLineHeight(lineCount) {
            const baseHeight = 105;
            const multipliers = {
                1: 1.3,
                2: 1.3,
                3: 1.4
            };
            return baseHeight * (multipliers[lineCount] || 1.3); // 4+ lines
        },

        getTextColor() {
            const colorElement = state.currentLogoUrl === '../logo.png' ? 
                document.getElementById('picnic') : 
                document.getElementById('morning');
            return getComputedStyle(colorElement).backgroundColor;
        },

        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }
    };

    // Drawing functions
    const draw = {
        canvas() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Set font first for accurate text measurement
            ctx.font = CONFIG.text.font;
            
            // Draw background
            ctx.fillStyle = state.currentBackgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw logo
            this.logo();
        },

        logo() {
            images.logo.src = state.currentLogoUrl;
            
            const drawContent = () => {
                const pos = state.currentLogoUrl === '../logo.png' ? 
                    CONFIG.logoPositions.logo1 : 
                    CONFIG.logoPositions.logo2;
                
                ctx.drawImage(images.logo, pos.x, pos.y, pos.width, pos.height);
                
                // Draw image after logo is loaded
                if (state.userImgLoaded) {
                    this.userImage();
                } else {
                    this.placeholderImage();
                }
            };
            
            images.logo.onload = drawContent;
            
            // If image is already loaded, draw immediately
            if (images.logo.complete && images.logo.naturalHeight !== 0) {
                drawContent();
            }
        },

        text(yPosition) {
            const lines = utils.getTextLines(ctx, state.currentText, CONFIG.text.maxWidth);
            const lineCount = lines.length;
            const lineHeight = utils.getLineHeight(lineCount);
            
            ctx.fillStyle = utils.getTextColor();
            ctx.font = CONFIG.text.font;
            ctx.textAlign = 'center';
            ctx.letterSpacing = CONFIG.text.letterSpacing;
            
            const x = canvas.width / 2;
            const startY = utils.getTopPosition(lineCount);
            
            lines.forEach((line, index) => {
                ctx.fillText(line, x, startY + (index * lineHeight));
            });
        },

        imageWithClipping(img, x, y, width, height) {
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(x, y, width, height, [CONFIG.image.borderRadius]);
            ctx.clip();
            
            if (img.complete && img.naturalHeight !== 0) {
                const aspectRatio = img.naturalWidth / img.naturalHeight;
                let drawHeight = height;
                let drawWidth = drawHeight * aspectRatio;
                
                // Scale up if width is less than crop width
                if (drawWidth < width) {
                    drawWidth = width;
                    drawHeight = drawWidth / aspectRatio;
                }
                
                const drawX = x + (width - drawWidth) / 2;
                const drawY = y + (height - drawHeight) / 2;
                
                ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
            }
            
            ctx.restore();
        },

        placeholderImage() {
            const lines = utils.getTextLines(ctx, state.currentText, CONFIG.text.maxWidth);
            const lineCount = lines.length;
            const imageWidth = parseInt(widthSlider.value);
            const imageHeight = utils.getImageHeight(lineCount);
            const imageX = (canvas.width - imageWidth) / 2;
            const imageY = CONFIG.image.defaultY;
            
            this.imageWithClipping(images.placeholder, imageX, imageY, imageWidth, imageHeight);
            this.text();
        },

        userImage() {
            const lines = utils.getTextLines(ctx, state.currentText, CONFIG.text.maxWidth);
            const lineCount = lines.length;
            const imageWidth = parseInt(widthSlider.value);
            const imageHeight = utils.getImageHeight(lineCount);
            const imageX = (canvas.width - imageWidth) / 2;
            const imageY = CONFIG.image.userImageY;
            
            this.imageWithClipping(images.userImage, imageX, imageY, imageWidth, imageHeight);
            this.text();
        }
    };

    // Event handlers
    const handlers = {
        textInput() {
            const text = userText.value;
            const count = text.length;
            
            // Update character count
            charCount.textContent = `Characters: ${count}`;
            
            // Auto-resize textarea
            userText.style.height = 'auto';
            userText.style.height = userText.scrollHeight + 'px';
            
            // Update state and redraw
            state.currentText = text || 'type your text here... minimum 2 lines plz';
            draw.canvas();
        },

        colorSelect(square) {
            // Update state
            state.currentBackgroundColor = getComputedStyle(square).backgroundColor;
            const id = square.id;
            state.currentLogoUrl = (id === 'picnic' || id === 'purple') ? '../logo2.png' : '../logo.png';
            
            // Update UI
            squares.forEach(s => {
                s.classList.remove('selected');
                s.innerHTML = '';
            });
            
            square.classList.add('selected');
            this.addLogoToSquare(square);
            
            // Redraw canvas
            draw.canvas();
        },

        addLogoToSquare(square) {
            const logo = document.createElement('img');
            logo.src = state.currentLogoUrl;
            logo.alt = 'logo';
            Object.assign(logo.style, {
                width: '50%',
                height: 'auto',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
            });
            square.appendChild(logo);
        },

        uploadImage() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                const reader = new FileReader();
                reader.onload = (event) => {
                    images.userImage.onload = () => {
                        state.userImgLoaded = true;
                        widthSlider.value = Math.min(images.userImage.width, parseInt(widthSlider.max));
                        draw.canvas();
                    };
                    images.userImage.src = event.target.result;
                };
                reader.readAsDataURL(file);
            };
            
            input.click();
        },

        downloadCanvas() {
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = 'my-monthly-meme.png';
            link.click();
        },

        sliderChange: utils.debounce(() => {
            draw.canvas();
        }, 100)
    };

    // Initialize default selection by simulating click on first square
    const initializeDefaults = () => {
        // Set initial slider value
        widthSlider.value = widthSlider.max;
        
        // Set initial font for text measurement
        ctx.font = CONFIG.text.font;
        
        // Simulate clicking the first square (pink/blush)
        if (squares.length > 0) {
            const firstSquare = squares[0]; // This is the pink/blush square
            handlers.colorSelect(firstSquare); // Trigger the same logic as clicking
        }
    };

    // Event listeners
    userText.addEventListener('input', handlers.textInput);
    widthSlider.addEventListener('input', handlers.sliderChange);
    uploadBtn.addEventListener('click', handlers.uploadImage);
    downloadBtn.addEventListener('click', handlers.downloadCanvas);

    squares.forEach(square => {
        square.addEventListener('click', () => handlers.colorSelect(square));
    });

    // Initialize application
    initializeDefaults();

    // Expose some functions globally if needed (for debugging)
    window.memeGenerator = {
        state,
        draw,
        utils
    };
};
});
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Handle image upload
document.getElementsByClassName('upload').addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };
    input.click();
});

// Handle download
document.getElementById('download').addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = canvas.toDataURL();
    link.download = 'canvas.png';
    link.click();
});

// Handle text input
document.getElementById('userText').addEventListener('input', (e) => {
    const text = e.target.value;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillText(text, 10, canvas.height - 10);
});

// Handle slider input
document.getElementById('widthSlider').addEventListener('input', (e) => {
    const width = e.target.value;
    canvas.style.width = `${width}px`;
});
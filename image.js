document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Failed to get canvas context');
        return;
    }

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
});
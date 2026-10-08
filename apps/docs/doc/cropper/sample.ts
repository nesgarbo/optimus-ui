/** A picture to crop, drawn on a canvas so that the demos need no file: a sky, a sun, and hills. */
export function samplePicture(): string {
    if (typeof document === 'undefined') return '';

    const canvas = document.createElement('canvas');

    canvas.width = 960;
    canvas.height = 600;

    const context = canvas.getContext('2d')!;
    const sky = context.createLinearGradient(0, 0, 0, 600);

    sky.addColorStop(0, '#60a5fa');
    sky.addColorStop(1, '#fde68a');
    context.fillStyle = sky;
    context.fillRect(0, 0, 960, 600);
    context.fillStyle = '#f59e0b';
    context.beginPath();
    context.arc(700, 190, 80, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = '#16a34a';
    context.beginPath();
    context.moveTo(0, 600);
    context.quadraticCurveTo(220, 300, 480, 470);
    context.quadraticCurveTo(720, 340, 960, 520);
    context.lineTo(960, 600);
    context.fill();
    context.fillStyle = '#166534';
    context.beginPath();
    context.moveTo(0, 600);
    context.quadraticCurveTo(300, 450, 560, 560);
    context.quadraticCurveTo(780, 500, 960, 600);
    context.fill();

    return canvas.toDataURL('image/png');
}

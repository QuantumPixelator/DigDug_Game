const images = {
    player: new Image(),
    pooka: new Image(),
    fygar: new Image(),
    rock: new Image()
};

images.player.src = '../../assets/sprites/player.svg';
images.pooka.src = '../../assets/sprites/pooka.svg';
images.fygar.src = '../../assets/sprites/fygar.svg';
images.rock.src = '../../assets/sprites/rock.svg';

function getAnimTime(speed = 150) {
    return Math.floor(Date.now() / speed) % 2;
}

function drawSprite(ctx, img, x, y, dir, isGhost = false, scale = 1, bounce = false) {
    if (!img.complete) return;
    
    ctx.save();
    
    // Add a slight bounce animation for walking
    const yOffset = (bounce && getAnimTime() === 1) ? 2 : 0;
    
    ctx.translate(x + 8, y + 8 + yOffset);
    
    // Directional Flipping
    if (dir === 'left') {
        ctx.scale(-1, 1);
    } else if (dir === 'up') {
        ctx.rotate(-Math.PI / 2);
    } else if (dir === 'down') {
        ctx.rotate(Math.PI / 2);
    }
    
    if (scale !== 1) ctx.scale(scale, scale);
    if (isGhost) ctx.globalAlpha = 0.5;

    // Draw the image exactly fitting the 16x16 cell
    ctx.drawImage(img, -8, -8, 16, 16);
    ctx.restore();
}

function drawExplosionFX(ctx, x, y, progress) {
    const clamped = Math.max(0, Math.min(1, progress));
    const ringRadius = 4 + clamped * 12;
    const alpha = 1 - clamped;

    ctx.save();
    ctx.strokeStyle = `rgba(255, 220, 140, ${alpha})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x + 8, y + 8, ringRadius, 0, Math.PI * 2);
    ctx.stroke();

    for (let i = 0; i < 7; i++) {
        const angle = (Math.PI * 2 * i) / 7 + clamped * 0.8;
        const distance = 3 + clamped * 14;
        const px = x + 8 + Math.cos(angle) * distance;
        const py = y + 8 + Math.sin(angle) * distance;
        ctx.fillStyle = `rgba(255, 170, 70, ${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}

const sprites = {
    player: {
        idle: (ctx, x, y, dir) => drawSprite(ctx, images.player, x, y, dir, false, 1, false),
        walking: (ctx, x, y, dir) => drawSprite(ctx, images.player, x, y, dir, false, 1, true),
        digging: (ctx, x, y, dir) => drawSprite(ctx, images.player, x, y, dir, false, 1, true),
        dying: (ctx, x, y, dir, progress = 0) => {
            const clamped = Math.max(0, Math.min(1, progress));
            const scale = Math.max(0, 1 - clamped);

            if (!images.player.complete) return;

            ctx.save();
            ctx.translate(x + 8, y + 8);
            ctx.rotate(clamped * Math.PI * 3);

            if (dir === 'left') {
                ctx.scale(-1, 1);
            } else if (dir === 'up') {
                ctx.rotate(-Math.PI / 2);
            } else if (dir === 'down') {
                ctx.rotate(Math.PI / 2);
            }

            ctx.scale(scale, scale);
            ctx.globalAlpha = Math.max(0.1, 1 - clamped * 0.9);
            ctx.drawImage(images.player, -8, -8, 16, 16);
            ctx.restore();
        },
        pumping: (ctx, x, y, dir) => {
            drawSprite(ctx, images.player, x, y, dir, false, 1, false);
            // Draw pump hose
            ctx.save();
            ctx.translate(x + 8, y + 8);
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            const pumpMove = getAnimTime(100) * 2;
            if (dir === 'left') { ctx.moveTo(-6, 2); ctx.lineTo(-14 - pumpMove, 2); }
            else if (dir === 'right') { ctx.moveTo(6, 2); ctx.lineTo(14 + pumpMove, 2); }
            else if (dir === 'up') { ctx.moveTo(0, -6); ctx.lineTo(0, -14 - pumpMove); }
            else { ctx.moveTo(0, 6); ctx.lineTo(0, 14 + pumpMove); }
            ctx.stroke();
            ctx.restore();
        }
    },
    pooka: {
        walking: (ctx, x, y, dir) => drawSprite(ctx, images.pooka, x, y, dir, false, 1, true),
        ghosting: (ctx, x, y, dir) => drawSprite(ctx, images.pooka, x, y, dir, true, 1, true),
        inflating: (ctx, x, y, dir) => drawSprite(ctx, images.pooka, x, y, dir, false, 1.2 + (getAnimTime(100)*0.1), false),
        exploding: (ctx, x, y, dir, progress = 0) => {
            drawSprite(ctx, images.pooka, x, y, dir, false, 1.1 + progress * 0.8, false);
            drawExplosionFX(ctx, x, y, progress);
        }
    },
    fygar: {
        walking: (ctx, x, y, dir) => drawSprite(ctx, images.fygar, x, y, dir, false, 1, true),
        ghosting: (ctx, x, y, dir) => drawSprite(ctx, images.fygar, x, y, dir, true, 1, true),
        inflating: (ctx, x, y, dir) => drawSprite(ctx, images.fygar, x, y, dir, false, 1.2 + (getAnimTime(100)*0.1), false),
        exploding: (ctx, x, y, dir, progress = 0) => {
            drawSprite(ctx, images.fygar, x, y, dir, false, 1.1 + progress * 0.8, false);
            drawExplosionFX(ctx, x, y, progress);
        }
    },
    environment: {
        rock: (ctx, x, y) => {
            if (images.rock.complete) {
                ctx.drawImage(images.rock, x, y, 16, 16);
            }
        }
    }
};

export default sprites;
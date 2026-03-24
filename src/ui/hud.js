import { GAME_WIDTH } from '../config/game-config.js';
import { CELL_SIZE, GRID_HEIGHT } from '../world/grid.js';

export class HUD {
    constructor() {
        this.lives = 3;
        this.level = 1;
    }

    render(ctx, score) {
        const playfieldBottom = GRID_HEIGHT * CELL_SIZE;
        const hudTextY = playfieldBottom + 3;

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px "Segoe UI", Tahoma, Geneva, Verdana, sans-serif';
        ctx.textBaseline = 'top';
        // Add subtle drop shadow to text
        ctx.shadowColor = 'black';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        // Lives
        ctx.textAlign = 'left';
        ctx.fillText(`Lives: ${this.lives}`, 10, hudTextY);

        // Score
        ctx.textAlign = 'center';
        ctx.fillText(`Score: ${score.score}`, GAME_WIDTH / 2, hudTextY);

        // Level
        ctx.textAlign = 'right';
        ctx.fillText(`Level: ${this.level}`, GAME_WIDTH - 10, hudTextY);

        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        ctx.shadowColor = 'transparent'; // Reset shadow
    }
}

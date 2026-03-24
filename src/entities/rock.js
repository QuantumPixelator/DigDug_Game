import { CELL_SIZE } from '../world/grid.js';
import sprites from '../render/sprites.js';

export class Rock {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.state = 'stable'; // 'stable', 'wobbling', 'falling', 'bursting'
        this.wobbleTimer = 0;
        this.wobbleDuration = 1500; // 1.5 seconds
        this.active = true;
        this.burstTimer = 0;
        this.burstDuration = 350;
        this.burstPieces = [];
    }

    update(grid, player, enemies) {
        if (!this.active) return;

        const gridX = Math.floor(this.x / CELL_SIZE);
        const gridY = Math.floor(this.y / CELL_SIZE);

        if (this.state === 'bursting') {
            this.burstTimer += 1000 / 60;
            if (this.burstTimer >= this.burstDuration) {
                this.active = false;
            }
            return;
        }

        if (this.state === 'stable') {
            // Check if the dirt beneath the rock is removed
            if (gridY < grid.grid.length - 1 && grid.grid[gridY + 1][gridX].type === 'tunnel') {
                this.state = 'wobbling';
            }
        } else if (this.state === 'wobbling') {
            this.wobbleTimer += 1000/60;
            if (this.wobbleTimer > this.wobbleDuration) {
                this.state = 'falling';
            }
        } else if (this.state === 'falling') {
            this.y += 4; // falling speed

            // Check for collision with player or enemies
            const fallingGridY = Math.floor(this.y / CELL_SIZE);
            const nextGridY = fallingGridY + 1;
            if (nextGridY >= grid.grid.length || grid.grid[nextGridY][gridX].type !== 'tunnel') {
                this.startBurst();
                return;
            }

            // Simple collision check
            if(Math.abs(player.x - this.x) < CELL_SIZE && Math.abs(player.y - this.y) < CELL_SIZE) {
                player.die();
            }
            enemies.forEach(enemy => {
                if(Math.abs(enemy.x - this.x) < CELL_SIZE && Math.abs(enemy.y - this.y) < CELL_SIZE) {
                    enemy.kill();
                }
            });

        }
    }

    startBurst() {
        this.state = 'bursting';
        this.burstTimer = 0;
        this.burstPieces = [];

        for (let i = 0; i < 9; i++) {
            this.burstPieces.push({
                angle: (Math.PI * 2 * i) / 9,
                speed: 1.2 + Math.random() * 1.8,
                size: 2 + Math.random() * 2
            });
        }
    }

    render(ctx) {
        if (!this.active) return;

        if (this.state === 'bursting') {
            const progress = Math.min(1, this.burstTimer / this.burstDuration);

            ctx.save();
            this.burstPieces.forEach(piece => {
                const distance = 14 * progress * piece.speed;
                const px = this.x + 8 + Math.cos(piece.angle) * distance;
                const py = this.y + 8 + Math.sin(piece.angle) * distance;

                ctx.fillStyle = `rgba(180, 150, 120, ${1 - progress})`;
                ctx.beginPath();
                ctx.arc(px, py, piece.size * (1 - progress * 0.5), 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.restore();
            return;
        }
        
        let renderX = this.x;
        if(this.state === 'wobbling') {
            renderX += Math.sin(this.wobbleTimer / 100) * 2;
        }

        sprites.environment.rock(ctx, renderX, this.y);
    }
}

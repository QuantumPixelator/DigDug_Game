import { CELL_SIZE } from '../world/grid.js';

export class Harpoon {
    constructor(x, y, direction) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.speed = 4;
        this.maxLength = 3 * CELL_SIZE;
        this.currentLength = 0;
        this.active = true;
        this.hitEnemy = null;
    }

    update(enemies) {
        if (this.active && !this.hitEnemy) {
            let dx = 0;
            let dy = 0;

            if (this.direction === 'left') {
                dx = -this.speed;
            } else if (this.direction === 'right') {
                dx = this.speed;
            } else if (this.direction === 'up') {
                dy = -this.speed;
            } else if (this.direction === 'down') {
                dy = this.speed;
            }

            this.x += dx;
            this.y += dy;
            this.currentLength += this.speed;

            if (this.currentLength >= this.maxLength) {
                this.active = false;
            }

            // Check for collision with enemies
            for (const enemy of enemies) {
                if (!enemy.active || enemy.dying || enemy.removed) {
                    continue;
                }

                const hitboxPadding = 4; // 4 pixels on each side
                if (
                    this.x < enemy.x + CELL_SIZE - hitboxPadding &&
                    this.x + 4 > enemy.x + hitboxPadding &&
                    this.y < enemy.y + CELL_SIZE - hitboxPadding &&
                    this.y + 4 > enemy.y + hitboxPadding
                ) {
                    this.hitEnemy = enemy;
                    enemy.state = 'inflating';
                    break;
                }
            }
        }
    }

    render(ctx) {
        if (this.active) {
            ctx.save();
            ctx.translate(this.x + 2, this.y + 2);

            // Rotate based on direction
            if (this.direction === 'left') ctx.rotate(Math.PI);
            else if (this.direction === 'up') ctx.rotate(-Math.PI / 2);
            else if (this.direction === 'down') ctx.rotate(Math.PI / 2);

            // Draw rope/hose
            ctx.beginPath();
            ctx.moveTo(-this.currentLength, 0);
            ctx.lineTo(0, 0);
            ctx.strokeStyle = '#cccccc';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([2, 2]);
            ctx.stroke();
            ctx.setLineDash([]);

            // Draw Harpoon Head (Metallic Arrow)
            ctx.fillStyle = '#ffcc00'; // Gold base
            ctx.beginPath();
            ctx.moveTo(-4, -3);
            ctx.lineTo(6, 0);
            ctx.lineTo(-4, 3);
            ctx.lineTo(-2, 0);
            ctx.fill();
            
            // Edge highlight
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(-4, -3);
            ctx.lineTo(6, 0);
            ctx.lineTo(-2, 0);
            ctx.fill();

            ctx.restore();
        }
    }
}

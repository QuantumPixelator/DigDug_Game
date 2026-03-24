import { CELL_SIZE, GRID_WIDTH, GRID_HEIGHT } from '../world/grid.js';
import sprites from '../render/sprites.js';
import { Harpoon } from './harpoon.js';

export class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.state = 'idle';
        this.speed = 0.5; // default player speed on level 1
        this.direction = 'right';
        this.harpoon = null;
        this.pumping = false;
        this.pumped = false;
        this.alive = true;
        this.deathTimer = 0;
        this.deathDuration = 700;
    }

    update(input, grid, enemies) {
        if (!this.alive) {
            if (this.state === 'dying') {
                this.deathTimer += 1000 / 60;
                if (this.deathTimer >= this.deathDuration) {
                    this.state = 'dead';
                }
            }
            return;
        }

        if (input.space && !this.harpoon && !this.pumping) {
            this.harpoon = new Harpoon(this.x + CELL_SIZE / 2, this.y + CELL_SIZE / 2, this.direction);
        }

        if (this.harpoon) {
            this.harpoon.update(enemies);

            if (this.harpoon.hitEnemy) {
                this.pumping = true;
                if (input.space && !this.pumped) {
                    this.harpoon.hitEnemy.inflate();
                    this.pumped = true;
                }
                if (!input.space) {
                    this.pumped = false;
                }

                if (this.harpoon.hitEnemy.state === 'exploding') {
                    this.harpoon = null;
                    this.pumping = false;
                } else if (this.harpoon.hitEnemy.state !== 'inflating') {
                    // Enemy escaped
                    this.harpoon = null;
                    this.pumping = false;
                }

            } else if (!this.harpoon.active) {
                this.harpoon = null;
                this.pumping = false;
            }
        } else {
            this.pumping = false;
        }


        if (this.pumping) {
            this.state = 'pumping';
            return; // No movement while pumping
        }


        let intent = null;
        if (input.left) intent = 'left';
        else if (input.right) intent = 'right';
        else if (input.up) intent = 'up';
        else if (input.down) intent = 'down';

        let dx = 0;
        let dy = 0;
        let isMoving = false;

        const onGridX = this.x % CELL_SIZE === 0;
        const onGridY = this.y % CELL_SIZE === 0;

        if (intent) {
            let canTurn = false;
            if (intent === 'left' || intent === 'right') {
                if (onGridY) canTurn = true;
            } else {
                if (onGridX) canTurn = true;
            }

            if (canTurn) {
                this.direction = intent;
            }

            // Move in the current confirmed direction if valid
            if (this.direction === 'left') {
                if (this.y % CELL_SIZE === 0) { dx = -this.speed; isMoving = true; }
            } else if (this.direction === 'right') {
                if (this.y % CELL_SIZE === 0) { dx = this.speed; isMoving = true; }
            } else if (this.direction === 'up') {
                if (this.x % CELL_SIZE === 0) { dy = -this.speed; isMoving = true; }
            } else if (this.direction === 'down') {
                if (this.x % CELL_SIZE === 0) { dy = this.speed; isMoving = true; }
            }
        }

        // Apply grid boundaries to prevent walking off the map
        if (isMoving) {
            this.state = 'walking';
            let nextX = this.x + dx;
            let nextY = this.y + dy;
            
            // Prevent moving outside the 14x14 grid
            nextX = Math.max(0, Math.min(nextX, (GRID_WIDTH - 1) * CELL_SIZE));
            nextY = Math.max(0, Math.min(nextY, (GRID_HEIGHT - 1) * CELL_SIZE));

            this.x = nextX;
            this.y = nextY;

            grid.dig(this.x + CELL_SIZE / 2, this.y + CELL_SIZE / 2);
        } else {
            this.state = 'idle';
        }
    }

    die() {
        if (!this.alive) return;

        this.alive = false;
        this.state = 'dying';
        this.deathTimer = 0;
        this.harpoon = null;
        this.pumping = false;
        this.pumped = false;
    }

    render(ctx) {
        if (this.state === 'dead') return;

        if (this.state === 'dying') {
            const progress = Math.min(1, this.deathTimer / this.deathDuration);
            sprites.player.dying(ctx, this.x, this.y, this.direction, progress);
        } else {
            sprites.player[this.state](ctx, this.x, this.y, this.direction);
        }

        if (this.harpoon) {
            this.harpoon.render(ctx);
        }
    }
}

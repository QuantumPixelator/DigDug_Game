import { CELL_SIZE, GRID_WIDTH, GRID_HEIGHT, isAlignedToGridAxis } from '../world/grid.js';
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

        const onGridX = isAlignedToGridAxis(this.x);
        const onGridY = isAlignedToGridAxis(this.y);

        const nudgeToward = (pos, target) => {
            const delta = target - pos;
            if (Math.abs(delta) <= this.speed) return delta;
            return delta > 0 ? this.speed : -this.speed;
        };

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

            // Move along the lane, or slide onto a vertical/horizontal lane first (0.5px steps can stop mid-cell).
            if (this.direction === 'left' || this.direction === 'right') {
                if (onGridY) {
                    dx = this.direction === 'left' ? -this.speed : this.speed;
                    isMoving = true;
                } else {
                    const targetY = Math.round(this.y / CELL_SIZE) * CELL_SIZE;
                    const clampedY = Math.max(0, Math.min(targetY, (GRID_HEIGHT - 1) * CELL_SIZE));
                    dy = nudgeToward(this.y, clampedY);
                    isMoving = true;
                }
            } else if (this.direction === 'up' || this.direction === 'down') {
                if (onGridX) {
                    dy = this.direction === 'up' ? -this.speed : this.speed;
                    isMoving = true;
                } else {
                    const targetX = Math.round(this.x / CELL_SIZE) * CELL_SIZE;
                    const clampedX = Math.max(0, Math.min(targetX, (GRID_WIDTH - 1) * CELL_SIZE));
                    dx = nudgeToward(this.x, clampedX);
                    isMoving = true;
                }
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

    moveLeft() {
        this.direction = 'left';
        this.state = 'walking';
    }

    moveRight() {
        this.direction = 'right';
        this.state = 'walking';
    }

    moveUp() {
        this.direction = 'up';
        this.state = 'walking';
    }

    moveDown() {
        this.direction = 'down';
        this.state = 'walking';
    }
}

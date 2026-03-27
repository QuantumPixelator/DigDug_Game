import sprites from '../render/sprites.js';
import { CELL_SIZE, GRID_WIDTH, GRID_HEIGHT } from '../world/grid.js';
import { Fire } from './fire.js';

export class Enemy {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type; // 'pooka' or 'fygar'
        this.state = 'walking'; // 'walking', 'ghosting', 'inflating', 'exploding'
        this.speed = 0.25; // default enemy speed on level 1, will be increased by game level
        this.direction = 'left';
        this.inflation = 0;
        this.active = true;
        this.ghostingTimer = 0;
        this.ghostingCooldown = 5000; // 5 seconds
        this.fire = null;
        this.fireCooldown = 2000;
        this.fireTimer = 0;
        this.dying = false;
        this.removed = false;
        this.deathTimer = 0;
        this.deathDuration = 450;
        this.justDied = false;
    }

    update(grid, player) {
        if (this.removed) return;

        if (this.dying) {
            this.deathTimer += 1000 / 60;
            if (this.deathTimer >= this.deathDuration) {
                this.removed = true;
            }
            return;
        }

        if (!this.active) return;

        if (this.state === 'inflating' || this.fire) {
            if(this.fire) {
                this.fire.update();
                if(!this.fire.active) {
                    this.fire = null;
                }
            }
            // Movement is locked while inflating or breathing fire
            return;
        }

        this.fireTimer += 1000/60;
        
        this.ghostingTimer += 1000/60; // approximately 16.67ms
        if(this.ghostingTimer > this.ghostingCooldown) {
            this.state = 'ghosting';
            this.ghostingTimer = 0;
        }

        if (this.state === 'ghosting') {
            // Move directly towards the player
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const angle = Math.atan2(dy, dx);
            this.x += Math.cos(angle) * this.speed;
            this.y += Math.sin(angle) * this.speed;

            // If the enemy touches an open tunnel, it materializes
            const gridX = Math.max(0, Math.min(Math.floor(this.x / CELL_SIZE), GRID_WIDTH - 1));
            const gridY = Math.max(0, Math.min(Math.floor(this.y / CELL_SIZE), GRID_HEIGHT - 1));
            if (grid.grid[gridY][gridX].type === 'tunnel') {
                this.state = 'walking';
            }
            return;
        }

        // Fygar fire breath
        if (this.type === 'fygar' && this.fireTimer > this.fireCooldown) {
            const playerGridY = Math.floor(player.y / CELL_SIZE);
            const enemyGridY = Math.floor(this.y / CELL_SIZE);

            if (playerGridY === enemyGridY) {
                // aligned horizontally
                this.fire = new Fire(this.x, this.y, this.direction);
                this.fireTimer = 0;
                return;
            }
        }


        // Pathfinding - Only make decisions when perfectly centered in a cell, otherwise the server will crash
        const onGridX = this.x % CELL_SIZE === 0;
        const onGridY = this.y % CELL_SIZE === 0;

        if (onGridX && onGridY) {
            const currentGridX = Math.floor(this.x / CELL_SIZE);
            const currentGridY = Math.floor(this.y / CELL_SIZE);

            const possibleDirections = [];
            if (currentGridX > 0 && grid.grid[currentGridY][currentGridX - 1].type === 'tunnel') {
                possibleDirections.push('left');
            }
            if (currentGridX < GRID_WIDTH - 1 && grid.grid[currentGridY][currentGridX + 1].type === 'tunnel') {
                possibleDirections.push('right');
            }
            if (currentGridY > 0 && grid.grid[currentGridY - 1][currentGridX].type === 'tunnel') {
                possibleDirections.push('up');
            }
            if (currentGridY < GRID_HEIGHT - 1 && grid.grid[currentGridY + 1][currentGridX].type === 'tunnel') {
                possibleDirections.push('down');
            }

            if (possibleDirections.length > 0) {
                // If the current direction is not possible, or at a crossroad, choose a new direction
                if (possibleDirections.length > 2 || !possibleDirections.includes(this.direction)) {
                    // Try not to immediately turn backwards unless it's a dead end
                    let validTurns = possibleDirections;
                    if (possibleDirections.length > 1) {
                        const opposite = { 'left': 'right', 'right': 'left', 'up': 'down', 'down': 'up' };
                        validTurns = possibleDirections.filter(d => d !== opposite[this.direction]);
                        if (validTurns.length === 0) validTurns = possibleDirections; // Fallback
                    }
                    this.direction = validTurns[Math.floor(Math.random() * validTurns.length)];
                }
            } else {
                this.direction = null; // Trapped, don't move
            }
        }
        
        let dx = 0;
        let dy = 0;

        if (this.direction === 'left') dx = -this.speed;
        else if (this.direction === 'right') dx = this.speed;
        else if (this.direction === 'up') dy = -this.speed;
        else if (this.direction === 'down') dy = this.speed;

        this.x += dx;
        this.y += dy;
    }

    inflate() {
        if (this.state === 'inflating') {
            this.inflation += 1;
            if (this.inflation > 3) { // 3 pumps to pop
                this.kill();
            }
        }
    }

    kill() {
        if (this.dying || this.removed) return;

        this.state = 'exploding';
        this.active = false;
        this.dying = true;
        this.deathTimer = 0;
        this.fire = null;
        this.justDied = true;
    }

    render(ctx) {
        if (this.removed) return;

        if (this.state === 'exploding') {
            const progress = Math.min(1, this.deathTimer / this.deathDuration);
            sprites[this.type].exploding(ctx, this.x, this.y, this.direction, progress);
            return;
        }

        if (!this.active) return;

        sprites[this.type][this.state](ctx, this.x, this.y, this.direction);
        if (this.fire) {
            this.fire.render(ctx);
        }
    }
}

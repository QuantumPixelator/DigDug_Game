export const GRID_WIDTH = 14;
export const GRID_HEIGHT = 14;
export const CELL_SIZE = 16;

export class Grid {
    constructor({ rockCells = [], startTunnel = { x: 1, y: 1 } } = {}) {
        this.rocks = [];
        this.grid = [];
        for (let y = 0; y < GRID_HEIGHT; y++) {
            this.grid[y] = [];
            for (let x = 0; x < GRID_WIDTH; x++) {
                this.grid[y][x] = {
                    type: 'dirt',
                    depth: Math.floor(y / 4)
                };
            }
        }
        this.addRocks(rockCells);
        this.carveStartTunnel(startTunnel);
    }

    addRocks(rockCells) {
        rockCells.forEach(({ x, y }) => {
            if (x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT) {
                this.grid[y][x].type = 'rock';
            }
        });
    }

    carveStartTunnel(startTunnel) {
        const startX = startTunnel.x;
        const startY = startTunnel.y;

        // Carve only the single starting cell
        if (
            startX >= 0 &&
            startX < GRID_WIDTH &&
            startY >= 0 &&
            startY < GRID_HEIGHT &&
            this.grid[startY][startX].type !== 'rock'
        ) {
            this.grid[startY][startX].type = 'tunnel';
        }
    }

    dig(x, y) {
        const gridX = Math.floor(x / CELL_SIZE);
        const gridY = Math.floor(y / CELL_SIZE);

        if (gridX >= 0 && gridX < GRID_WIDTH && gridY >= 0 && gridY < GRID_HEIGHT) {
            if (this.grid[gridY][gridX].type === 'dirt') {
                this.grid[gridY][gridX].type = 'tunnel';
            }
        }
    }

    render(ctx) {
        for (let y = 0; y < GRID_HEIGHT; y++) {
            for (let x = 0; x < GRID_WIDTH; x++) {
                const cell = this.grid[y][x];
                // Render dirt background for both dirt and rock cells
                if (cell.type === 'dirt' || cell.type === 'rock') {
                    const colors = ['#CD853F', '#A0522D', '#8B4513', '#654321'];
                    ctx.fillStyle = colors[cell.depth];
                    ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                    
                    // Add subtle pixel texture to dirt
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
                    ctx.fillRect(x * CELL_SIZE + 2, y * CELL_SIZE + 2, 2, 2);
                    ctx.fillRect(x * CELL_SIZE + 10, y * CELL_SIZE + 6, 2, 2);
                    ctx.fillRect(x * CELL_SIZE + 4, y * CELL_SIZE + 12, 2, 2);
                }
            }
        }
    }
}

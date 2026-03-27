import { CELL_SIZE } from '../world/grid.js';

export function isCellOverlap(aX, aY, bX, bY) {
    return Math.abs(aX - bX) < CELL_SIZE && Math.abs(aY - bY) < CELL_SIZE;
}

export function isRectOverlap(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

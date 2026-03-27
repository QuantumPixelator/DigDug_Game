import { Game } from './core/game.js';
import { GAME_WIDTH, GAME_HEIGHT, GAME_SCALE } from './config/game-config.js';

const canvas = document.getElementById('gameCanvas');
const playButton = document.getElementById('playButton');

canvas.width = GAME_WIDTH * GAME_SCALE;
canvas.height = GAME_HEIGHT * GAME_SCALE;

const game = new Game({ canvas, playButton });
game.start();

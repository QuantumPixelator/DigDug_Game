import { Game } from './core/game.js';
import { GAME_WIDTH, GAME_HEIGHT, GAME_SCALE } from './config/game-config.js';

const canvas = document.getElementById('gameCanvas');
const playButton = document.getElementById('playButton');

function resizeCanvas() {
	// Maintain aspect ratio (GAME_WIDTH:GAME_HEIGHT)
	const aspect = GAME_WIDTH / GAME_HEIGHT;
	let w = window.innerWidth;
	let h = window.innerHeight;
	if (w / h > aspect) {
		w = h * aspect;
	} else {
		h = w / aspect;
	}
	canvas.style.width = w + 'px';
	canvas.style.height = h + 'px';
}

window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', resizeCanvas);
resizeCanvas();

// Prevent scrolling/zooming on mobile
document.body.addEventListener('touchmove', function(e) {
	e.preventDefault();
}, { passive: false });

canvas.width = GAME_WIDTH * GAME_SCALE;
canvas.height = GAME_HEIGHT * GAME_SCALE;

const game = new Game({ canvas, playButton });
game.start();

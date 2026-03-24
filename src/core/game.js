import { Grid, CELL_SIZE } from '../world/grid.js';
import { Player } from '../entities/player.js';
import { Enemy } from '../entities/enemy.js';
import { Rock } from '../entities/rock.js';
import { Score } from '../ui/score.js';
import { HUD } from '../ui/hud.js';
import { InputController } from './input.js';
import {
    getGameSettings,
    GAME_HEIGHT,
    GAME_WIDTH,
    GAME_SCALE,
} from '../config/game-config.js';
import { isCellOverlap, isRectOverlap } from '../utils/collision.js';

export class Game {
    constructor({ canvas, playButton }) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.setTransform(GAME_SCALE, 0, 0, GAME_SCALE, 0, 0);
        this.playButton = playButton;

        this.grid = null;
        this.player = null;
        this.enemies = [];
        this.rocks = [];

        this.score = new Score();
        this.hud = new HUD();
        this.level = 1;
        this.settings = getGameSettings();
        this.hud.lives = this.settings.defaultLives;

        this.isPlaying = false;
        this.isPaused = false;
        this.monstersFrozen = false;
        this.lastTimestamp = 0;
        this.levelIntro = {
            active: false,
            timer: 0,
            level: this.level
        };

        this.input = new InputController(window);
        this.gameLoop = this.gameLoop.bind(this);
        this.onPlayClicked = this.onPlayClicked.bind(this);
    }

    start() {
        this.input.attach();
        this.playButton.addEventListener('click', this.onPlayClicked);
        this.resetLevel();
        requestAnimationFrame(this.gameLoop);
    }

    onPlayClicked(event) {
        event.target.style.display = 'none';
        this.isPlaying = true;
        this.isPaused = false;
        this.activateLevelIntro();
    }

    processInputActions() {
        if (this.input.consumeAction('togglePause') && this.isPlaying && !this.levelIntro.active) {
            this.isPaused = !this.isPaused;
        }

        if (this.input.consumeAction('toggleMonsterFreeze')) {
            this.monstersFrozen = !this.monstersFrozen;
            if (this.monstersFrozen) {
                // Clear active fire so enemies cannot keep attacking while frozen.
                this.enemies.forEach(enemy => {
                    enemy.fire = null;
                });
            }
        }
    }

    activateLevelIntro() {
        this.levelIntro.active = true;
        this.levelIntro.timer = 0;
        this.levelIntro.level = this.level;
    }

    updateLevelIntro(deltaTime) {
        if (!this.levelIntro.active) return;

        this.levelIntro.timer += deltaTime;
        const totalDuration = this.settings.levelIntroHoldMs + this.settings.levelIntroFadeMs;

        if (this.levelIntro.timer >= totalDuration) {
            this.levelIntro.active = false;
            this.levelIntro.timer = 0;
        }
    }

    isPlayerInFire(playerObj, fire) {
        const fireX = fire.direction === 'left' ? fire.x - fire.width : fire.x;
        const fireY = fire.y;

        return isRectOverlap(
            { x: playerObj.x, y: playerObj.y, width: CELL_SIZE, height: CELL_SIZE },
            { x: fireX, y: fireY, width: fire.width, height: fire.height }
        );
    }

    resetLevel() {
        this.settings = getGameSettings();
        this.hud.level = this.level;
        this.grid = new Grid({
            rockCells: this.settings.gridRockCells,
            startTunnel: this.settings.startTunnel
        });
        this.player = new Player(this.settings.playerSpawn.x, this.settings.playerSpawn.y);
        this.enemies = this.settings.enemySpawns.map(spawn => new Enemy(spawn.x, spawn.y, spawn.type));

        this.rocks = [];
        for (let y = 0; y < this.grid.grid.length; y++) {
            for (let x = 0; x < this.grid.grid[y].length; x++) {
                if (this.grid.grid[y][x].type === 'rock') {
                    this.rocks.push(new Rock(x * CELL_SIZE, y * CELL_SIZE));
                }
            }
        }

        this.enemies.forEach(enemy => {
            enemy.speed += (this.level - 1) * this.settings.levelEnemySpeedStep;
        });

        this.activateLevelIntro();
    }

    update() {
        this.player.update(this.input.state, this.grid, this.enemies);

        let allEnemiesResolved = true;
        this.enemies.forEach(enemy => {
            if (!this.monstersFrozen) {
                enemy.update(this.grid, this.player);
            }

            if (enemy.justDied) {
                const depth = Math.floor(enemy.y / (CELL_SIZE * this.settings.scoreDepthRows));
                this.score.add(this.settings.scoreBasePoints * (depth + 1));
                enemy.justDied = false;
            }

            if (!enemy.removed) {
                allEnemiesResolved = false;
            }

            if (!this.monstersFrozen && this.player.alive && enemy.active && isCellOverlap(this.player.x, this.player.y, enemy.x, enemy.y)) {
                this.player.die();
            }

            if (!this.monstersFrozen && this.player.alive && enemy.fire && enemy.fire.active && this.isPlayerInFire(this.player, enemy.fire)) {
                this.player.die();
            }
        });

        this.rocks.forEach(rock => rock.update(this.grid, this.player, this.enemies));

        if (this.player.state === 'dead') {
            this.hud.lives = Math.max(0, this.hud.lives - 1);
            if (this.hud.lives === 0) {
                this.isPlaying = false;
                this.isPaused = false;
                this.settings = getGameSettings();
                this.playButton.textContent = this.settings.uiText.playAgain;
                this.playButton.style.display = 'block';

                this.level = 1;
                this.score.reset();
                this.hud.lives = this.settings.defaultLives;
                this.resetLevel();
            } else {
                this.player = new Player(this.settings.playerSpawn.x, this.settings.playerSpawn.y);
            }
        }

        if (allEnemiesResolved) {
            this.level++;
            this.resetLevel();
        }
    }

    render() {
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        this.grid.render(this.ctx);
        this.player.render(this.ctx);
        this.enemies.forEach(enemy => enemy.render(this.ctx));
        this.rocks.forEach(rock => rock.render(this.ctx));
        this.hud.render(this.ctx, this.score);

        if (this.levelIntro.active) {
            this.renderLevelIntro();
        }

        if (this.isPaused) {
            this.renderPauseBanner();
        }
    }

    renderLevelIntro() {
        let alpha = 1;

        if (this.levelIntro.timer > this.settings.levelIntroHoldMs) {
            if (this.settings.levelIntroFadeMs <= 0) {
                alpha = 0;
            } else {
                const fadeProgress = (this.levelIntro.timer - this.settings.levelIntroHoldMs) / this.settings.levelIntroFadeMs;
                alpha = Math.max(0, 1 - fadeProgress);
            }
        }

        this.ctx.save();
        this.ctx.fillStyle = `rgba(0, 0, 0, ${0.7 * alpha})`;
        this.ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        this.ctx.font = 'bold 24px "Segoe UI", Tahoma, Geneva, Verdana, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(`${this.settings.uiText.levelPrefix}${this.levelIntro.level}`, GAME_WIDTH / 2, GAME_HEIGHT / 2);
        this.ctx.restore();
    }

    renderPauseBanner() {
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        this.ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 18px "Segoe UI", Tahoma, Geneva, Verdana, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Paused', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 8);

        this.ctx.font = '12px "Segoe UI", Tahoma, Geneva, Verdana, sans-serif';
        this.ctx.fillText('Press P to resume', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 16);
        this.ctx.restore();
    }

    gameLoop(timestamp) {
        if (!this.lastTimestamp) {
            this.lastTimestamp = timestamp;
        }

        const deltaTime = timestamp - this.lastTimestamp;
        this.lastTimestamp = timestamp;

        this.processInputActions();

        if (this.isPlaying && this.levelIntro.active) {
            this.updateLevelIntro(deltaTime);
        } else if (this.isPlaying && !this.isPaused) {
            this.update();
        }
        this.render();

        requestAnimationFrame(this.gameLoop);
    }
}

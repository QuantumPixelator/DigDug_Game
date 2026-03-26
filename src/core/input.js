export class InputController {
    constructor(target = window) {
        this.target = target;
        this.state = {
            left: false,
            right: false,
            up: false,
            down: false,
            space: false
        };
        this.pendingActions = {
            togglePause: false,
            toggleMonsterFreeze: false,
            jumpToFinalLevel: false
        };

        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
        this.onTouchStart = this.onTouchStart.bind(this);
        this.onTouchMove = this.onTouchMove.bind(this);
        this.onTouchEnd = this.onTouchEnd.bind(this);
        this.touchStartX = null;
        this.touchStartY = null;
    }

    onKeyDown(event) {
        if ((event.key === 'p' || event.key === 'P') && !event.repeat) {
            this.pendingActions.togglePause = true;
            return;
        }

        if ((event.key === 'x' || event.key === 'X') && !event.repeat) {
            this.pendingActions.toggleMonsterFreeze = true;
            return;
        }

        if ((event.key === 'j' || event.key === 'J') && !event.repeat) {
            this.pendingActions.jumpToFinalLevel = true;
            return;
        }

        this.setKeyState(event.key, true);
    }

    onKeyUp(event) {
        this.setKeyState(event.key, false);
    }

    onTouchStart(event) {
        const touch = event.touches[0];
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
    }

    onTouchMove(event) {
        if (this.touchStartX === null || this.touchStartY === null) return;

        const touch = event.touches[0];
        const deltaX = touch.clientX - this.touchStartX;
        const deltaY = touch.clientY - this.touchStartY;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX > 30) {
                this.state.right = true;
                this.state.left = false;
            } else if (deltaX < -30) {
                this.state.left = true;
                this.state.right = false;
            }
        } else {
            if (deltaY > 30) {
                this.state.down = true;
                this.state.up = false;
            } else if (deltaY < -30) {
                this.state.up = true;
                this.state.down = false;
            }
        }
    }

    onTouchEnd(event) {
        this.state.left = false;
        this.state.right = false;
        this.state.up = false;
        this.state.down = false;
        this.touchStartX = null;
        this.touchStartY = null;
    }

    setKeyState(key, isPressed) {
        switch (key) {
            case 'ArrowLeft':
                this.state.left = isPressed;
                break;
            case 'ArrowRight':
                this.state.right = isPressed;
                break;
            case 'ArrowUp':
                this.state.up = isPressed;
                break;
            case 'ArrowDown':
                this.state.down = isPressed;
                break;
            case ' ':
                this.state.space = isPressed;
                break;
        }
    }

    consumeAction(actionName) {
        const shouldRun = Boolean(this.pendingActions[actionName]);
        this.pendingActions[actionName] = false;
        return shouldRun;
    }

    attach() {
        this.target.addEventListener('keydown', this.onKeyDown);
        this.target.addEventListener('keyup', this.onKeyUp);
        this.target.addEventListener('touchstart', this.onTouchStart);
        this.target.addEventListener('touchmove', this.onTouchMove);
        this.target.addEventListener('touchend', this.onTouchEnd);
    }

    detach() {
        this.target.removeEventListener('keydown', this.onKeyDown);
        this.target.removeEventListener('keyup', this.onKeyUp);
        this.target.removeEventListener('touchstart', this.onTouchStart);
        this.target.removeEventListener('touchmove', this.onTouchMove);
        this.target.removeEventListener('touchend', this.onTouchEnd);
    }
}

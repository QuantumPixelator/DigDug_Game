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
        this.touchThreshold = 30; // More responsive threshold
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
        // Handle action button press
        if (event.target.id === 'action-button') {
            this.state.space = true;
            return;
        }

        const touch = event.touches[0];
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;

        // Reset movement states at the beginning of a new touch
        this.state.left = false;
        this.state.right = false;
        this.state.up = false;
        this.state.down = false;
    }

    onTouchStart(event) {
        // Handle action button press
        if (event.target.id === 'action-button') {
            this.state.space = true;
            event.target.classList.add('active');
            return;
        }

        const touch = event.touches[0];
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
        // Reset movement states at the beginning of a new touch
        this.state.left = false;
        this.state.right = false;
        this.state.up = false;
        this.state.down = false;
    }
            if (deltaY > this.touchThreshold) {
                this.state.down = true;
                this.state.up = false;
            } else if (deltaY < -this.touchThreshold) {
                this.state.up = true;
                this.state.down = false;
            }
        }
    }

    onTouchEnd(event) {
        // Handle action button release
        if (event.target && event.target.id === 'action-button') {
            event.target.classList.remove('active');
        }
        if (this.state.space) {
            this.state.space = false;
        }
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
        this.target.addEventListener('touchstart', this.onTouchStart, { passive: false });
        this.target.addEventListener('touchmove', this.onTouchMove, { passive: false });
        this.target.addEventListener('touchend', this.onTouchEnd);

        const actionButton = document.getElementById('action-button');
        if (actionButton) {
            actionButton.addEventListener('touchstart', this.onTouchStart, { passive: false });
            actionButton.addEventListener('touchend', this.onTouchEnd);
        }
    }

    detach() {
        this.target.removeEventListener('keydown', this.onKeyDown);
        this.target.removeEventListener('keyup', this.onKeyUp);
        this.target.removeEventListener('touchstart', this.onTouchStart);
        this.target.removeEventListener('touchmove', this.onTouchMove);
        this.target.removeEventListener('touchend', this.onTouchEnd);

        const actionButton = document.getElementById('action-button');
        if (actionButton) {
            actionButton.removeEventListener('touchstart', this.onTouchStart);
            actionButton.removeEventListener('touchend', this.onTouchEnd);
        }
    }
}


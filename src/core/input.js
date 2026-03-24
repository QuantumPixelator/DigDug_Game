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
    }

    detach() {
        this.target.removeEventListener('keydown', this.onKeyDown);
        this.target.removeEventListener('keyup', this.onKeyUp);
    }
}

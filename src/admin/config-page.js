import {
    getGameSettings,
    resetGameSettings,
    saveGameSettings
} from '../config/game-config.js';

const form = document.getElementById('configForm');
const status = document.getElementById('status');
const resetButton = document.getElementById('resetButton');

const fieldNames = [
    'defaultLives',
    'levelEnemySpeedStep',
    'scoreBasePoints',
    'scoreDepthRows',
    'levelIntroHoldMs',
    'levelIntroFadeMs'
];

function setStatus(message) {
    status.textContent = message;
}

function populateForm(config) {
    fieldNames.forEach(name => {
        const input = form.elements.namedItem(name);
        if (!input) return;
        input.value = String(config[name]);
    });
}

function readFormValues() {
    const raw = {};
    fieldNames.forEach(name => {
        const input = form.elements.namedItem(name);
        raw[name] = input ? Number(input.value) : undefined;
    });
    return raw;
}

form.addEventListener('submit', event => {
    event.preventDefault();
    const saved = saveGameSettings(readFormValues());
    populateForm(saved);
    setStatus('Settings saved. They apply on the next level or next game.');
});

resetButton.addEventListener('click', () => {
    const defaults = resetGameSettings();
    populateForm(defaults);
    setStatus('Defaults restored.');
});

populateForm(getGameSettings());

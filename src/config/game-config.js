export const GAME_WIDTH = 224;
export const GAME_HEIGHT = 244;
export const GAME_SCALE = 3;

export const CONFIG_STORAGE_KEY = 'digdug.adminConfig';

export const DEFAULT_GAME_SETTINGS = {
    playerSpawn: { x: 0, y: 0 },
    startTunnel: { x: 0, y: 0 },
    gridRockCells: [
        { x: 3, y: 2 },
        { x: 8, y: 5 },
        { x: 5, y: 9 }
    ],
    enemySpawns: [
        { x: 128, y: 128, type: 'pooka' },
        { x: 176, y: 192, type: 'fygar' }
    ],
    levelEnemySpeedStep: 0.25,
    scoreBasePoints: 100,
    scoreDepthRows: 4,
    defaultLives: 3,
    levelIntroHoldMs: 5000,
    levelIntroFadeMs: 900,
    uiText: {
        playAgain: 'Play Again',
        levelPrefix: 'Level '
    }
};

function clampNumber(value, min, max, fallback) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
        return fallback;
    }
    return Math.min(max, Math.max(min, numeric));
}

function sanitizeStoredConfig(rawConfig) {
    const safeConfig = rawConfig && typeof rawConfig === 'object' ? rawConfig : {};

    return {
        defaultLives: Math.round(clampNumber(safeConfig.defaultLives, 1, 9, DEFAULT_GAME_SETTINGS.defaultLives)),
        levelEnemySpeedStep: clampNumber(
            safeConfig.levelEnemySpeedStep,
            0,
            3,
            DEFAULT_GAME_SETTINGS.levelEnemySpeedStep
        ),
        scoreBasePoints: Math.round(clampNumber(safeConfig.scoreBasePoints, 10, 10000, DEFAULT_GAME_SETTINGS.scoreBasePoints)),
        scoreDepthRows: Math.round(clampNumber(safeConfig.scoreDepthRows, 1, 12, DEFAULT_GAME_SETTINGS.scoreDepthRows)),
        levelIntroHoldMs: Math.round(clampNumber(safeConfig.levelIntroHoldMs, 0, 20000, DEFAULT_GAME_SETTINGS.levelIntroHoldMs)),
        levelIntroFadeMs: Math.round(clampNumber(safeConfig.levelIntroFadeMs, 0, 5000, DEFAULT_GAME_SETTINGS.levelIntroFadeMs))
    };
}

function getStoredSettings() {
    if (typeof window === 'undefined' || !window.localStorage) {
        return {};
    }

    try {
        const rawValue = window.localStorage.getItem(CONFIG_STORAGE_KEY);
        if (!rawValue) {
            return {};
        }
        const parsedValue = JSON.parse(rawValue);
        return sanitizeStoredConfig(parsedValue);
    } catch {
        return {};
    }
}

export function getGameSettings() {
    const overrides = getStoredSettings();
    return {
        ...DEFAULT_GAME_SETTINGS,
        ...overrides
    };
}

export function saveGameSettings(partialSettings) {
    if (typeof window === 'undefined' || !window.localStorage) {
        return getGameSettings();
    }

    const existing = getStoredSettings();
    const merged = sanitizeStoredConfig({
        ...existing,
        ...partialSettings
    });

    window.localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(merged));
    return {
        ...DEFAULT_GAME_SETTINGS,
        ...merged
    };
}

export function resetGameSettings() {
    if (typeof window === 'undefined' || !window.localStorage) {
        return DEFAULT_GAME_SETTINGS;
    }

    window.localStorage.removeItem(CONFIG_STORAGE_KEY);
    return DEFAULT_GAME_SETTINGS;
}

import { GameState, ActionType } from '../shared';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const readline: any;

const readNextLine = (): string => {
    return readline();
};

export const readGameStateFromGameLoopTick = (): GameState => {
    const gameState: GameState = {
        players: {},
        possibleActions: {},
    };

    const actionCount = parseInt(readNextLine());

    for (let i = 0; i < actionCount; i++) {
        const inputs = readNextLine().split(' ');
        const id = parseInt(inputs[0]);
        gameState.possibleActions[id] = {
            id,
            type: inputs[1] as ActionType,
            deltas: [
                parseInt(inputs[2]),
                parseInt(inputs[3]),
                parseInt(inputs[4]),
                parseInt(inputs[5]),
            ],
            price: parseInt(inputs[6]),
            tomeIndex: parseInt(inputs[7]),
            taxCount: parseInt(inputs[8]),
            castable: inputs[9] !== '0',
            repeatable: inputs[10] !== '0',
        };
    }

    for (let i = 0; i < 2; i++) {
        const inputs = readNextLine().split(' ');

        gameState.players[i] = {
            ingredients: [
                parseInt(inputs[0]),
                parseInt(inputs[1]),
                parseInt(inputs[2]),
                parseInt(inputs[3]),
            ],
            score: parseInt(inputs[4]),
        };
    }

    return gameState;
};

export const cloneGameState = (gameState: GameState): GameState => {
    const clonedState: GameState = {
        players: {},
        possibleActions: {},
    };

    const playerIds = Object.keys(gameState.players);

    for (let i = 0, iMax = playerIds.length; i < iMax; i++) {
        const playerId = playerIds[i];
        const player = gameState.players[i];
        clonedState.players[playerId] = {
            ingredients: [...player.ingredients],
            score: player.score,
        };
    }

    const actionIds = Object.keys(gameState.possibleActions);

    for (let i = 0, iMax = actionIds.length; i < iMax; i++) {
        const actionId = actionIds[i];
        const action = gameState.possibleActions[actionId];
        clonedState.possibleActions[actionId] = {
            id: action.id,
            type: action.type,
            deltas: [...action.deltas],
            price: action.price,
            tomeIndex: action.tomeIndex,
            taxCount: action.taxCount,
            castable: action.castable,
            repeatable: action.repeatable,
        };
    }

    return clonedState;
};

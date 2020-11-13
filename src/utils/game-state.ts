import { GameState, ActionType } from '../shared';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const readline: any;

const readNextLine = (): string => {
    return readline();
};

export const getPlayerIds = (gameState: GameState): string[] => {
    return Object.keys(gameState.players).sort();
};

export const getPossibleActionIds = (gameState: GameState): string[] => {
    return Object.keys(gameState.possibleActions);
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

export const cloneGameState = ({
    gameState,
    playerActionIdsToIgnore,
}: {
    gameState: GameState;
    playerActionIdsToIgnore?: string[];
}): GameState => {
    const clonedState: GameState = {
        players: {},
        possibleActions: {},
    };

    const playerIds = getPlayerIds(gameState);

    playerIds.forEach(playerId => {
        const player = gameState.players[playerId];
        clonedState.players[playerId] = {
            ingredients: [...player.ingredients],
            score: player.score,
        };
    });

    const actionIds = getPossibleActionIds(gameState);
    const playerActionIdsToIgnoreMap: { [index: string]: true } = {};

    (playerActionIdsToIgnore || []).forEach(playerActionId => {
        playerActionIdsToIgnoreMap[playerActionId] = true;
    });

    actionIds.forEach(actionId => {
        if (playerActionIdsToIgnoreMap[actionId] === true) {
            return;
        }
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
    });

    return clonedState;
};

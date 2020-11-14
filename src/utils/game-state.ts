import { PLAYER_ID_ME, PLAYER_ID_OPPONENT } from '../config';
import { GameState, ActionType, PlayerAction } from '../shared';

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

const createWaitAction = (): PlayerAction => {
    return {
        id: 999,
        type: ActionType.WAIT,
        deltas: [0, 0, 0, 0],
        price: 0,
        tomeIndex: 0,
        taxCount: 0,
        castable: false,
        repeatable: false,
    };
};

export const createInitialGameState = (): GameState => {
    const gameState: GameState = {
        numOfRounds: 0,
        players: {
            [PLAYER_ID_ME]: {
                numOfPotionsBrewed: 0,
                ingredients: [0, 0, 0, 0],
                score: 0,
            },
            [PLAYER_ID_OPPONENT]: {
                numOfPotionsBrewed: 0,
                ingredients: [0, 0, 0, 0],
                score: 0,
            },
        },
        possibleActions: {},
    };

    return gameState;
};

export const updateGameStateFromGameLoop = (oldGameState: GameState): GameState => {
    const newGameState: GameState = {
        numOfRounds: oldGameState.numOfRounds + 1,
        players: {},
        possibleActions: {},
    };

    const actionCount = parseInt(readNextLine());

    for (let i = 0; i < actionCount; i++) {
        const inputs = readNextLine().split(' ');
        const id = parseInt(inputs[0]);
        newGameState.possibleActions[id] = {
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

    const waitAction = createWaitAction();

    newGameState.possibleActions[waitAction.id] = waitAction;

    for (let i = 0; i < 2; i++) {
        const inputs = readNextLine().split(' ');

        newGameState.players[i] = {
            numOfPotionsBrewed: oldGameState.players[i].numOfPotionsBrewed,
            ingredients: [
                parseInt(inputs[0]),
                parseInt(inputs[1]),
                parseInt(inputs[2]),
                parseInt(inputs[3]),
            ],
            score: parseInt(inputs[4]),
        };
    }

    return newGameState;
};

/*
export const readGameStateFromGameLoopTick = (): GameState => {
    const gameState: GameState = {
        numOfRounds: 0,
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
            numOfPotionsBrewed: 0,
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
*/

export const cloneGameState = ({
    gameState,
    playerActionIdsToIgnore,
}: {
    gameState: GameState;
    playerActionIdsToIgnore?: string[];
}): GameState => {
    const clonedState: GameState = {
        numOfRounds: gameState.numOfRounds,
        players: {},
        possibleActions: {},
    };

    const playerIds = getPlayerIds(gameState);

    playerIds.forEach(playerId => {
        const player = gameState.players[playerId];
        clonedState.players[playerId] = {
            numOfPotionsBrewed: player.numOfPotionsBrewed,
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

import { PLAYER_ID_ME, PLAYER_ID_OPPONENT } from '../config';
import { GameState, ActionType, PlayerAction } from '../shared';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const readline: any;

const readNextLine = (): string => {
    return readline();
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
        roundId: 0,
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
        availableActions: {},
        cache: {
            playerIds: [PLAYER_ID_ME, PLAYER_ID_OPPONENT],
            avalableActionIds: [],
        },
    };

    return gameState;
};

export const updateGameStateFromGameLoop = (oldGameState: GameState): GameState => {
    const newGameState: GameState = {
        roundId: oldGameState.roundId,
        players: {},
        availableActions: {},
        cache: {
            playerIds: [PLAYER_ID_ME, PLAYER_ID_OPPONENT],
            avalableActionIds: [],
        },
    };

    const actionCount = parseInt(readNextLine());

    for (let i = 0; i < actionCount; i++) {
        const inputs = readNextLine().split(' ');
        const id = parseInt(inputs[0]);
        newGameState.availableActions[id] = {
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
        newGameState.cache.avalableActionIds.push(`${id}`);
    }

    const waitAction = createWaitAction();

    newGameState.availableActions[waitAction.id] = waitAction;
    newGameState.cache.avalableActionIds.push(`${waitAction.id}`);

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

export const cloneGameState = ({ gameState }: { gameState: GameState }): GameState => {
    const clonedState: GameState = {
        roundId: gameState.roundId,
        players: {},
        availableActions: {},
        cache: {
            playerIds: [...gameState.cache.playerIds],
            avalableActionIds: [...gameState.cache.avalableActionIds],
        },
    };

    gameState.cache.playerIds.forEach(playerId => {
        const player = gameState.players[playerId];
        clonedState.players[playerId] = {
            numOfPotionsBrewed: player.numOfPotionsBrewed,
            ingredients: [...player.ingredients],
            score: player.score,
        };
    });

    clonedState.availableActions = gameState.availableActions;

    return clonedState;
};

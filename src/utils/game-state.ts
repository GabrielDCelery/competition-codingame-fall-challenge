import config from '../game-config';
import { PLAYER_ID_ME, PLAYER_ID_OPPONENT } from '../game-config';
import { GameState, ActionType } from '../shared';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const readline: any;

const readNextLine = (): string => {
    return readline();
};

export const createInitialGameState = (): GameState => {
    const gameState: GameState = {
        roundId: 0,
        players: {
            [PLAYER_ID_ME]: {
                numOfPotionsBrewed: 0,
                ingredients: [0, 0, 0, 0],
                score: 0,
                learnedCastActionIds: [],
                availableCastActionIds: [],
            },
            [PLAYER_ID_OPPONENT]: {
                numOfPotionsBrewed: 0,
                ingredients: [0, 0, 0, 0],
                score: 0,
                learnedCastActionIds: [],
                availableCastActionIds: [],
            },
        },
        availableActionConfigs: {},
        availableBrewActionIds: [],
        availableDefaultActionIds: [],
    };

    return gameState;
};

export const updateGameStateFromGameLoop = (oldGameState: GameState): GameState => {
    const newGameState: GameState = {
        roundId: oldGameState.roundId,
        players: {
            [PLAYER_ID_ME]: {
                numOfPotionsBrewed: oldGameState.players[PLAYER_ID_ME].numOfPotionsBrewed,
                ingredients: [],
                score: 0,
                learnedCastActionIds: [],
                availableCastActionIds: [],
            },
            [PLAYER_ID_OPPONENT]: {
                numOfPotionsBrewed: oldGameState.players[PLAYER_ID_OPPONENT].numOfPotionsBrewed,
                ingredients: [],
                score: 0,
                learnedCastActionIds: [
                    ...oldGameState.players[PLAYER_ID_OPPONENT].learnedCastActionIds,
                ],
                availableCastActionIds: [],
            },
        },
        availableActionConfigs: {},
        availableBrewActionIds: [],
        availableDefaultActionIds: [],
    };

    const actionCount = parseInt(readNextLine());

    for (let i = 0; i < actionCount; i++) {
        const inputs = readNextLine().split(' ');
        const id = parseInt(inputs[0]);
        const availableActionConfig = {
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
        newGameState.availableActionConfigs[availableActionConfig.id] = availableActionConfig;

        if (availableActionConfig.type == ActionType.BREW) {
            newGameState.availableBrewActionIds.push(`${availableActionConfig.id}`);
            continue;
        }
        if (availableActionConfig.type == ActionType.CAST) {
            newGameState.players[PLAYER_ID_ME].learnedCastActionIds.push(
                `${availableActionConfig.id}`
            );
            if (availableActionConfig.castable) {
                newGameState.players[PLAYER_ID_ME].availableCastActionIds.push(
                    `${availableActionConfig.id}`
                );
            }
            continue;
        }
        if (availableActionConfig.type == ActionType.OPPONENT_CAST) {
            newGameState.players[PLAYER_ID_OPPONENT].learnedCastActionIds.push(
                `${availableActionConfig.id}`
            );
            if (availableActionConfig.castable) {
                newGameState.players[PLAYER_ID_OPPONENT].availableCastActionIds.push(
                    `${availableActionConfig.id}`
                );
            }
            continue;
        }
    }

    for (let i = 0; i < 2; i++) {
        const inputs = readNextLine().split(' ');

        newGameState.players[i].ingredients = [
            parseInt(inputs[0]),
            parseInt(inputs[1]),
            parseInt(inputs[2]),
            parseInt(inputs[3]),
        ];
        newGameState.players[i].score = parseInt(inputs[4]);
    }

    config.defaultActionConfigs.forEach(defaultActionConfig => {
        newGameState.availableActionConfigs[defaultActionConfig.id] = defaultActionConfig;
        newGameState.availableDefaultActionIds.push(`${defaultActionConfig.id}`);
    });

    return newGameState;
};

export const cloneGameState = ({ gameState }: { gameState: GameState }): GameState => {
    const clonedState: GameState = {
        roundId: gameState.roundId,
        players: {},
        availableActionConfigs: {},
        availableBrewActionIds: [],
        availableDefaultActionIds: [],
    };

    [PLAYER_ID_ME, PLAYER_ID_OPPONENT].forEach(playerId => {
        const player = gameState.players[playerId];
        clonedState.players[playerId] = {
            numOfPotionsBrewed: player.numOfPotionsBrewed,
            ingredients: [...player.ingredients],
            score: player.score,
            learnedCastActionIds: [...player.learnedCastActionIds],
            availableCastActionIds: [...player.availableCastActionIds],
        };
    });

    clonedState.availableActionConfigs = gameState.availableActionConfigs;
    clonedState.availableBrewActionIds = gameState.availableBrewActionIds;
    clonedState.availableDefaultActionIds = gameState.availableDefaultActionIds;

    return clonedState;
};

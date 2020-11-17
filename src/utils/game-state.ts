import config from '../game-config';
import { PLAYER_ID_ME, PLAYER_ID_OPPONENT } from '../game-config';
import { GameState, ActionType } from '../shared';
import apac from './available-player-action-configs';

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
                availableCastActionIdsMap: {},
            },
            [PLAYER_ID_OPPONENT]: {
                numOfPotionsBrewed: 0,
                ingredients: [0, 0, 0, 0],
                score: 0,
                learnedCastActionIds: [],
                availableCastActionIds: [],
                availableCastActionIdsMap: {},
            },
        },
        availableBrewActionIds: [],
        availableBrewActionIdsMap: {},
        availableDefaultActionIds: [],
        avaliableLearnActionIds: [],
        avaliableLearnActionIdsMap: {},
    };

    apac.reset();

    return gameState;
};

const getActionType = (gameInputActionType: string): ActionType => {
    switch (gameInputActionType) {
        case 'CAST': {
            return ActionType.CAST;
        }
        case 'OPPONENT_CAST': {
            return ActionType.OPPONENT_CAST;
        }
        case 'BREW': {
            return ActionType.BREW;
        }
        case 'LEARN': {
            return ActionType.LEARN;
        }
        case 'WAIT': {
            return ActionType.WAIT;
        }
        case 'REST': {
            return ActionType.REST;
        }
        default:
            throw new Error(`Invalid action type -> ${gameInputActionType}`);
    }
};

export const updateGameStateFromGameLoop = (oldGameState: GameState): GameState => {
    const newGameState: GameState = {
        roundId: oldGameState.roundId + 1,
        players: {
            [PLAYER_ID_ME]: {
                numOfPotionsBrewed: oldGameState.players[PLAYER_ID_ME].numOfPotionsBrewed,
                ingredients: [],
                score: 0,
                learnedCastActionIds: [],
                availableCastActionIds: [],
                availableCastActionIdsMap: {},
            },
            [PLAYER_ID_OPPONENT]: {
                numOfPotionsBrewed: oldGameState.players[PLAYER_ID_OPPONENT].numOfPotionsBrewed,
                ingredients: [],
                score: 0,
                learnedCastActionIds: [
                    ...oldGameState.players[PLAYER_ID_OPPONENT].learnedCastActionIds,
                ],
                availableCastActionIds: [],
                availableCastActionIdsMap: {},
            },
        },
        availableBrewActionIds: [],
        availableBrewActionIdsMap: {},
        availableDefaultActionIds: [],
        avaliableLearnActionIds: [],
        avaliableLearnActionIdsMap: {},
    };

    apac.reset();

    config.defaultActionConfigs.forEach(defaultActionConfig => {
        apac.addConfig(defaultActionConfig);
        newGameState.availableDefaultActionIds.push(defaultActionConfig.id);
    });

    const actionCount = parseInt(readNextLine());

    for (let i = 0; i < actionCount; i++) {
        const inputs = readNextLine().split(' ');
        const id = parseInt(inputs[0]);
        const type = getActionType(inputs[1]);
        const deltas = [
            parseInt(inputs[2]),
            parseInt(inputs[3]),
            parseInt(inputs[4]),
            parseInt(inputs[5]),
        ];
        const price = parseInt(inputs[6]);
        const tomeIndex = parseInt(inputs[7]);
        const taxCount = parseInt(inputs[8]);
        const castable = inputs[9] !== '0';
        const repeatable = inputs[10] !== '0';

        const availableActionConfig = {
            id,
            type,
            deltas,
            price,
            tomeIndex,
            taxCount,
            castable,
            repeatable,
        };

        apac.addConfig(availableActionConfig);

        if (type == ActionType.BREW) {
            newGameState.availableBrewActionIds.push(id);
            newGameState.availableBrewActionIdsMap[id] = true;
            continue;
        }
        if (type == ActionType.CAST) {
            newGameState.players[PLAYER_ID_ME].learnedCastActionIds.push(id);
            if (castable) {
                newGameState.players[PLAYER_ID_ME].availableCastActionIds.push(id);
                newGameState.players[PLAYER_ID_ME].availableCastActionIdsMap[id] = true;
            }
            continue;
        }
        if (type == ActionType.OPPONENT_CAST) {
            newGameState.players[PLAYER_ID_OPPONENT].learnedCastActionIds.push(id);
            if (castable) {
                newGameState.players[PLAYER_ID_OPPONENT].availableCastActionIds.push(id);
                newGameState.players[PLAYER_ID_OPPONENT].availableCastActionIdsMap[id] = true;
            }
            continue;
        }

        if (type == ActionType.LEARN) {
            newGameState.avaliableLearnActionIds.push(id);
            newGameState.avaliableLearnActionIdsMap[id] = true;
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
        const newScore = parseInt(inputs[4]);
        const didBrewPotionLastTurn = oldGameState.players[i].score < newScore;
        newGameState.players[i].numOfPotionsBrewed += didBrewPotionLastTurn ? 1 : 0;
        newGameState.players[i].score = newScore;
    }

    return newGameState;
};

export const cloneGameState = ({ gameState }: { gameState: GameState }): GameState => {
    const clonedState: GameState = {
        roundId: gameState.roundId,
        players: {},
        availableBrewActionIds: [],
        availableBrewActionIdsMap: {},
        availableDefaultActionIds: [],
        avaliableLearnActionIds: [],
        avaliableLearnActionIdsMap: {},
    };

    [PLAYER_ID_ME, PLAYER_ID_OPPONENT].forEach(playerId => {
        const player = gameState.players[playerId];
        clonedState.players[playerId] = {
            numOfPotionsBrewed: player.numOfPotionsBrewed,
            ingredients: [...player.ingredients],
            score: player.score,
            learnedCastActionIds: [...player.learnedCastActionIds],
            availableCastActionIds: [...player.availableCastActionIds],
            availableCastActionIdsMap: { ...player.availableCastActionIdsMap },
        };
    });

    clonedState.availableBrewActionIds = [...gameState.availableBrewActionIds];
    clonedState.availableBrewActionIdsMap = {
        ...gameState.availableBrewActionIdsMap,
    };
    clonedState.availableDefaultActionIds = [...gameState.availableDefaultActionIds];
    clonedState.avaliableLearnActionIds = [...gameState.avaliableLearnActionIds];
    clonedState.avaliableLearnActionIdsMap = { ...gameState.avaliableLearnActionIdsMap };

    return clonedState;
};

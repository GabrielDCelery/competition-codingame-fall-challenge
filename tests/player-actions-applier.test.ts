import { expect } from 'chai';
import { describe, it } from 'mocha';
import { PLAYER_ID_ME, PLAYER_ID_OPPONENT } from '../src/game-config';
import { ActionType, GameState } from '../src/shared';
import { applyPlayerActionToGameState } from '../src/utils';

describe('applyPlayerActionToGameState', () => {
    it('applies player action and creates new game state', () => {
        const gameState: GameState = {
            roundId: 0,
            players: {
                [PLAYER_ID_ME]: {
                    numOfPotionsBrewed: 0,
                    ingredients: [1, 1, 1, 1],
                    score: 0,
                    learnedCastActionIds: [],
                    availableCastActionIds: [],
                },
                [PLAYER_ID_OPPONENT]: {
                    numOfPotionsBrewed: 0,
                    ingredients: [1, 1, 1, 1],
                    score: 0,
                    learnedCastActionIds: [],
                    availableCastActionIds: [],
                },
            },
            availableActionConfigs: {
                '61': {
                    id: 61,
                    type: ActionType.BREW,
                    deltas: [0, -2, 0, 0],
                    price: 10,
                    tomeIndex: 0,
                    taxCount: 0,
                    castable: false,
                    repeatable: false,
                },
                '32': {
                    id: 32,
                    type: ActionType.BREW,
                    deltas: [0, 0, 0, -1],
                    price: 15,
                    tomeIndex: 0,
                    taxCount: 0,
                    castable: false,
                    repeatable: false,
                },
            },
            availableBrewActionIds: [32, 61],
            availableDefaultActionIds: [999],
        };
        const playerActionId = 32;
        const playerId = PLAYER_ID_ME;

        const newGameState = applyPlayerActionToGameState({
            gameState,
            playerActionId,
            playerId,
        });

        expect(newGameState).to.deep.equal({
            roundId: 0,
            players: {
                [PLAYER_ID_ME]: {
                    numOfPotionsBrewed: 1,
                    ingredients: [1, 1, 1, 0],
                    score: 15,
                    learnedCastActionIds: [],
                    availableCastActionIds: [],
                },
                [PLAYER_ID_OPPONENT]: {
                    numOfPotionsBrewed: 0,
                    ingredients: [1, 1, 1, 1],
                    score: 0,
                    learnedCastActionIds: [],
                    availableCastActionIds: [],
                },
            },
            availableActionConfigs: {
                '32': {
                    id: 32,
                    type: 'BREW',
                    deltas: [0, 0, 0, -1],
                    price: 15,
                    tomeIndex: 0,
                    taxCount: 0,
                    castable: false,
                    repeatable: false,
                },
                '61': {
                    id: 61,
                    type: 'BREW',
                    deltas: [0, -2, 0, 0],
                    price: 10,
                    tomeIndex: 0,
                    taxCount: 0,
                    castable: false,
                    repeatable: false,
                },
            },
            availableBrewActionIds: [61],
            availableDefaultActionIds: [999],
        });
    });

    it('removes applied player action', () => {
        const gameState: GameState = {
            roundId: 0,
            players: {
                [PLAYER_ID_ME]: {
                    numOfPotionsBrewed: 0,
                    ingredients: [1, 1, 1, 1],
                    score: 0,
                    learnedCastActionIds: [],
                    availableCastActionIds: [],
                },
                [PLAYER_ID_OPPONENT]: {
                    numOfPotionsBrewed: 0,
                    ingredients: [1, 1, 1, 1],
                    score: 0,
                    learnedCastActionIds: [],
                    availableCastActionIds: [],
                },
            },
            availableActionConfigs: {
                '61': {
                    id: 61,
                    type: ActionType.BREW,
                    deltas: [0, -2, 0, 0],
                    price: 10,
                    tomeIndex: 0,
                    taxCount: 0,
                    castable: false,
                    repeatable: false,
                },
                '32': {
                    id: 32,
                    type: ActionType.BREW,
                    deltas: [0, 0, 0, -1],
                    price: 15,
                    tomeIndex: 0,
                    taxCount: 0,
                    castable: false,
                    repeatable: false,
                },
            },
            availableBrewActionIds: [32, 61],
            availableDefaultActionIds: [999],
        };
        const playerActionId = 32;
        const playerId = PLAYER_ID_OPPONENT;

        const newGameState = applyPlayerActionToGameState({
            gameState,
            playerActionId,
            playerId,
        });

        expect(newGameState).to.deep.equal({
            roundId: 0,
            players: {
                '0': {
                    numOfPotionsBrewed: 0,
                    ingredients: [1, 1, 1, 1],
                    score: 0,
                    learnedCastActionIds: [],
                    availableCastActionIds: [],
                },
                '1': {
                    numOfPotionsBrewed: 1,
                    ingredients: [1, 1, 1, 0],
                    score: 15,
                    learnedCastActionIds: [],
                    availableCastActionIds: [],
                },
            },
            availableActionConfigs: {
                '32': {
                    id: 32,
                    type: 'BREW',
                    deltas: [0, 0, 0, -1],
                    price: 15,
                    tomeIndex: 0,
                    taxCount: 0,
                    castable: false,
                    repeatable: false,
                },
                '61': {
                    id: 61,
                    type: 'BREW',
                    deltas: [0, -2, 0, 0],
                    price: 10,
                    tomeIndex: 0,
                    taxCount: 0,
                    castable: false,
                    repeatable: false,
                },
            },
            availableBrewActionIds: [61],
            availableDefaultActionIds: [999],
        });
    });
});

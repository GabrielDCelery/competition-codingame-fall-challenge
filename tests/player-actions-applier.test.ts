import { expect } from 'chai';
import { describe, it } from 'mocha';
import { PLAYER_ID_ME, PLAYER_ID_OPPONENT } from '../src/config';
import { ActionType, GameState } from '../src/shared';
import { applyPlayerActionToGameState } from '../src/utils';

describe('applyPlayerActionToGameState', () => {
    it('applies player action and creates new game state', () => {
        const gameState: GameState = {
            numOfRounds: 0,
            players: {
                [PLAYER_ID_ME]: {
                    numOfPotionsBrewed: 0,
                    ingredients: [1, 1, 1, 1],
                    score: 0,
                },
                [PLAYER_ID_OPPONENT]: {
                    numOfPotionsBrewed: 0,
                    ingredients: [1, 1, 1, 1],
                    score: 0,
                },
            },
            possibleActions: {
                '61': {
                    id: 61,
                    type: ActionType.BREW,
                    deltas: [0, 2, 0, 0],
                    price: 10,
                    tomeIndex: 0,
                    taxCount: 0,
                    castable: false,
                    repeatable: false,
                },
                '32': {
                    id: 32,
                    type: ActionType.BREW,
                    deltas: [0, 0, 0, 1],
                    price: 15,
                    tomeIndex: 0,
                    taxCount: 0,
                    castable: false,
                    repeatable: false,
                },
            },
        };
        const playerActionId = '32';
        const playerId = '0';
        const removeTakenActionFromPool = false;

        const newGameState = applyPlayerActionToGameState({
            gameState,
            playerActionId,
            playerId,
            removeTakenActionFromPool,
        });

        expect(newGameState).to.deep.equal({
            numOfRounds: 0,
            players: {
                [PLAYER_ID_ME]: { numOfPotionsBrewed: 0, ingredients: [1, 1, 1, 0], score: 15 },
                [PLAYER_ID_OPPONENT]: {
                    numOfPotionsBrewed: 0,
                    ingredients: [1, 1, 1, 1],
                    score: 0,
                },
            },
            possibleActions: {
                '32': {
                    id: 32,
                    type: 'BREW',
                    deltas: [0, 0, 0, 1],
                    price: 15,
                    tomeIndex: 0,
                    taxCount: 0,
                    castable: false,
                    repeatable: false,
                },
                '61': {
                    id: 61,
                    type: 'BREW',
                    deltas: [0, 2, 0, 0],
                    price: 10,
                    tomeIndex: 0,
                    taxCount: 0,
                    castable: false,
                    repeatable: false,
                },
            },
        });
    });

    it('removes applied player action', () => {
        const gameState: GameState = {
            numOfRounds: 0,
            players: {
                [PLAYER_ID_ME]: {
                    numOfPotionsBrewed: 0,
                    ingredients: [1, 1, 1, 1],
                    score: 0,
                },
                [PLAYER_ID_OPPONENT]: {
                    numOfPotionsBrewed: 0,
                    ingredients: [1, 1, 1, 1],
                    score: 0,
                },
            },
            possibleActions: {
                '61': {
                    id: 61,
                    type: ActionType.BREW,
                    deltas: [0, 2, 0, 0],
                    price: 10,
                    tomeIndex: 0,
                    taxCount: 0,
                    castable: false,
                    repeatable: false,
                },
                '32': {
                    id: 32,
                    type: ActionType.BREW,
                    deltas: [0, 0, 0, 1],
                    price: 15,
                    tomeIndex: 0,
                    taxCount: 0,
                    castable: false,
                    repeatable: false,
                },
            },
        };
        const playerActionId = '32';
        const playerId = '1';
        const removeTakenActionFromPool = true;

        const newGameState = applyPlayerActionToGameState({
            gameState,
            playerActionId,
            playerId,
            removeTakenActionFromPool,
        });

        expect(newGameState).to.deep.equal({
            numOfRounds: 0,
            players: {
                [PLAYER_ID_ME]: { numOfPotionsBrewed: 0, ingredients: [1, 1, 1, 1], score: 0 },
                [PLAYER_ID_OPPONENT]: {
                    numOfPotionsBrewed: 0,
                    ingredients: [1, 1, 1, 0],
                    score: 15,
                },
            },
            possibleActions: {
                '61': {
                    id: 61,
                    type: 'BREW',
                    deltas: [0, 2, 0, 0],
                    price: 10,
                    tomeIndex: 0,
                    taxCount: 0,
                    castable: false,
                    repeatable: false,
                },
            },
        });
    });
});

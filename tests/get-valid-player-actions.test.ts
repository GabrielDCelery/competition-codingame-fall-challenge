import { expect } from 'chai';
import { describe, it } from 'mocha';
import { PLAYER_ID_ME, PLAYER_ID_OPPONENT } from '../src/config';
import { ActionType, GameState } from '../src/shared';
import { getValidPlayerActionIdPairsForTurn } from '../src/utils';

describe('getValidPlayerActionIdPairsForTurn', () => {
    it('gets valid player action pairs for turn', () => {
        const gameState: GameState = {
            roundId: 0,
            players: {
                [PLAYER_ID_ME]: {
                    numOfPotionsBrewed: 0,
                    ingredients: [1, 1, 1, 1],
                    score: 0,
                },
                [PLAYER_ID_OPPONENT]: {
                    numOfPotionsBrewed: 0,
                    ingredients: [1, 2, 1, 1],
                    score: 0,
                },
            },
            availableActions: {
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
                '999': {
                    id: 999,
                    type: ActionType.WAIT,
                    deltas: [0, 0, 0, 0],
                    price: 0,
                    tomeIndex: 0,
                    taxCount: 0,
                    castable: false,
                    repeatable: false,
                },
            },
            cache: {
                avalableActionIds: ['32', '61', '999'],
                playerIds: ['0', '1'],
            },
        };

        const playerActionPairs = getValidPlayerActionIdPairsForTurn({
            gameState,
        });

        expect(playerActionPairs).to.deep.equal([
            ['32', '32'],
            ['32', '61'],
            ['32', '999'],
            ['999', '32'],
            ['999', '61'],
            ['999', '999'],
        ]);
    });

    it('gets valid player action pairs for turn if action was already used', () => {
        const gameState: GameState = {
            roundId: 0,
            players: {
                [PLAYER_ID_ME]: {
                    numOfPotionsBrewed: 0,
                    ingredients: [1, 1, 1, 1],
                    score: 0,
                },
                [PLAYER_ID_OPPONENT]: {
                    numOfPotionsBrewed: 0,
                    ingredients: [1, 2, 1, 1],
                    score: 0,
                },
            },

            availableActions: {
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
                '999': {
                    id: 999,
                    type: ActionType.WAIT,
                    deltas: [0, 0, 0, 0],
                    price: 0,
                    tomeIndex: 0,
                    taxCount: 0,
                    castable: false,
                    repeatable: false,
                },
            },
            cache: {
                avalableActionIds: ['61', '999'],
                playerIds: ['0', '1'],
            },
        };

        const playerActionPairs = getValidPlayerActionIdPairsForTurn({
            gameState,
        });

        expect(playerActionPairs).to.deep.equal([
            ['999', '61'],
            ['999', '999'],
        ]);
    });
});

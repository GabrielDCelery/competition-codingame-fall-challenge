import { expect } from 'chai';
import { describe, it } from 'mocha';
import { PLAYER_ID_ME, PLAYER_ID_OPPONENT } from '../src/config';
import { ActionType, GameState } from '../src/shared';
import { getValidPlayerActionPairsForTurn } from '../src/utils';

describe('getValidPlayerActionPairsForTurn', () => {
    it('gets valid player action pairs for turn', () => {
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
                    ingredients: [1, 2, 1, 1],
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
        };

        const playerActionPairs = getValidPlayerActionPairsForTurn({
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
});

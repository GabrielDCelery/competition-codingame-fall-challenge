import { expect } from 'chai';
import { describe, it } from 'mocha';
import { choosePlayerActionId } from '../src/ai';
import { PLAYER_ID_ME, PLAYER_ID_OPPONENT } from '../src/config';
import { ActionType } from '../src/shared';

describe('AI', () => {
    it('calculates next move', () => {
        const nextPlayerActionId = choosePlayerActionId({
            gameState: {
                numOfRounds: 0,
                players: {
                    [PLAYER_ID_ME]: {
                        numOfPotionsBrewed: 0,
                        ingredients: [2, 2, 3, 3],
                        score: 0,
                    },
                    [PLAYER_ID_OPPONENT]: {
                        numOfPotionsBrewed: 0,
                        ingredients: [2, 2, 3, 3],
                        score: 0,
                    },
                },
                possibleActions: {
                    '11': {
                        id: 11,
                        type: ActionType.BREW,
                        deltas: [0, 1, 0, 1],
                        price: 12,
                        tomeIndex: 0,
                        taxCount: 0,
                        castable: false,
                        repeatable: false,
                    },
                    '22': {
                        id: 22,
                        type: ActionType.BREW,
                        deltas: [1, 1, 1, 1],
                        price: 12,
                        tomeIndex: 0,
                        taxCount: 0,
                        castable: false,
                        repeatable: false,
                    },
                    '33': {
                        id: 33,
                        type: ActionType.BREW,
                        deltas: [1, 0, 0, 0],
                        price: 9,
                        tomeIndex: 0,
                        taxCount: 0,
                        castable: false,
                        repeatable: false,
                    },
                    '44': {
                        id: 44,
                        type: ActionType.BREW,
                        deltas: [1, 0, 0, 2],
                        price: 16,
                        tomeIndex: 0,
                        taxCount: 0,
                        castable: false,
                        repeatable: false,
                    },
                    '55': {
                        id: 55,
                        type: ActionType.BREW,
                        deltas: [0, 0, 1, 0],
                        price: 12,
                        tomeIndex: 0,
                        taxCount: 0,
                        castable: false,
                        repeatable: false,
                    },
                },
            },
            playerId: PLAYER_ID_ME,
        });

        console.log(nextPlayerActionId);

        expect(true).to.deep.equal(true);
    });
});

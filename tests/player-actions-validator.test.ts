import { expect } from 'chai';
import { describe, it } from 'mocha';
import { PLAYER_ID_ME, PLAYER_ID_OPPONENT } from '../src/config';
import { ActionType } from '../src/shared';
import { getValidPlayerActionIds } from '../src/utils';

describe('getValidPlayerActions', () => {
    it('gets a list of valid player actions', () => {
        const validPlayerActionIds = getValidPlayerActionIds({
            playerId: '1',
            gameState: {
                roundId: 0,
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
                },
                cache: {
                    avalableActionIds: ['32', '61'],
                    playerIds: ['0', '1'],
                },
            },
        });
        expect(validPlayerActionIds).to.deep.equal(['32']);
    });
});

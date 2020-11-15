import { expect } from 'chai';
import { describe, it } from 'mocha';
import { ActionType, GameState } from '../src/shared';
import { cloneGameState } from '../src/utils';

describe('cloneGameState', () => {
    it('clones game state', () => {
        const toClone: GameState = {
            roundId: 1,
            players: {
                '0': {
                    numOfPotionsBrewed: 0,
                    ingredients: [5, 0, 0, 0],
                    score: 0,
                    learnedCastActionIds: ['78', '79'],
                    availableCastActionIds: ['79'],
                },
                '1': {
                    numOfPotionsBrewed: 0,
                    ingredients: [1, 3, 3, 3],
                    score: 0,
                    learnedCastActionIds: ['81', '82'],
                    availableCastActionIds: ['81'],
                },
            },
            availableActionConfigs: {
                '11': {
                    id: 11,
                    type: ActionType.BREW,
                    deltas: [0, -1, 0, -1],
                    price: 12,
                    tomeIndex: 0,
                    taxCount: 0,
                    castable: false,
                    repeatable: false,
                },
                '22': {
                    id: 22,
                    type: ActionType.BREW,
                    deltas: [-1, -1, -1, -1],
                    price: 12,
                    tomeIndex: 0,
                    taxCount: 0,
                    castable: false,
                    repeatable: false,
                },
                '33': {
                    id: 33,
                    type: ActionType.BREW,
                    deltas: [-1, 0, 0, 0],
                    price: 9,
                    tomeIndex: 0,
                    taxCount: 0,
                    castable: false,
                    repeatable: false,
                },
                '44': {
                    id: 44,
                    type: ActionType.BREW,
                    deltas: [-1, 0, 0, -2],
                    price: 16,
                    tomeIndex: 0,
                    taxCount: 0,
                    castable: false,
                    repeatable: false,
                },
                '55': {
                    id: 55,
                    type: ActionType.BREW,
                    deltas: [0, 0, -1, 0],
                    price: 12,
                    tomeIndex: 0,
                    taxCount: 0,
                    castable: false,
                    repeatable: false,
                },
                '78': {
                    id: 78,
                    type: ActionType.CAST,
                    deltas: [2, 0, 0, 0],
                    price: 0,
                    tomeIndex: -1,
                    taxCount: -1,
                    castable: true,
                    repeatable: false,
                },
                '79': {
                    id: 79,
                    type: ActionType.CAST,
                    deltas: [-1, 1, 0, 0],
                    price: 0,
                    tomeIndex: -1,
                    taxCount: -1,
                    castable: true,
                    repeatable: false,
                },
                '81': {
                    id: 81,
                    type: ActionType.CAST,
                    deltas: [2, 0, 0, 0],
                    price: 0,
                    tomeIndex: -1,
                    taxCount: -1,
                    castable: true,
                    repeatable: false,
                },
                '82': {
                    id: 82,
                    type: ActionType.CAST,
                    deltas: [-1, 1, 0, 0],
                    price: 0,
                    tomeIndex: -1,
                    taxCount: -1,
                    castable: true,
                    repeatable: false,
                },
                '888': {
                    id: 888,
                    type: ActionType.REST,
                    deltas: [0, 0, 0, 0],
                    price: 0,
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
            availableBrewActionIds: ['11', '22', '33', '44', '55'],
            availableDefaultActionIds: ['999', '888'],
        };

        const beforeCloning = JSON.parse(JSON.stringify(toClone));

        const cloned = cloneGameState({ gameState: toClone });

        expect(cloned).to.deep.equal(beforeCloning);
    });
});

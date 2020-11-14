import { ActionType } from './enums';

export interface PlayerState {
    numOfPotionsBrewed: number;
    ingredients: number[];
    score: number;
}

export interface PlayerAction {
    id: number;
    type: ActionType;
    deltas: number[];
    price: number;
    tomeIndex: number;
    taxCount: number;
    castable: boolean;
    repeatable: boolean;
}

export interface GameState {
    roundId: number;
    players: {
        [index: string]: PlayerState;
    };
    availableActions: {
        [index: string]: PlayerAction;
    };
    cache: {
        playerIds: string[];
        avalableActionIds: string[];
    };
}

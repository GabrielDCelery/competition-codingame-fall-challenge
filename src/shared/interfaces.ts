import { ActionType } from './enums';

export interface PlayerState {
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
    players: {
        [index: string]: PlayerState;
    };
    possibleActions: {
        [index: string]: PlayerAction;
    };
}

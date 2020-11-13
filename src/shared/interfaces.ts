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

export interface ValidPlayerAction {
    playerActionId: string;
    newGameState: GameState;
}

export interface GameState {
    players: {
        [index: string]: PlayerState;
    };
    possibleActions: {
        [index: string]: PlayerAction;
    };
}

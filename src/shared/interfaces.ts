import { ActionType } from './enums';

export interface PlayerState {
    numOfPotionsBrewed: number;
    ingredients: number[];
    score: number;
    learnedCastActionIds: number[];
    availableCastActionIds: number[];
}

export interface PlayerActionConfig {
    id: number;
    type: ActionType;
    deltas: number[];
    price: number;
    tomeIndex: number;
    taxCount: number;
    castable: boolean;
    repeatable: boolean;
}

export interface AvailablePlayerActionConfigs {
    [index: string]: PlayerActionConfig;
}

export interface GameState {
    roundId: number;
    players: {
        [index: string]: PlayerState;
    };
    availableBrewActionIds: number[];
    availableDefaultActionIds: number[];
    avaliableLearnActionIds: number[];
}

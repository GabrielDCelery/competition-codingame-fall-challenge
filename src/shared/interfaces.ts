import { ActionType } from './enums';

export interface PlayerState {
    numOfPotionsBrewed: number;
    ingredients: number[];
    score: number;
    action: {
        list: {
            cast: {
                learned: number[];
                available: number[];
                interestedIn: number[];
            };
        };
    };
    availableCastActionIdsMap: { [index: string]: boolean };
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
    availableBrewActionIdsMap: { [index: string]: boolean };
    availableDefaultActionIds: number[];
    avaliableLearnActionIds: number[];
    avaliableLearnActionIdsMap: { [index: string]: boolean };
}

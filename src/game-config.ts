import { ActionType, League, PlayerActionConfig } from './shared';

export const PLAYER_ID_ME = '0';
export const PLAYER_ID_OPPONENT = '1';
export const NUM_OF_GAME_ROUNDS = 100;
export const RESPONSE_TIME_IN_TURNS_MS = 50;
export const INGREDIENT_VALUES = [1, 2, 3, 4];

interface LeagueConfig {
    numOfPotionsToBrewToWin: number;
    maxInventorySize: number;
    monteCarlo: {
        numOfMaxIterations: number;
        cConst: number;
        maxRolloutSteps: number;
        unusedIngredientScoreWeights: number[];
    };
    defaultActionConfigs: PlayerActionConfig[];
}

const configs: { [index: string]: LeagueConfig } = {
    [League.Wood1]: {
        numOfPotionsToBrewToWin: 3,
        maxInventorySize: 10,
        monteCarlo: {
            numOfMaxIterations: 10000,
            cConst: 2,
            maxRolloutSteps: 3,
            unusedIngredientScoreWeights: [0.55, 0.6, 0.65, 0.7],
        },
        defaultActionConfigs: [
            /*
            {
                id: 999,
                type: ActionType.WAIT,
                deltas: [0, 0, 0, 0],
                price: 0,
                tomeIndex: 0,
                taxCount: 0,
                castable: false,
                repeatable: false,
            },
            */
            {
                id: 888,
                type: ActionType.REST,
                deltas: [0, 0, 0, 0],
                price: 0,
                tomeIndex: 0,
                taxCount: 0,
                castable: false,
                repeatable: false,
            },
        ],
    },
    [League.Bronze]: {
        numOfPotionsToBrewToWin: 6,
        maxInventorySize: 10,
        monteCarlo: {
            numOfMaxIterations: 10000,
            cConst: 2,
            maxRolloutSteps: 5,
            unusedIngredientScoreWeights: [0.55, 0.6, 0.65, 0.7],
        },
        defaultActionConfigs: [
            {
                id: 888,
                type: ActionType.REST,
                deltas: [0, 0, 0, 0],
                price: 0,
                tomeIndex: 0,
                taxCount: 0,
                castable: false,
                repeatable: false,
            },
        ],
    },
};

const configToExport = configs[League.Wood1];

export default configToExport;

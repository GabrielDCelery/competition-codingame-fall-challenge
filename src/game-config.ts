import { ActionType, League, PlayerActionConfig } from './shared';

export const PLAYER_ID_ME = '0';
export const PLAYER_ID_OPPONENT = '1';
export const NUM_OF_GAME_ROUNDS = 100;
export const RESPONSE_TIME_IN_TURNS_MS = 50;
export const INGREDIENT_VALUES = [1, 2, 3, 4];

interface AgentScoringStrategy {
    spellCastNegativeWeights: number[];
    unusedIngredientScoreWeights: number[];
}

interface LeagueConfig {
    numOfPotionsToBrewToWin: number;
    maxInventorySize: number;
    agentStrategy: {
        [index: string]: {
            scoring: AgentScoringStrategy;
        };
    };
    monteCarlo: {
        numOfMaxIterations: number;
        maxTimetoSpendInMs: number;
        cConst: number;
        maxRolloutSteps: number;
    };
    defaultActionConfigs: PlayerActionConfig[];
}

const configs: { [index: string]: LeagueConfig } = {
    [League.Wood1]: {
        numOfPotionsToBrewToWin: 3,
        maxInventorySize: 10,
        agentStrategy: {
            [PLAYER_ID_ME]: {
                scoring: {
                    spellCastNegativeWeights: [1.1, 1.2, 1.3, 1.4],
                    unusedIngredientScoreWeights: [0.55, 0.6, 0.65, 0.7],
                },
            },
            [PLAYER_ID_OPPONENT]: {
                scoring: {
                    spellCastNegativeWeights: [1.1, 1.2, 1.3, 1.4],
                    unusedIngredientScoreWeights: [0.55, 0.6, 0.65, 0.7],
                },
            },
        },
        monteCarlo: {
            numOfMaxIterations: 10000,
            maxTimetoSpendInMs: 20,
            cConst: 2,
            maxRolloutSteps: 4,
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
        agentStrategy: {
            [PLAYER_ID_ME]: {
                scoring: {
                    //  spellCastNegativeWeights: [1.1, 1.2, 1.3, 1.4],
                    spellCastNegativeWeights: [1.1, 1.1, 1.1, 1.1],
                    unusedIngredientScoreWeights: [0.2, 0.4, 0.4, 0.4],
                },
            },
            [PLAYER_ID_OPPONENT]: {
                scoring: {
                    //spellCastNegativeWeights: [1.1, 1.2, 1.3, 1.4],
                    spellCastNegativeWeights: [1.1, 1.1, 1.1, 1.1],
                    unusedIngredientScoreWeights: [0.55, 0.6, 0.65, 0.7],
                },
            },
        },
        monteCarlo: {
            numOfMaxIterations: 10000,
            maxTimetoSpendInMs: 42,
            cConst: 2,
            maxRolloutSteps: 4,
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

const configToExport = configs[League.Bronze];

export default configToExport;

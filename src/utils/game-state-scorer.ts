import gameConfig, { PLAYER_ID_ME, PLAYER_ID_OPPONENT, INGREDIENT_VALUES } from '../game-config';
import { GameState } from '../shared';
import apac from './available-player-action-configs';

const spellValue = (deltas: number[]): number => {
    let cost;
    let generated = deltas.forEach((delta, index) => {
        diffGenerated += delta * INGREDIENT_VALUES[index];
    });
    return 1;
};

const scoreLearnedSpells = ({
    initialState,
    currentState,
    playerId,
}: {
    initialState: GameState;
    currentState: GameState;
    playerId: string;
}): number => {
    if (
        currentState.players[playerId].learnedCastActionIds ===
        initialState.players[playerId].learnedCastActionIds
    ) {
        return 0;
    }

    return totalScore;
};

const getPotionIngredientDistribution = ({
    gameState,
}: {
    gameState: GameState;
}): { ingredients: number[]; total: number } => {
    let total = 0;
    const ingredients = [0, 0, 0, 0];

    gameState.availableBrewActionIds.forEach(actionId => {
        apac.state[actionId].deltas.forEach((delta, index) => {
            total += delta;
            ingredients[index] += delta;
        });
    });

    return { ingredients, total };
};

const scoreUnusedIngredients = ({
    gameState,
    playerId,
}: {
    gameState: GameState;
    playerId: string;
}): number => {
    const ingredients = gameState.players[playerId].ingredients;
    const weights = gameConfig.monteCarlo.unusedIngredientScoreWeights;

    const totalScore =
        ingredients[0] * INGREDIENT_VALUES[0] * weights[0] +
        ingredients[1] * INGREDIENT_VALUES[1] * weights[1] +
        ingredients[2] * INGREDIENT_VALUES[2] * weights[2] +
        ingredients[3] * INGREDIENT_VALUES[3] * weights[3];

    return totalScore;
};

export const scoreGameState = ({
    isTerminalState,
    // initialState,
    currentState,
}: {
    isTerminalState?: boolean;
    initialState: GameState;
    currentState: GameState;
}): number[] => {
    const playerIds = [PLAYER_ID_ME, PLAYER_ID_OPPONENT];
    const brewScores = playerIds.map(playerId => currentState.players[playerId].score);

    if (isTerminalState) {
        if (brewScores[0] === brewScores[1]) {
            return [0.5, 0.5];
        }

        if (brewScores[0] > brewScores[1]) {
            return [1, 0];
        }

        return [0, 1];
    }

    const ingredientScores = playerIds.map(playerId => {
        return scoreUnusedIngredients({ gameState: currentState, playerId });
    });

    const playerScores = [brewScores[0] + ingredientScores[0], brewScores[1] + ingredientScores[1]];
    const totalScore = playerScores[0] + playerScores[1];
    return [playerScores[0] / totalScore, playerScores[1] / totalScore];
};

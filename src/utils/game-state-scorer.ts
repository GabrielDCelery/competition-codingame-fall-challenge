import gameConfig, { PLAYER_ID_ME, PLAYER_ID_OPPONENT, INGREDIENT_VALUES } from '../game-config';
import { GameState, PlayerActionConfig } from '../shared';
import apac from './available-player-action-configs';

const getSpellValue = (learnAction: PlayerActionConfig): number => {
    let totalValueGenerated = 0;

    learnAction.deltas.forEach((delta, index) => {
        if (delta === 0) {
            return;
        }

        let valueGenerated = delta * INGREDIENT_VALUES[index];

        if (valueGenerated < 0) {
            valueGenerated =
                valueGenerated *
                gameConfig.monteCarlo.scoringStrategy.spellCastNegativeWeights[index];
        }

        totalValueGenerated += valueGenerated;
    });

    totalValueGenerated =
        totalValueGenerated - learnAction.tomeIndex * 0.2 + learnAction.taxCount * 0.55;
    return totalValueGenerated < 0 ? 0 : totalValueGenerated;
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
        currentState.players[playerId].learnedCastActionIds.length ===
        initialState.players[playerId].learnedCastActionIds.length
    ) {
        return 0;
    }

    const spellScores = currentState.players[playerId].newlyLearnedSpellIds.map(
        newLearnedSpellId => {
            return getSpellValue(apac.state[newLearnedSpellId]);
        }
    );

    return spellScores.reduce((a, b) => a + b, 0);
};

/*
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
*/

const scoreUnusedIngredients = ({
    gameState,
    playerId,
}: {
    gameState: GameState;
    playerId: string;
}): number => {
    const ingredients = gameState.players[playerId].ingredients;
    const weights = gameConfig.monteCarlo.scoringStrategy.unusedIngredientScoreWeights;

    const totalScore =
        ingredients[0] * INGREDIENT_VALUES[0] * weights[0] +
        ingredients[1] * INGREDIENT_VALUES[1] * weights[1] +
        ingredients[2] * INGREDIENT_VALUES[2] * weights[2] +
        ingredients[3] * INGREDIENT_VALUES[3] * weights[3];

    return totalScore;
};

export const scoreGameState = ({
    isTerminalState,
    initialState,
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

    const spellScores = playerIds.map(playerId => {
        return scoreLearnedSpells({ initialState, currentState, playerId });
    });

    const playerScores = [
        brewScores[0] + ingredientScores[0] + spellScores[0],
        brewScores[1] + ingredientScores[1] + spellScores[1],
    ];
    const totalScore = playerScores[0] + playerScores[1];
    return [playerScores[0] / totalScore, playerScores[1] / totalScore];
};

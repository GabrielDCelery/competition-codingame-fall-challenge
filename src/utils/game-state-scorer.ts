import gameConfig, { PLAYER_ID_ME, PLAYER_ID_OPPONENT, INGREDIENT_VALUES } from '../game-config';
import { GameState } from '../shared';
import apac from './available-player-action-configs';

const getAverageProductionPerTurn = ({
    currentState,
    playerId,
}: {
    initialState: GameState;
    currentState: GameState;
    playerId: string;
}): number => {
    let totalProduction = 0;
    const learnedCastActionIds = currentState.players[playerId].action.list.cast.learned;
    const weights = gameConfig.agentStrategy[playerId].scoring.unusedIngredientScoreWeights;

    learnedCastActionIds.forEach(castId => {
        apac.state[castId].deltas.forEach((delta, index) => {
            totalProduction += delta * INGREDIENT_VALUES[index] * weights[index];
        });
    });

    return totalProduction / learnedCastActionIds.length;
};

const scoreUnusedIngredientsForPlayer = ({
    gameState,
    playerId,
}: {
    gameState: GameState;
    playerId: string;
}): number => {
    const ingredients = gameState.players[playerId].ingredients;
    const weights = gameConfig.agentStrategy[playerId].scoring.unusedIngredientScoreWeights;

    return (
        ingredients[0] * INGREDIENT_VALUES[0] * weights[0] +
        ingredients[1] * INGREDIENT_VALUES[1] * weights[1] +
        ingredients[2] * INGREDIENT_VALUES[2] * weights[2] +
        ingredients[3] * INGREDIENT_VALUES[3] * weights[3]
    );
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
        return scoreUnusedIngredientsForPlayer({ gameState: currentState, playerId });
    });
    const averageProductionsPerTurn = playerIds.map(playerId => {
        return getAverageProductionPerTurn({
            initialState,
            currentState,
            playerId,
        });
    });

    const numOfExpectedTurnsToFinish = Math.min(
        ...playerIds.map((playerId, index) => {
            const ingredientScore = ingredientScores[index];
            const averageProductionPerTurn = averageProductionsPerTurn[index];
            const potionsLeftToBrew =
                gameConfig.numOfPotionsToBrewToWin -
                currentState.players[playerId].numOfPotionsBrewed;

            let scoreLeftToCollect = potionsLeftToBrew * 17 - ingredientScore;
            scoreLeftToCollect = scoreLeftToCollect < 0 ? 0 : scoreLeftToCollect;
            return scoreLeftToCollect / averageProductionPerTurn;
        })
    );

    const expectedScores = playerIds.map((playerId, index) => {
        return (
            brewScores[index] +
            ingredientScores[index] +
            averageProductionsPerTurn[index] * numOfExpectedTurnsToFinish
        );
    });

    const totalScore = expectedScores[0] + expectedScores[1];
    return [expectedScores[0] / totalScore, expectedScores[1] / totalScore];
};

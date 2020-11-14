import { ActionType, GameState, PlayerAction } from '../shared';
import { cloneGameState } from './game-state';

const applyBrewPlayerActionToGameState = ({
    gameState,
    playerAction,
    playerId,
    removeTakenActionFromPool,
}: {
    gameState: GameState;
    playerAction: PlayerAction;
    playerId: string;
    removeTakenActionFromPool: boolean;
}): GameState => {
    const newIngredients: number[] = playerAction.deltas.map((delta, index) => {
        return gameState.players[playerId].ingredients[index] - delta;
    });
    const newGameState = removeTakenActionFromPool
        ? cloneGameState({ gameState, playerActionIdsToIgnore: [`${playerAction.id}`] })
        : cloneGameState({ gameState });
    newGameState.players[playerId].ingredients = newIngredients;
    newGameState.players[playerId].score += playerAction.price;
    return newGameState;
};

const applyWaitPlayerActionToGameState = ({
    gameState,
}: {
    gameState: GameState;
    playerAction: PlayerAction;
    playerId: string;
    removeTakenActionFromPool: boolean;
}): GameState => {
    return gameState;
};

export const applyPlayerActionToGameState = ({
    gameState,
    playerActionId,
    playerId,
    removeTakenActionFromPool,
}: {
    gameState: GameState;
    playerActionId: string;
    playerId: string;
    removeTakenActionFromPool: boolean;
}): GameState => {
    const playerAction = gameState.possibleActions[playerActionId];
    if (!playerAction) {
        throw new Error(`Not valid action id -> ${playerActionId}`);
    }
    const { type } = playerAction;
    switch (type) {
        case ActionType.BREW: {
            return applyBrewPlayerActionToGameState({
                gameState,
                playerAction,
                playerId,
                removeTakenActionFromPool,
            });
        }
        case ActionType.WAIT: {
            return applyWaitPlayerActionToGameState({
                gameState,
                playerAction,
                playerId,
                removeTakenActionFromPool,
            });
        }
        default:
            throw new Error(`Invalid action type -> ${type}`);
    }
};

export const applyPlayerActionIdPairToGameState = 
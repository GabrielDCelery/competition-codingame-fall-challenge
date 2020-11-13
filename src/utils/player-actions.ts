import { ActionType, GameState, PlayerAction, ValidPlayerAction } from '../shared';
import { cloneGameState, getPossibleActionIds } from './game-state';

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
}): GameState | null => {
    const newIngredients: number[] = [];
    for (let i = 0, iMax = playerAction.deltas.length; i < iMax; i++) {
        const newIngredient = gameState.players[playerId].ingredients[i] - playerAction.deltas[i];
        if (newIngredient < 0) {
            return null;
        }
        newIngredients.push(newIngredient);
    }
    const newGameState = removeTakenActionFromPool
        ? cloneGameState({ gameState, playerActionIdsToIgnore: [`${playerAction.id}`] })
        : cloneGameState({ gameState });
    newGameState.players[playerId].ingredients = newIngredients;
    newGameState.players[playerId].score += playerAction.price;
    return newGameState;
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
}): GameState | null => {
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
        default:
            throw new Error(`Invalid action type -> ${type}`);
    }
};

export const getValidPlayerActions = ({
    gameState,
    playerId,
    removeTakenActionFromPool,
}: {
    gameState: GameState;
    playerId: string;
    removeTakenActionFromPool: boolean;
}): ValidPlayerAction[] => {
    const possibleActionIds = getPossibleActionIds(gameState);
    const validPlayerActions: ValidPlayerAction[] = [];
    possibleActionIds.forEach(playerActionId => {
        const newGameState = applyPlayerActionToGameState({
            gameState,
            playerActionId,
            playerId,
            removeTakenActionFromPool,
        });
        if (!newGameState) {
            return;
        }
        validPlayerActions.push({
            playerActionId,
            newGameState,
        });
    });
    return validPlayerActions;
};

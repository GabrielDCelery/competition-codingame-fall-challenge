import { ActionType, GameState, PlayerAction } from '../shared';
import { cloneGameState } from './game-state';

const applyBrewPlayerActionToGameState = ({
    gameState,
    playerAction,
    playerId,
}: {
    gameState: GameState;
    playerAction: PlayerAction;
    playerId: string;
}): GameState => {
    const newGameState = cloneGameState({ gameState });
    newGameState.players[playerId].numOfPotionsBrewed += 1;
    const newPlayerIngredients = playerAction.deltas.map((delta, index) => {
        return gameState.players[playerId].ingredients[index] - delta;
    });
    newGameState.players[playerId].ingredients = newPlayerIngredients;
    newGameState.players[playerId].score += playerAction.price;
    newGameState.cache.avalableActionIds = newGameState.cache.avalableActionIds.filter(item => {
        return item !== `${playerAction.id}`;
    });
    return newGameState;
};

const applyWaitPlayerActionToGameState = ({
    gameState,
}: {
    gameState: GameState;
    playerAction: PlayerAction;
    playerId: string;
}): GameState => {
    return cloneGameState({ gameState });
};

export const applyPlayerActionToGameState = ({
    gameState,
    playerActionId,
    playerId,
}: {
    gameState: GameState;
    playerActionId: string;
    playerId: string;
}): GameState => {
    const playerAction = gameState.availableActions[playerActionId];
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
            });
        }
        case ActionType.WAIT: {
            return applyWaitPlayerActionToGameState({
                gameState,
                playerAction,
                playerId,
            });
        }
        default:
            return applyWaitPlayerActionToGameState({
                gameState,
                playerAction,
                playerId,
            });
    }
};

export const applyPlayerActionIdsToGameState = ({
    gameState,
    playerActionIds,
}: {
    gameState: GameState;
    playerActionIds: string[];
}): GameState => {
    let newGameState = cloneGameState({ gameState });

    playerActionIds.forEach((playerActionId, index) => {
        newGameState = applyPlayerActionToGameState({
            gameState: newGameState,
            playerActionId,
            playerId: gameState.cache.playerIds[index],
        });
    });

    newGameState.roundId += 1;

    return newGameState;
};

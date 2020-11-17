import config, { PLAYER_ID_ME, PLAYER_ID_OPPONENT } from '../game-config';
import { ActionType, GameState, PlayerActionConfig } from '../shared';
import apac from './available-player-action-configs';

const isBrewPlayerActionValid = ({
    gameState,
    playerAction,
    playerId,
}: {
    gameState: GameState;
    playerAction: PlayerActionConfig;
    playerId: string;
}): boolean => {
    if (gameState.availableBrewActionIdsMap[playerAction.id] !== true) {
        return false;
    }
    for (let i = 0, iMax = playerAction.deltas.length; i < iMax; i++) {
        if (gameState.players[playerId].ingredients[i] + playerAction.deltas[i] < 0) {
            return false;
        }
    }
    return true;
};

const isRestPlayerActionValid = ({
    gameState,
    playerId,
}: {
    gameState: GameState;
    playerAction: PlayerActionConfig;
    playerId: string;
}): boolean => {
    return (
        gameState.players[playerId].availableCastActionIds.length !==
        gameState.players[playerId].learnedCastActionIds.length
    );
};

const isCastPlayerActionValid = ({
    gameState,
    playerAction,
    playerId,
}: {
    gameState: GameState;
    playerAction: PlayerActionConfig;
    playerId: string;
}): boolean => {
    if (gameState.players[playerId].availableCastActionIdsMap[playerAction.id] !== true) {
        return false;
    }

    let inventorySizeAfterCast = 0;

    for (let i = 0, iMax = playerAction.deltas.length; i < iMax; i++) {
        const newIngredient = gameState.players[playerId].ingredients[i] + playerAction.deltas[i];
        if (newIngredient < 0) {
            return false;
        }
        inventorySizeAfterCast += newIngredient;
    }

    if (config.maxInventorySize < inventorySizeAfterCast) {
        return false;
    }

    return true;
};

const isLearnPlayerActionValid = ({
    gameState,
    playerAction,
    playerId,
}: {
    gameState: GameState;
    playerAction: PlayerActionConfig;
    playerId: string;
}): boolean => {
    if (gameState.avaliableLearnActionIdsMap[playerAction.id] !== true) {
        return false;
    }
    return playerAction.tomeIndex <= gameState.players[playerId].ingredients[0];
};

const isPlayerActionValid = ({
    gameState,
    playerActionId,
    playerId,
}: {
    gameState: GameState;
    playerActionId: number;
    playerId: string;
}): boolean => {
    const playerAction = apac.state[playerActionId];
    switch (playerAction.type) {
        case ActionType.CAST: {
            return isCastPlayerActionValid({
                gameState,
                playerAction,
                playerId,
            });
        }
        case ActionType.OPPONENT_CAST: {
            return isCastPlayerActionValid({
                gameState,
                playerAction,
                playerId,
            });
        }
        case ActionType.LEARN: {
            return isLearnPlayerActionValid({
                gameState,
                playerAction,
                playerId,
            });
        }
        case ActionType.REST: {
            return isRestPlayerActionValid({
                gameState,
                playerAction,
                playerId,
            });
        }
        case ActionType.BREW: {
            return isBrewPlayerActionValid({
                gameState,
                playerAction,
                playerId,
            });
        }
        /*
        case ActionType.WAIT: {
            return true;
        }
        */
        default:
            throw new Error(`Invalid action type -> ${playerAction.type}`);
    }
};

const getValidActionsForPlayer = ({
    gameState,
    playerId,
    allowedActions,
}: {
    gameState: GameState;
    playerId: string;
    allowedActions: ActionType[];
}): number[] => {
    const validActionIds: number[] = [
        ...(allowedActions.includes(ActionType.BREW) ? gameState.availableBrewActionIds : []),
        ...(allowedActions.includes(ActionType.LEARN) ? gameState.avaliableLearnActionIds : []),
        ...(allowedActions.includes(ActionType.CAST)
            ? gameState.players[playerId].availableCastActionIds
            : []),
        ...gameState.availableDefaultActionIds,
    ].filter(playerActionId => {
        return isPlayerActionValid({
            gameState,
            playerActionId,
            playerId,
        });
    });

    return validActionIds.length === 0 ? gameState.availableDefaultActionIds : validActionIds;
};

export const getValidPlayerActionIdPairsForTurn = ({
    gameState,
    allowedActions,
}: {
    gameState: GameState;
    allowedActions: ActionType[];
}): number[][] => {
    const validPlayerActionPairsForTurn: number[][] = [];

    getValidActionsForPlayer({ playerId: PLAYER_ID_ME, gameState, allowedActions }).forEach(
        availableActionIdFirstPlayer => {
            getValidActionsForPlayer({
                playerId: PLAYER_ID_OPPONENT,
                gameState,
                allowedActions,
            }).forEach(availableActionIdSecondPlayer => {
                validPlayerActionPairsForTurn.push([
                    availableActionIdFirstPlayer,
                    availableActionIdSecondPlayer,
                ]);
            });
        }
    );

    return validPlayerActionPairsForTurn;
};

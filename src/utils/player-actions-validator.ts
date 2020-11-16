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
    if (!playerAction) {
        throw new Error(`isPlayerActionValid - Not valid action id -> ${playerActionId}`);
    }
    const { type } = playerAction;
    switch (type) {
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
            throw new Error(`Invalid action type -> ${type}`);
    }
};

const getValidActionsForPlayer = ({
    gameState,
    playerId,
}: {
    gameState: GameState;
    playerId: string;
}): number[] => {
    const validActionIds: number[] = [
        ...gameState.availableBrewActionIds,
        ...gameState.players[playerId].availableCastActionIds,
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
}: {
    gameState: GameState;
}): number[][] => {
    const validPlayerActionPairsForTurn: number[][] = [];

    getValidActionsForPlayer({ playerId: PLAYER_ID_ME, gameState }).forEach(
        availableActionIdFirstPlayer => {
            getValidActionsForPlayer({ playerId: PLAYER_ID_OPPONENT, gameState }).forEach(
                availableActionIdSecondPlayer => {
                    validPlayerActionPairsForTurn.push([
                        availableActionIdFirstPlayer,
                        availableActionIdSecondPlayer,
                    ]);
                }
            );
        }
    );

    return validPlayerActionPairsForTurn;
};

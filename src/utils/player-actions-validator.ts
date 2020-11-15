import config, { PLAYER_ID_ME, PLAYER_ID_OPPONENT } from '../game-config';
import { ActionType, GameState, PlayerActionConfig } from '../shared';

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
        const newIngredient = gameState.players[playerId].ingredients[i] + playerAction.deltas[i];
        if (newIngredient < 0) {
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
    const player = gameState.players[playerId];
    const canCast = player.availableCastActionIds.includes(`${playerAction.id}`);

    if (!canCast) {
        return false;
    }

    const newIngredients: number[] = [];

    for (let i = 0, iMax = playerAction.deltas.length; i < iMax; i++) {
        const newIngredient = gameState.players[playerId].ingredients[i] + playerAction.deltas[i];
        if (newIngredient < 0) {
            return false;
        }
        newIngredients.push(newIngredient);
    }

    const doesExceedInventory = config.maxInventorySize < newIngredients.reduce((a, b) => a + b, 0);

    if (doesExceedInventory) {
        return false;
    }

    return true;
};

const isPlayerActionValid = ({
    gameState,
    playerActionId,
    playerId,
}: {
    gameState: GameState;
    playerActionId: string;
    playerId: string;
}): boolean => {
    const playerAction = gameState.availableActionConfigs[playerActionId];
    if (!playerAction) {
        throw new Error(`Not valid action id -> ${playerActionId}`);
    }
    const { type } = playerAction;
    switch (type) {
        case ActionType.BREW: {
            return isBrewPlayerActionValid({
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
        case ActionType.WAIT: {
            return true;
        }
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
}): string[] => {
    const validBrewActions = gameState.availableBrewActionIds.filter(playerActionId => {
        return isPlayerActionValid({
            gameState,
            playerActionId,
            playerId,
        });
    });

    const validCastActions = gameState.players[playerId].availableCastActionIds.filter(
        playerActionId => {
            return isPlayerActionValid({
                gameState,
                playerActionId,
                playerId,
            });
        }
    );

    const validDefaultActions = gameState.availableDefaultActionIds.filter(playerActionId => {
        return isPlayerActionValid({
            gameState,
            playerActionId,
            playerId,
        });
    });

    return [...validBrewActions, ...validCastActions, ...validDefaultActions];
};

export const getValidPlayerActionIdPairsForTurn = ({
    gameState,
}: {
    gameState: GameState;
}): string[][] => {
    const validPlayerActionPairsForTurn: string[][] = [];

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

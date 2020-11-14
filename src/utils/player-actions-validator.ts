import { ActionType, GameState, PlayerAction } from '../shared';

const isBrewPlayerActionValid = ({
    gameState,
    playerAction,
    playerId,
}: {
    gameState: GameState;
    playerAction: PlayerAction;
    playerId: string;
}): boolean => {
    for (let i = 0, iMax = playerAction.deltas.length; i < iMax; i++) {
        const newIngredient = gameState.players[playerId].ingredients[i] - playerAction.deltas[i];
        if (newIngredient < 0) {
            return false;
        }
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
    const playerAction = gameState.availableActions[playerActionId];
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
        case ActionType.WAIT: {
            return true;
        }
        default:
            throw new Error(`Invalid action type -> ${type}`);
    }
};

export const getValidPlayerActionIds = ({
    gameState,
    playerId,
}: {
    gameState: GameState;
    playerId: string;
}): string[] => {
    const availableActionIds = gameState.cache.avalableActionIds;
    const validPlayerActions: string[] = [];
    availableActionIds.forEach(playerActionId => {
        if (!isPlayerActionValid({ gameState, playerId, playerActionId })) {
            return;
        }
        validPlayerActions.push(playerActionId);
    });
    return validPlayerActions;
};

export const getValidPlayerActionIdPairsForTurn = ({
    gameState,
}: {
    gameState: GameState;
}): string[][] => {
    const playerIds = gameState.cache.playerIds;
    const availableActionIds = gameState.cache.avalableActionIds;
    const validPlayerActionPairsForTurn: string[][] = [];

    availableActionIds.forEach(availableActionIdFirstPlayer => {
        const canFirstPlayerExecute = isPlayerActionValid({
            gameState,
            playerActionId: availableActionIdFirstPlayer,
            playerId: playerIds[0],
        });

        if (!canFirstPlayerExecute) {
            return;
        }

        availableActionIds.forEach(availableActionIdSecondPlayer => {
            const canSecondPlayerExecute = isPlayerActionValid({
                gameState,
                playerActionId: availableActionIdSecondPlayer,
                playerId: playerIds[1],
            });

            if (!canSecondPlayerExecute) {
                return;
            }

            validPlayerActionPairsForTurn.push([
                availableActionIdFirstPlayer,
                availableActionIdSecondPlayer,
            ]);
        });
    });

    return validPlayerActionPairsForTurn;
};

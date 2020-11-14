import { ActionType, GameState, PlayerAction } from '../shared';
import { getPlayerIds, getPossibleActionIds } from './game-state';

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
    const playerAction = gameState.possibleActions[playerActionId];
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
    const possibleActionIds = getPossibleActionIds(gameState);
    const validPlayerActions: string[] = [];
    possibleActionIds.forEach(playerActionId => {
        if (!isPlayerActionValid({ gameState, playerId, playerActionId })) {
            return;
        }
        validPlayerActions.push(playerActionId);
    });
    return validPlayerActions;
};

export const getValidPlayerActionPairsForTurn = ({
    gameState,
}: {
    gameState: GameState;
}): string[][] => {
    const playerIds = getPlayerIds(gameState);
    const possibleActionIds = getPossibleActionIds(gameState);
    const validPlayerActionPairsForTurn: string[][] = [];

    possibleActionIds.forEach(playerActionIdFirstPlayer => {
        const canFirstPlayerExecute = isPlayerActionValid({
            gameState,
            playerActionId: playerActionIdFirstPlayer,
            playerId: playerIds[0],
        });

        if (!canFirstPlayerExecute) {
            return;
        }

        possibleActionIds.forEach(playerActionIdSecondPlayer => {
            const canSecondPlayerExecute = isPlayerActionValid({
                gameState,
                playerActionId: playerActionIdSecondPlayer,
                playerId: playerIds[1],
            });

            if (!canSecondPlayerExecute) {
                return;
            }

            validPlayerActionPairsForTurn.push([
                playerActionIdFirstPlayer,
                playerActionIdSecondPlayer,
            ]);
        });
    });

    return validPlayerActionPairsForTurn;
};

import { PLAYER_ID_ME, PLAYER_ID_OPPONENT } from '../game-config';
import { ActionType, GameState, PlayerActionConfig } from '../shared';
import apac from './available-player-action-configs';

const applyBrewPlayerActionToGameState = ({
    gameState,
    playerAction,
    playerId,
}: {
    gameState: GameState;
    playerAction: PlayerActionConfig;
    playerId: string;
}): void => {
    gameState.players[playerId].ingredients = playerAction.deltas.map((delta, index) => {
        return gameState.players[playerId].ingredients[index] + delta;
    });
    gameState.players[playerId].numOfPotionsBrewed += 1;
    gameState.players[playerId].score += playerAction.price;
    gameState.availableBrewActionIdsMap[playerAction.id] = false;
};

const applyRestPlayerActionToGameState = ({
    gameState,
    // playerAction,
    playerId,
}: {
    gameState: GameState;
    playerAction: PlayerActionConfig;
    playerId: string;
}): void => {
    gameState.players[playerId].action.list.cast.available = [
        ...gameState.players[playerId].action.list.cast.learned,
    ];
};

const applyLearnPlayerActionToGameState = ({
    gameState,
    playerAction,
    playerId,
}: {
    gameState: GameState;
    playerAction: PlayerActionConfig;
    playerId: string;
}): void => {
    gameState.players[playerId].ingredients[0] -= playerAction.tomeIndex;
    gameState.players[playerId].action.list.cast.learned = [
        ...gameState.players[playerId].action.list.cast.learned,
        playerAction.id,
    ];
    gameState.players[playerId].action.list.cast.available = [
        ...gameState.players[playerId].action.list.cast.available,
        playerAction.id,
    ];
    gameState.avaliableLearnActionIdsMap[playerAction.id] = false;
    gameState.players[playerId].availableCastActionIdsMap[playerAction.id] = true;
};

const applyCastPlayerActionToGameState = ({
    gameState,
    playerAction,
    playerId,
}: {
    gameState: GameState;
    playerAction: PlayerActionConfig;
    playerId: string;
}): void => {
    gameState.players[playerId].ingredients = playerAction.deltas.map((delta, index) => {
        return gameState.players[playerId].ingredients[index] + delta;
    });
    gameState.players[playerId].availableCastActionIdsMap[playerAction.id] = false;
};
/*
const applyWaitPlayerActionToGameState = ({}: {
    gameState: GameState;
    playerAction: PlayerActionConfig;
    playerId: string;
}): void => {
    return;
};
*/
export const applyPlayerActionToGameState = ({
    gameState,
    playerActionId,
    playerId,
}: {
    gameState: GameState;
    playerActionId: number;
    playerId: string;
}): void => {
    const playerAction = apac.state[playerActionId];

    switch (playerAction.type) {
        case ActionType.CAST: {
            return applyCastPlayerActionToGameState({
                gameState,
                playerAction,
                playerId,
            });
        }
        case ActionType.OPPONENT_CAST: {
            return applyCastPlayerActionToGameState({
                gameState,
                playerAction,
                playerId,
            });
        }
        case ActionType.LEARN: {
            return applyLearnPlayerActionToGameState({
                gameState,
                playerAction,
                playerId,
            });
        }
        case ActionType.REST: {
            return applyRestPlayerActionToGameState({
                gameState,
                playerAction,
                playerId,
            });
        }
        case ActionType.BREW: {
            return applyBrewPlayerActionToGameState({
                gameState,
                playerAction,
                playerId,
            });
        }
        /*
        case ActionType.WAIT: {
            return applyWaitPlayerActionToGameState({
                gameState,
                playerAction,
                playerId,
            });
        }
        */
        default:
            throw new Error(`Invalid player action -> ${playerAction.type} ${playerActionId}`);
    }
};

export const applyPlayerActionIdsToGameState = ({
    gameState,
    playerActionIds,
}: {
    gameState: GameState;
    playerActionIds: number[];
}): void => {
    const playerIds = [PLAYER_ID_ME, PLAYER_ID_OPPONENT];

    playerActionIds.forEach((playerActionId, index) => {
        applyPlayerActionToGameState({
            gameState,
            playerActionId,
            playerId: playerIds[index],
        });
    });

    gameState.roundId += 1;
};

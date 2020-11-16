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
    playerAction.deltas.forEach((delta, index) => {
        gameState.players[playerId].ingredients[index] += delta;
    });
    gameState.players[playerId].numOfPotionsBrewed += 1;
    gameState.players[playerId].score += playerAction.price;
    gameState.availableBrewActionIds = gameState.availableBrewActionIds.filter(item => {
        return item !== playerAction.id;
    });
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
    gameState.players[playerId].availableCastActionIds = [
        ...gameState.players[playerId].learnedCastActionIds,
    ];
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
    playerAction.deltas.forEach((delta, index) => {
        gameState.players[playerId].ingredients[index] += delta;
    });
    gameState.players[playerId].availableCastActionIds = gameState.players[
        playerId
    ].availableCastActionIds.filter(item => {
        return item !== playerAction.id;
    });
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
    if (!playerAction) {
        throw new Error(`applyPlayerActionToGameState - Not valid action id -> ${playerActionId}`);
    }
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

import { PLAYER_ID_ME, PLAYER_ID_OPPONENT } from '../game-config';
import { ActionType, GameState, PlayerActionConfig } from '../shared';
import { cloneGameState } from './game-state';

const applyBrewPlayerActionToGameState = ({
    gameState,
    playerAction,
    playerId,
}: {
    gameState: GameState;
    playerAction: PlayerActionConfig;
    playerId: string;
}): GameState => {
    const newGameState = cloneGameState({ gameState });
    newGameState.players[playerId].numOfPotionsBrewed += 1;
    const newPlayerIngredients = playerAction.deltas.map((delta, index) => {
        return gameState.players[playerId].ingredients[index] + delta;
    });
    newGameState.players[playerId].ingredients = newPlayerIngredients;
    newGameState.players[playerId].score += playerAction.price;
    newGameState.availableBrewActionIds = newGameState.availableBrewActionIds.filter(item => {
        return item !== `${playerAction.id}`;
    });
    return newGameState;
};

const applyRestPlayerActionToGameState = ({
    gameState,
    // playerAction,
    playerId,
}: {
    gameState: GameState;
    playerAction: PlayerActionConfig;
    playerId: string;
}): GameState => {
    const newGameState = cloneGameState({ gameState });
    newGameState.players[playerId].availableCastActionIds = [
        ...newGameState.players[playerId].learnedCastActionIds,
    ];
    return newGameState;
};

const applyCastPlayerActionToGameState = ({
    gameState,
    playerAction,
    playerId,
}: {
    gameState: GameState;
    playerAction: PlayerActionConfig;
    playerId: string;
}): GameState => {
    const newGameState = cloneGameState({ gameState });
    const newPlayerIngredients = playerAction.deltas.map((delta, index) => {
        return gameState.players[playerId].ingredients[index] + delta;
    });
    newGameState.players[playerId].ingredients = newPlayerIngredients;
    newGameState.players[playerId].availableCastActionIds = newGameState.players[
        playerId
    ].availableCastActionIds.filter(item => {
        return item !== `${playerAction.id}`;
    });
    return newGameState;
};

const applyWaitPlayerActionToGameState = ({
    gameState,
}: {
    gameState: GameState;
    playerAction: PlayerActionConfig;
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
    const playerAction = gameState.availableActionConfigs[playerActionId];
    if (!playerAction) {
        throw new Error(`Not valid action id -> ${playerActionId}`);
    }
    switch (playerAction.type) {
        case ActionType.BREW: {
            return applyBrewPlayerActionToGameState({
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
        case ActionType.WAIT: {
            return applyWaitPlayerActionToGameState({
                gameState,
                playerAction,
                playerId,
            });
        }
        default:
            throw new Error(`Invalid player action -> ${playerAction.type} ${playerActionId}`);
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
    const playerIds = [PLAYER_ID_ME, PLAYER_ID_OPPONENT];

    playerActionIds.forEach((playerActionId, index) => {
        newGameState = applyPlayerActionToGameState({
            gameState: newGameState,
            playerActionId,
            playerId: playerIds[index],
        });
    });

    newGameState.roundId += 1;

    return newGameState;
};

import {
    applyPlayerActionToGameState,
    createActionForGameLoop,
    createInitialGameState,
    updateGameStateFromGameLoop,
} from './utils';
import { choosePlayerActionId } from './ai';
import { PLAYER_ID_ME } from './config';

let gameState = createInitialGameState();

while (true) {
    gameState = updateGameStateFromGameLoop(gameState);
    const playerActionId = choosePlayerActionId({ gameState, playerId: PLAYER_ID_ME });
    const gameLoopAction = createActionForGameLoop({ gameState, playerActionId });
    gameState = applyPlayerActionToGameState({
        gameState,
        playerId: PLAYER_ID_ME,
        playerActionId,
        removeTakenActionFromPool: false,
    });

    console.log(gameLoopAction);
}

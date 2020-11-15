import {
    applyPlayerActionToGameState,
    createActionForGameLoop,
    createInitialGameState,
    updateGameStateFromGameLoop,
} from './utils';
import { choosePlayerActionId } from './ai';
import { PLAYER_ID_ME } from './game-config';

try {
    let gameState = createInitialGameState();

    while (true) {
        // const start = new Date().getTime();
        gameState = updateGameStateFromGameLoop(gameState);
        // console.error(`update from game loop ${new Date().getTime() - start}`);
        const playerActionId = choosePlayerActionId({ gameState, playerId: PLAYER_ID_ME });
        // console.error(`chose player action ${new Date().getTime() - start}`);
        const gameLoopAction = createActionForGameLoop({ gameState, playerActionId });
        //  console.error(`create write input ${new Date().getTime() - start}`);
        gameState = applyPlayerActionToGameState({
            gameState,
            playerId: PLAYER_ID_ME,
            playerActionId,
        });
        //  console.error(`update internal state ${new Date().getTime() - start}`);
        console.log(gameLoopAction);
    }
} catch (error) {
    console.error(error.message);
}

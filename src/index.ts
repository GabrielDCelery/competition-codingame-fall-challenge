import {
    createActionForGameLoop,
    createInitialGameState,
    updateGameStateFromGameLoop,
} from './utils';
import { choosePlayerActionId } from './ai';
import { PLAYER_ID_ME } from './game-config';

try {
    let gameState = createInitialGameState();

    while (true) {
        gameState = updateGameStateFromGameLoop(gameState);
        // const start = new Date().getTime();
        const playerActionId = choosePlayerActionId({ gameState, playerId: PLAYER_ID_ME });
        // console.error(`choosePlayerActionId ${new Date().getTime() - start}`);
        const gameLoopAction = createActionForGameLoop({ gameState, playerActionId });
        //   console.error(`createActionForGameLoop ${new Date().getTime() - start}`);
        //  console.error(`update internal state ${new Date().getTime() - start}`);
        console.log(gameLoopAction);
    }
} catch (error) {
    console.error(error.message);
    console.error(error);
}

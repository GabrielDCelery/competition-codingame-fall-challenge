import { readGameStateFromGameLoopTick, createActionForGameLoop } from './utils';
import { choosePlayerAction } from './ai';

while (true) {
    const gameState = readGameStateFromGameLoopTick();
    const chosenAction = choosePlayerAction(gameState);
    const gameLoopAction = createActionForGameLoop(chosenAction);
    console.log(gameLoopAction);
}

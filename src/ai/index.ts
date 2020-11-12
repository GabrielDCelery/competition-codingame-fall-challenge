import { GameState, PlayerAction } from '../shared';

export const choosePlayerAction = (gameState: GameState): PlayerAction => {
    const actionIds = Object.keys(gameState.possibleActions);
    const chosenActionId = actionIds[Math.floor(Math.random() * actionIds.length)];
    return gameState.possibleActions[chosenActionId];
};

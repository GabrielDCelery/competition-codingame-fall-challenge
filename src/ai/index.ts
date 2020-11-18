import gameConfig from '../game-config';
import { GameState } from '../shared';

import MonteCarlo from './simultaneous-monte-carlo-efficient';
import Agent from './agent';

const agent = new Agent();

export const choosePlayerActionId = ({
    gameState,
}: {
    gameState: GameState;
    playerId: string;
}): number => {
    agent.setGameState({ gameState });

    const mc = new MonteCarlo<GameState>({
        numOfMaxIterations: gameConfig.monteCarlo.numOfMaxIterations,
        maxTimetoSpend: gameConfig.monteCarlo.maxTimetoSpendInMs,
        maxRolloutSteps: gameConfig.monteCarlo.maxRolloutSteps,
        cConst: gameConfig.monteCarlo.cConst,
        getValidPlayerActionIdPairs: agent.getValidPlayerActionIdPairs,
        applyPlayerActionsToGameState: agent.applyPlayerActionsToGameState,
        scoreState: agent.scoreState,
        checkIfTerminalState: agent.checkIfTerminalState,
        cloneGameState: agent.cloneGameState,
        getGameState: agent.getGameState,
    });

    const chosenActionId = mc.run();
    return chosenActionId;
};

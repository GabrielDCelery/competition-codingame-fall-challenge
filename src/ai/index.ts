import gameConfig, { RESPONSE_TIME_IN_TURNS_MS } from '../game-config';
import { GameState } from '../shared';
import {
    applyPlayerActionIdsToGameState,
    checkIfTerminalState,
    getValidPlayerActionIdPairsForTurn,
    cloneGameState,
    scoreGameState,
} from '../utils';
import MonteCarlo, {
    ValidPlayerActionIdPairsGetter,
    PlayerActionsToGameStateApplier,
    OutcomeValuesGetter,
    TerminalStateChecker,
    GameStateCloner,
} from './simultaneous-monte-carlo';

const mcGetValidPlayerActionIdPairs: ValidPlayerActionIdPairsGetter<GameState> = ({
    gameState,
}) => {
    return getValidPlayerActionIdPairsForTurn({ gameState });
};

const mcApplyPlayerActionsToGameState: PlayerActionsToGameStateApplier<GameState> = ({
    gameState,
    playerActionIds,
}) => {
    return applyPlayerActionIdsToGameState({
        gameState,
        playerActionIds,
    });
};

const mcGetOutcomeValues: OutcomeValuesGetter<GameState> = ({
    isTerminalState,
    initialState,
    terminalState,
}) => {
    return scoreGameState({
        isTerminalState,
        initialState,
        terminalState,
    });
};

const mcCheckIfTerminalState: TerminalStateChecker<GameState> = ({
    initialState,
    currentState,
}) => {
    return checkIfTerminalState({
        initialState,
        currentState,
    });
};

const mcCloneGameState: GameStateCloner<GameState> = ({ gameState }) => {
    return cloneGameState({ gameState });
};

export const choosePlayerActionId = ({
    gameState,
}: {
    gameState: GameState;
    playerId: string;
}): number => {
    const mc = new MonteCarlo<GameState>({
        startState: gameState,
        numOfMaxIterations: gameConfig.monteCarlo.numOfMaxIterations,
        maxTimetoSpend: RESPONSE_TIME_IN_TURNS_MS - 10,
        maxRolloutSteps: gameConfig.monteCarlo.maxRolloutSteps,
        cConst: gameConfig.monteCarlo.cConst,
        getValidPlayerActionIdPairs: mcGetValidPlayerActionIdPairs,
        applyPlayerActionsToGameState: mcApplyPlayerActionsToGameState,
        getOutcomeValues: mcGetOutcomeValues,
        checkIfTerminalState: mcCheckIfTerminalState,
        cloneGameState: mcCloneGameState,
    });
    const chosenActionId = mc.run();
    return chosenActionId;
};

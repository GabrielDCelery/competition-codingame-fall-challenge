import gameConfig from '../game-config';
import { GameState } from '../shared';
import {
    applyPlayerActionIdsToGameState,
    checkIfTerminalState,
    getValidPlayerActionIdPairsForTurn,
    cloneGameState,
    scoreGameState,
} from '../utils';
/*
import MonteCarlo, {
    ValidPlayerActionIdPairsGetter,
    PlayerActionsToGameStateApplier,
    OutcomeValuesGetter,
    TerminalStateChecker,
    GameStateCloner,
} from './simultaneous-monte-carlo';
*/
import MonteCarlo, {
    ValidPlayerActionIdPairsGetter,
    PlayerActionsToGameStateApplier,
    OutcomeValuesGetter,
    TerminalStateChecker,
    GameStateCloner,
} from './simultaneous-monte-carlo-efficient';

const mcGetValidPlayerActionIdPairs: ValidPlayerActionIdPairsGetter<GameState> = ({
    gameState,
}) => {
    return getValidPlayerActionIdPairsForTurn({ gameState });
};

const mcApplyPlayerActionsToGameState: PlayerActionsToGameStateApplier<GameState> = ({
    gameState,
    playerActionIds,
}) => {
    applyPlayerActionIdsToGameState({ gameState, playerActionIds });
};

const mcGetOutcomeValues: OutcomeValuesGetter<GameState> = ({
    isTerminalState,
    initialState,
    currentState,
}) => {
    return scoreGameState({
        isTerminalState,
        initialState,
        currentState,
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
        numOfMaxIterations: gameConfig.monteCarlo.numOfMaxIterations,
        maxTimetoSpend: gameConfig.monteCarlo.maxTimetoSpendInMs,
        maxRolloutSteps: gameConfig.monteCarlo.maxRolloutSteps,
        cConst: gameConfig.monteCarlo.cConst,
        getValidPlayerActionIdPairs: mcGetValidPlayerActionIdPairs,
        applyPlayerActionsToGameState: mcApplyPlayerActionsToGameState,
        getOutcomeValues: mcGetOutcomeValues,
        checkIfTerminalState: mcCheckIfTerminalState,
        cloneGameState: mcCloneGameState,
    });
    const chosenActionId = mc.run({ gameState });
    return chosenActionId;
};

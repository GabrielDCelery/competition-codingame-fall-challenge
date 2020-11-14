import { GameState } from '../shared';
import {
    getValidPlayerActionIds,
    applyPlayerActionToGameState,
    getPlayerIds,
    checkIfTerminalState,
} from '../utils';
import MonteCarlo, {
    ValidPlayerActionIdsGetter,
    PlayerActionToGameStateApplier,
    OutcomeValuesGetter,
    TerminalStateChecker,
} from './simultaneous-monte-carlo';

const mcGetValidPlayerActionIds: ValidPlayerActionIdsGetter<GameState> = ({
    gameState,
    playerId,
}) => {
    return getValidPlayerActionIds({ gameState, playerId });
};

const mcApplyPlayerActionToGameState: PlayerActionToGameStateApplier<GameState> = ({
    gameState,
    playerActionId,
    playerId,
    removeTakenActionFromPool,
}) => {
    return applyPlayerActionToGameState({
        gameState,
        playerActionId,
        playerId,
        removeTakenActionFromPool,
    });
};

const mcGetOutcomeValues: OutcomeValuesGetter<GameState> = ({ terminalState }) => {
    const playerIds = getPlayerIds(terminalState);
    const scores = playerIds.map(playerId => terminalState.players[playerId].score);

    if (scores[0] === scores[1]) {
        return [0, 5, 0.5];
    }

    if (scores[0] > scores[1]) {
        return [1, 0];
    }

    return [0, 1];
};

const mcCheckIfTerminalState: TerminalStateChecker<GameState> = ({
    activePlayerChoseTheSameAction,
    activePlayerId,
    initialState,
    prevState,
    currentState,
}) => {
    if (activePlayerChoseTheSameAction) {
        return true;
    }
    return checkIfTerminalState({
        activePlayerId,
        initialState,
        prevState,
        currentState,
    });
};

export const choosePlayerActionId = ({
    gameState,
}: {
    gameState: GameState;
    playerId: string;
}): string => {
    const mc = new MonteCarlo<GameState>({
        startState: gameState,
        numOfMaxIterations: 100000,
        maxTimetoSpend: 500,
        maxRolloutSteps: 10,
        cConst: Math.sqrt(2),
        playerIds: getPlayerIds(gameState),
        getValidPlayerActionIds: mcGetValidPlayerActionIds,
        applyPlayerActionToGameState: mcApplyPlayerActionToGameState,
        getOutcomeValues: mcGetOutcomeValues,
        checkIfTerminalState: mcCheckIfTerminalState,
    });
    const chosenActionId = mc.run();
    // console.log(mc.rootNode.children);
    return chosenActionId;
};

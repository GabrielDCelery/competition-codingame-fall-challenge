import { GameState } from '../shared';
import {
    applyPlayerActionIdsToGameState,
    checkIfTerminalState,
    getValidPlayerActionIdPairsForTurn,
    cloneGameState,
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

const mcGetOutcomeValues: OutcomeValuesGetter<GameState> = ({ terminalState }) => {
    const playerIds = terminalState.cache.playerIds;
    const scores = playerIds.map(playerId => terminalState.players[playerId].score);

    if (scores[0] === scores[1]) {
        return [0.5, 0.5];
    }

    if (scores[0] > scores[1]) {
        return [1, 0];
    }

    return [0, 1];
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
}): string => {
    const mc = new MonteCarlo<GameState>({
        startState: gameState,
        numOfMaxIterations: 100,
        maxTimetoSpend: 100000,
        maxRolloutSteps: 3,
        cConst: 2,
        getValidPlayerActionIdPairs: mcGetValidPlayerActionIdPairs,
        applyPlayerActionsToGameState: mcApplyPlayerActionsToGameState,
        getOutcomeValues: mcGetOutcomeValues,
        checkIfTerminalState: mcCheckIfTerminalState,
        cloneGameState: mcCloneGameState,
    });
    const chosenActionId = mc.run();
    console.log('playerActionIds');
    console.log(mc.rootNode.children.map(e => e.playerActionIds));
    console.log('visitCount');
    console.log(mc.rootNode.children.map(e => e.visitCount));
    console.log('valueSums');
    console.log(mc.rootNode.children.map(e => e.valueSums));
    return chosenActionId;
};

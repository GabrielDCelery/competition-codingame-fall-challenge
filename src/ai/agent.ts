import { ActionType, GameState } from '../shared';
import {
    getValidPlayerActionIdPairsForTurn,
    applyPlayerActionIdsToGameState,
    scoreGameState,
    checkIfTerminalState,
    cloneGameState,
} from '../utils';
import {
    ValidPlayerActionIdPairsGetter,
    PlayerActionsToGameStateApplier,
    OutcomeValuesGetter,
    TerminalStateChecker,
    GameStateCloner,
} from './simultaneous-monte-carlo-efficient';

class Agent {
    constructor() {
        this.getValidPlayerActionIdPairs = this.getValidPlayerActionIdPairs.bind(this);
        this.applyPlayerActionsToGameState = this.applyPlayerActionsToGameState.bind(this);
        this.getOutcomeValues = this.getOutcomeValues.bind(this);
        this.checkIfTerminalState = this.checkIfTerminalState.bind(this);
        this.cloneGameState = this.cloneGameState.bind(this);
    }

    getValidPlayerActionIdPairs: ValidPlayerActionIdPairsGetter<GameState> = ({ gameState }) => {
        const allowedActions =
            gameState.players[0].learnedCastActionIds.length <= 9 && gameState.roundId < 13
                ? [ActionType.LEARN, ActionType.CAST, ActionType.REST]
                : [ActionType.BREW, ActionType.CAST, ActionType.REST];

        return getValidPlayerActionIdPairsForTurn({ gameState, allowedActions });
    };

    applyPlayerActionsToGameState: PlayerActionsToGameStateApplier<GameState> = ({
        gameState,
        playerActionIds,
    }) => {
        applyPlayerActionIdsToGameState({ gameState, playerActionIds });
    };

    getOutcomeValues: OutcomeValuesGetter<GameState> = ({
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

    checkIfTerminalState: TerminalStateChecker<GameState> = ({ initialState, currentState }) => {
        return checkIfTerminalState({
            initialState,
            currentState,
        });
    };

    cloneGameState: GameStateCloner<GameState> = ({ gameState }) => {
        return cloneGameState({ gameState });
    };
}

export default Agent;

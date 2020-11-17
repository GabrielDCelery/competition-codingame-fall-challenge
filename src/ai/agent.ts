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
    StateScorer,
    TerminalStateChecker,
    GameStateCloner,
} from './simultaneous-monte-carlo-efficient';

class Agent {
    constructor() {
        this.getValidPlayerActionIdPairs = this.getValidPlayerActionIdPairs.bind(this);
        this.applyPlayerActionsToGameState = this.applyPlayerActionsToGameState.bind(this);
        this.scoreState = this.scoreState.bind(this);
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

    scoreState: StateScorer<GameState> = ({ isTerminalState, initialState, currentState }) => {
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

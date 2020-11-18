import gameConfig, { NUM_OF_GAME_ROUNDS, PLAYER_ID_ME, PLAYER_ID_OPPONENT } from '../game-config';
import { ActionType, GameState } from '../shared';
import {
    getValidPlayerActionIdPairsForTurn,
    applyPlayerActionIdsToGameState,
    scoreGameState,
    cloneGameState,
} from '../utils';
import {
    ValidPlayerActionIdPairsGetter,
    PlayerActionsToGameStateApplier,
    StateScorer,
    TerminalStateChecker,
    GameStateCloner,
    GameStateGetter,
} from './simultaneous-monte-carlo-efficient';

class Agent {
    private gameState: GameState;

    constructor() {
        this.getValidPlayerActionIdPairs = this.getValidPlayerActionIdPairs.bind(this);
        this.applyPlayerActionsToGameState = this.applyPlayerActionsToGameState.bind(this);
        this.scoreState = this.scoreState.bind(this);
        this.checkIfTerminalState = this.checkIfTerminalState.bind(this);
        this.cloneGameState = this.cloneGameState.bind(this);
        this.getGameState = this.getGameState.bind(this);
    }

    setGameState({ gameState }: { gameState: GameState }): this {
        this.gameState = this.cloneGameState({ gameState });
        return this;
    }

    getGameState: GameStateGetter<GameState> = () => {
        // console.error(JSON.stringify(this.gameState));
        return this.gameState;
    };

    getValidPlayerActionIdPairs: ValidPlayerActionIdPairsGetter<GameState> = ({ gameState }) => {
        const allowedActions =
            gameState.players[0].learnedCastActionIds.length <= 9 && gameState.roundId < 13
                ? [ActionType.LEARN, ActionType.CAST, ActionType.REST]
                : [ActionType.BREW, ActionType.CAST, ActionType.REST];

        const a = [
            ...(allowedActions.includes(ActionType.BREW) ? gameState.availableBrewActionIds : []),
            ...(allowedActions.includes(ActionType.LEARN) ? gameState.avaliableLearnActionIds : []),
            ...(allowedActions.includes(ActionType.CAST)
                ? gameState.players[PLAYER_ID_ME].availableCastActionIds
                : []),
            ...gameState.availableDefaultActionIds,
        ];

        const b = [
            ...(allowedActions.includes(ActionType.BREW) ? gameState.availableBrewActionIds : []),
            ...(allowedActions.includes(ActionType.LEARN) ? gameState.avaliableLearnActionIds : []),
            ...(allowedActions.includes(ActionType.CAST)
                ? gameState.players[PLAYER_ID_OPPONENT].availableCastActionIds
                : []),
            ...gameState.availableDefaultActionIds,
        ];

        return getValidPlayerActionIdPairsForTurn({ gameState, actionPoolPair: [a, b] });
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

    checkIfTerminalState: TerminalStateChecker<GameState> = ({ currentState }) => {
        if (currentState.roundId === NUM_OF_GAME_ROUNDS) {
            return true;
        }

        if (
            currentState.players[PLAYER_ID_ME].numOfPotionsBrewed >=
                gameConfig.numOfPotionsToBrewToWin ||
            currentState.players[PLAYER_ID_OPPONENT].numOfPotionsBrewed >=
                gameConfig.numOfPotionsToBrewToWin
        ) {
            return true;
        }

        return false;
    };

    cloneGameState: GameStateCloner<GameState> = ({ gameState }) => {
        return cloneGameState({ gameState });
    };
}

export default Agent;

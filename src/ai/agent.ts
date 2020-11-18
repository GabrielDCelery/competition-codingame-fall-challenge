import gameConfig, { NUM_OF_GAME_ROUNDS, PLAYER_ID_ME, PLAYER_ID_OPPONENT } from '../game-config';
import { ActionType, GameState, PlayerActionConfig } from '../shared';
import {
    getValidPlayerActionIdPairsForTurn,
    applyPlayerActionIdsToGameState,
    scoreGameState,
    cloneGameState,
} from '../utils';
import apac from '../utils/available-player-action-configs';
import {
    ValidPlayerActionIdPairsGetter,
    PlayerActionsToGameStateApplier,
    StateScorer,
    TerminalStateChecker,
    GameStateCloner,
    GameStateGetter,
} from './simultaneous-monte-carlo-efficient';

const isSpellNetGenerator = ({ learnAction }: { learnAction: PlayerActionConfig }): boolean => {
    for (let i = 0, iMax = learnAction.deltas.length; i < iMax; i++) {
        if (learnAction.deltas[i] < 0) {
            return false;
        }
    }
    return true;
};

const getPlayerProductions = ({
    gameState,
    playerId,
}: {
    gameState: GameState;
    playerId: string;
}): number[] => {
    const economy = [0, 0, 0, 0];

    gameState.players[playerId].learnedCastActionIds.forEach(castId => {
        apac.state[castId].deltas.forEach((delta, index) => {
            economy[index] += delta;
        });
    });

    return economy;
};

const isSpellWorthLearning = ({
    learnId,
    productions,
}: {
    learnId: number;
    productions: number[];
}): boolean => {
    const learnAction = apac.state[learnId];

    if (isSpellNetGenerator({ learnAction })) {
        return true;
    }

    if (learnAction.taxCount >= 4) {
        return true;
    }

    const productionsAfterLearning = productions.map((production, index) => {
        return production + learnAction.deltas[index];
    });

    const averageProductionAfterLearning =
        productionsAfterLearning.reduce((a, b) => a + b, 0) / productionsAfterLearning.length;

    const deviationFromAverageProduction = productionsAfterLearning.map(production => {
        return production - averageProductionAfterLearning;
    });

    const positiveDeviation = Math.max(...deviationFromAverageProduction);
    const negativeDeviation = Math.min(...deviationFromAverageProduction);

    const deviation = positiveDeviation - negativeDeviation;

    return deviation <= 6;
};

const filterSpellsWorthLearning = ({
    gameState,
    playerId,
}: {
    gameState: GameState;
    playerId: string;
}): number[] => {
    if (9 <= gameState.players[playerId].learnedCastActionIds.length) {
        return [];
    }
    const productions = getPlayerProductions({ gameState, playerId });
    return gameState.avaliableLearnActionIds.filter(learnId => {
        return isSpellWorthLearning({ learnId, productions });
    });
};

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
        this.gameState = this.pruneGameState({ gameState });
        return this;
    }

    getGameState: GameStateGetter<GameState> = () => {
        // console.error(JSON.stringify(this.gameState));
        return this.gameState;
    };

    pruneGameState({ gameState }: { gameState: GameState }): GameState {
        const clonedGameState = this.cloneGameState({ gameState });

        const spellsWorthLearning = filterSpellsWorthLearning({
            gameState,
            playerId: PLAYER_ID_ME,
        });

        clonedGameState.availableBrewActionIds =
            7 <= gameState.roundId ? gameState.availableBrewActionIds : [];

        clonedGameState.avaliableLearnActionIds = spellsWorthLearning;

        /*
        const allowedActions =
            clonedGameState.players[0].learnedCastActionIds.length <= 9 && gameState.roundId < 13
                ? [ActionType.LEARN, ActionType.CAST, ActionType.REST]
                : [ActionType.BREW, ActionType.CAST, ActionType.REST];

        clonedGameState.availableBrewActionIds = allowedActions.includes(ActionType.BREW)
            ? gameState.availableBrewActionIds
            : [];

        clonedGameState.avaliableLearnActionIds = allowedActions.includes(ActionType.LEARN)
            ? gameState.avaliableLearnActionIds
            : [];

        clonedGameState.players[PLAYER_ID_ME].availableCastActionIds = allowedActions.includes(
            ActionType.CAST
        )
            ? gameState.players[PLAYER_ID_ME].availableCastActionIds
            : [];

        clonedGameState.players[
            PLAYER_ID_OPPONENT
        ].availableCastActionIds = allowedActions.includes(ActionType.CAST)
            ? gameState.players[PLAYER_ID_OPPONENT].availableCastActionIds
            : [];
*/
        return clonedGameState;
    }

    getValidPlayerActionIdPairs: ValidPlayerActionIdPairsGetter<GameState> = ({ gameState }) => {
        const a = [
            ...gameState.availableBrewActionIds,
            ...gameState.avaliableLearnActionIds,
            ...gameState.players[PLAYER_ID_ME].availableCastActionIds,
            ...gameState.availableDefaultActionIds,
        ];

        const b = [
            ...gameState.availableBrewActionIds,
            ...gameState.avaliableLearnActionIds,
            ...gameState.players[PLAYER_ID_OPPONENT].availableCastActionIds,
            ...gameState.availableDefaultActionIds,
        ];

        /*
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
        */
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

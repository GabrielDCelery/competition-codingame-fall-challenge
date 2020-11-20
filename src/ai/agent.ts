import gameConfig, { NUM_OF_GAME_ROUNDS, PLAYER_ID_ME, PLAYER_ID_OPPONENT } from '../game-config';
import { GameState } from '../shared';
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

export const getPlayerProductions = ({
    gameState,
    playerId,
}: {
    gameState: GameState;
    playerId: string;
}): number[] => {
    const productions = [0, 0, 0, 0];

    gameState.players[playerId].action.list.cast.learned.forEach(castId => {
        apac.state[castId].deltas.forEach((delta, index) => {
            productions[index] += delta;
        });
    });

    return productions;
};

const isSpellWorthLearning = ({
    learnId,
    productions,
}: {
    learnId: number;
    productions: number[];
}): boolean => {
    const learnAction = apac.state[learnId];
    /*
    if (isSpellNetGenerator({ learnAction })) {
        return true;
    }
    */
    if (learnAction.taxCount >= 3) {
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

    return deviation <= 5;
};

const filterSpellsWorthLearning = ({
    gameState,
    playerId,
}: {
    gameState: GameState;
    playerId: string;
}): number[] => {
    const productions = getPlayerProductions({ gameState, playerId });
    return gameState.avaliableLearnActionIds.filter(learnId => {
        return isSpellWorthLearning({ learnId, productions: [...productions] });
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

        clonedGameState.availableBrewActionIds =
            7 <= gameState.roundId ? gameState.availableBrewActionIds : [];

        clonedGameState.players[
            PLAYER_ID_ME
        ].action.list.cast.interestedIn = filterSpellsWorthLearning({
            gameState,
            playerId: PLAYER_ID_ME,
        });

        clonedGameState.players[
            PLAYER_ID_OPPONENT
        ].action.list.cast.interestedIn = filterSpellsWorthLearning({
            gameState,
            playerId: PLAYER_ID_OPPONENT,
        });

        return clonedGameState;
    }

    getValidPlayerActionIdPairs: ValidPlayerActionIdPairsGetter<GameState> = ({ gameState }) => {
        const a = [
            ...gameState.availableBrewActionIds,
            ...gameState.players[PLAYER_ID_ME].action.list.cast.interestedIn,
            ...gameState.players[PLAYER_ID_ME].action.list.cast.available,
            ...gameState.availableDefaultActionIds,
        ];

        const b = [
            ...gameState.availableBrewActionIds,
            ...gameState.players[PLAYER_ID_OPPONENT].action.list.cast.interestedIn,
            ...gameState.players[PLAYER_ID_OPPONENT].action.list.cast.available,
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

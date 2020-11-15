import config, { PLAYER_ID_ME, PLAYER_ID_OPPONENT, NUM_OF_GAME_ROUNDS } from '../game-config';
import { GameState } from '../shared';

export const checkIfTerminalState = ({
    // initialState,
    // prevState,
    currentState,
}: {
    initialState: GameState;
    currentState: GameState;
}): boolean => {
    if (currentState.roundId === NUM_OF_GAME_ROUNDS) {
        return true;
    }

    if (
        currentState.players[PLAYER_ID_ME].numOfPotionsBrewed >= config.numOfPotionsToBrewToWin ||
        currentState.players[PLAYER_ID_OPPONENT].numOfPotionsBrewed >=
            config.numOfPotionsToBrewToWin
    ) {
        return true;
    }

    return false;
};

import { GameState } from '../shared';

export const checkIfTerminalState = ({
    // initialState,
    // prevState,
    currentState,
}: {
    initialState: GameState;
    currentState: GameState;
}): boolean => {
    if (
        currentState.players['0'].numOfPotionsBrewed === 2 ||
        currentState.players['1'].numOfPotionsBrewed === 2
    ) {
        return true;
    }
    return currentState.cache.avalableActionIds.length === 1;
};

import { GameState } from '../shared';
import { getValidPlayerActionIds } from './player-actions-validator';

export const checkIfTerminalState = ({
    activePlayerId,
    // initialState,
    // prevState,
    currentState,
}: {
    activePlayerId: string;
    initialState: GameState;
    prevState: GameState;
    currentState: GameState;
}): boolean => {
    const validPlayerActionIds = getValidPlayerActionIds({
        gameState: currentState,
        playerId: activePlayerId,
    });

    return validPlayerActionIds.length === 0;
};

import { ActionType, GameState } from '../shared';

export const createActionForGameLoop = ({
    gameState,
    playerActionId,
}: {
    gameState: GameState;
    playerActionId: string;
}): string => {
    const playerAction = gameState.availableActions[playerActionId];
    if (!playerAction) {
        throw new Error(`Not valid action id -> ${playerActionId}`);
    }
    const { type, id } = playerAction;
    switch (type) {
        case ActionType.BREW: {
            return `${type} ${id}`;
        }
        default:
            throw new Error(`Invalid action -> ${type}`);
    }
};

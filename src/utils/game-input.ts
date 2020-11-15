import { ActionType, GameState } from '../shared';

export const createActionForGameLoop = ({
    gameState,
    playerActionId,
}: {
    gameState: GameState;
    playerActionId: string;
}): string => {
    const playerAction = gameState.availableActionConfigs[playerActionId];
    if (!playerAction) {
        throw new Error(`Not valid action id -> ${playerActionId}`);
    }
    const { type, id } = playerAction;
    switch (type) {
        case ActionType.BREW: {
            return `${type} ${id}`;
        }
        case ActionType.CAST: {
            return `${type} ${id}`;
        }
        case ActionType.REST: {
            return `${type}`;
        }
        case ActionType.WAIT: {
            return `${type}`;
        }
        default:
            throw new Error(`Invalid action -> ${type}`);
    }
};

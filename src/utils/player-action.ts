import { ActionType, PlayerAction } from '../shared';

export const createActionForGameLoop = (playerAction: PlayerAction): string => {
    const { type, id } = playerAction;
    switch (type) {
        case ActionType.BREW: {
            return `${type} ${id}`;
        }
        default:
            throw new Error(`Invalid action -> ${type}`);
    }
};

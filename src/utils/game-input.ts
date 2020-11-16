import { ActionType, GameState } from '../shared';
import apac from './available-player-action-configs';

export const createActionForGameLoop = ({
    // gameState,
    playerActionId,
}: {
    gameState: GameState;
    playerActionId: number;
}): string => {
    const playerAction = apac.state[playerActionId];
    if (!playerAction) {
        throw new Error(`createActionForGameLoop - Not valid action id -> ${playerActionId}`);
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

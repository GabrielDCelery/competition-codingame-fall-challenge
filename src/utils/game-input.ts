import { ActionType, GameState } from '../shared';
import apac from './available-player-action-configs';

const getActionType = (actionType: ActionType): string => {
    switch (actionType) {
        case ActionType.CAST: {
            return 'CAST';
        }
        case ActionType.OPPONENT_CAST: {
            return 'OPPONENT_CAST';
        }
        case ActionType.REST: {
            return 'REST';
        }
        case ActionType.BREW: {
            return 'BREW';
        }
        case ActionType.LEARN: {
            return 'LEARN';
        }
        case ActionType.WAIT: {
            return 'WAIT';
        }
        default:
            throw new Error(`Invalid action type -> ${actionType}`);
    }
};

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
            return `${getActionType(type)} ${id}`;
        }
        case ActionType.CAST: {
            return `${getActionType(type)} ${id}`;
        }
        case ActionType.REST: {
            return `${getActionType(type)}`;
        }
        case ActionType.LEARN: {
            return `${getActionType(type)}`;
        }
        case ActionType.WAIT: {
            return `${getActionType(type)}`;
        }
        default:
            throw new Error(`Invalid action -> ${type}`);
    }
};

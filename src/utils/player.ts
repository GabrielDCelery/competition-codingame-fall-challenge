import { PLAYER_ID_ME, PLAYER_ID_OPPONENT } from '../config';

export const getOpponentId = (playerId: string): string => {
    return playerId === PLAYER_ID_ME ? PLAYER_ID_OPPONENT : PLAYER_ID_ME;
};

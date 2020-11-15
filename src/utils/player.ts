import { PLAYER_ID_ME, PLAYER_ID_OPPONENT } from '../game-config';

export const isPlayerMe = (playerId: string): boolean => {
    return playerId === PLAYER_ID_ME;
};

export const getOpponentId = (playerId: string): string => {
    return playerId === PLAYER_ID_ME ? PLAYER_ID_OPPONENT : PLAYER_ID_ME;
};

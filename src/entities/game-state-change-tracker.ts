import { ActionType, GameState } from './game-state';
import { PlayerState } from './player-state';

class PlayerStateChangeTracker {
    numOfPotionsBrewed: number;
    ingredients: number[];
    score: number;
    action: {
        list: {
            cast: { learned: number[]; available: number[]; interestedIn: number[] };
        };
        map: {
            cast: { available: { [index: string]: boolean } };
        };
    };

    constructor({ player }: { player: PlayerState }) {
        this.numOfPotionsBrewed = player.numOfPotionsBrewed;
        this.ingredients = [...player.ingredients];
        this.score = player.score;
        this.action = {
            list: { cast: { learned: [], available: [], interestedIn: [] } },
            map: { cast: { available: {} } },
        };
        this.addCastAction = this.addCastAction.bind(this);
    }

    addCastAction({ id }: { id: number }): void {
        this.action.list.cast.available.push(id);
        this.action.map.cast.available[id] = true;
    }
}

export class GameStateChangeTracker {
    gameState: GameState;
    action: {
        list: {
            brew: number[];
            learn: number[];
            default: number[];
        };
        map: {
            brew: { [index: string]: boolean };
            learn: { [index: string]: boolean };
            default: { [index: string]: boolean };
        };
    };
    players: PlayerStateChangeTracker[];

    constructor({ gameState }: { gameState: GameState }) {
        this.players = [
            new PlayerStateChangeTracker({ player: gameState.players[0] }),
            new PlayerStateChangeTracker({ player: gameState.players[1] }),
        ];

        const actionIds = Object.keys(gameState.actionConfigs);

        actionIds.forEach(actionId => {
            const { id, type } = gameState.actionConfigs[actionId];
            if (type === ActionType.BREW) {
                return this.addBrewAction({ id });
            }
            if (type === ActionType.LEARN) {
                return this.addLearnAction({ id });
            }
            if (type === ActionType.REST) {
                return this.addDefaultAction({ id });
            }
            if (type === ActionType.CAST) {
                return this.addCastAction({ player: this.players[0], id });
            }
            if (type == ActionType.OPPONENT_CAST) {
                return this.addCastAction({ player: this.players[1], id });
            }
        });
    }

    private addBrewAction({ id }: { id: number }): void {
        this.action.list.brew.push(id);
        this.action.map.brew[id] = true;
    }

    private addLearnAction({ id }: { id: number }): void {
        this.action.list.learn.push(id);
        this.action.map.learn[id] = true;
    }

    private addDefaultAction({ id }: { id: number }): void {
        this.action.list.default.push(id);
        this.action.map.default[id] = true;
    }

    private addCastAction({ player, id }: { player: PlayerStateChangeTracker; id: number }): void {
        player.addCastAction({ id });
    }

    clone(): GameStateChangeTracker {}
}

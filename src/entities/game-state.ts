import { PlayerState } from './player-state';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const readline: any;

const readNextLine = (): string => {
    return readline();
};

export enum ActionType {
    CAST = 0,
    OPPONENT_CAST = 1,
    LEARN = 2,
    BREW = 3,
    WAIT = 4,
    REST = 5,
}

export interface PlayerActionConfig {
    id: number;
    type: ActionType;
    deltas: number[];
    price: number;
    tomeIndex: number;
    taxCount: number;
    castable: boolean;
    repeatable: boolean;
}

const actionTypeMap: { [index: string]: ActionType } = {
    CAST: ActionType.CAST,
    OPPONENT_CAST: ActionType.OPPONENT_CAST,
    BREW: ActionType.BREW,
    LEARN: ActionType.LEARN,
    WAIT: ActionType.WAIT,
    REST: ActionType.REST,
};

export class GameState {
    roundId: number;
    players: PlayerState[];
    actionConfigs: { [index: string]: PlayerActionConfig };

    constructor() {
        this.roundId = 0;
        this.players = [new PlayerState(), new PlayerState()];
        this.actionConfigs = {};
        this.updateFromGameLoop = this.updateFromGameLoop.bind(this);
    }

    updateFromGameLoop(): void {
        this.roundId += 1;
        this.actionConfigs = {};

        const actionCount = parseInt(readNextLine());

        new Array(actionCount).fill(null).forEach(() => {
            const inputs = readNextLine().split(' ');
            const id = parseInt(inputs[0]);
            const type = actionTypeMap[inputs[1]];

            const actionConfig = {
                id,
                type,
                deltas: [inputs[2], inputs[3], inputs[4], inputs[5]].map(e => parseInt(e)),
                price: parseInt(inputs[6]),
                tomeIndex: parseInt(inputs[7]),
                taxCount: parseInt(inputs[8]),
                castable: inputs[9] !== '0',
                repeatable: inputs[10] !== '0',
            };

            this.actionConfigs[id] = actionConfig;
        });

        const defaultAction = {
            id: 888,
            type: ActionType.REST,
            deltas: [0, 0, 0, 0],
            price: 0,
            tomeIndex: 0,
            taxCount: 0,
            castable: false,
            repeatable: false,
        };

        this.actionConfigs[defaultAction.id] = defaultAction;

        // TODO - add default action config

        this.players.forEach(player => {
            const inputs = readNextLine().split(' ');
            const ingredients = [inputs[0], inputs[1], inputs[2], inputs[3]].map(e => parseInt(e));
            const newScore = parseInt(inputs[4]);
            const didBrewPotionLastTurn = player.score < newScore;
            const newPotionCount = didBrewPotionLastTurn
                ? player.numOfPotionsBrewed + 1
                : player.numOfPotionsBrewed;

            player.update({
                numOfPotionsBrewed: newPotionCount,
                ingredients,
                score: newScore,
            });
        });
    }
}

import { AvailablePlayerActionConfigs, PlayerActionConfig } from '../shared';

class AvailablePlayerActionConfigsClass {
    state: AvailablePlayerActionConfigs;

    constructor() {
        this.state = {};
    }

    reset(): void {
        this.state = {};
    }

    get(playerActionId: number): PlayerActionConfig {
        return this.state[playerActionId];
    }

    addConfig(availableActionConfig: PlayerActionConfig): void {
        this.state[availableActionConfig.id] = availableActionConfig;
    }
}

const apac = new AvailablePlayerActionConfigsClass();

export default apac;

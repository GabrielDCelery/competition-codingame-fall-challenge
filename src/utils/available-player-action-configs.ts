import { AvailablePlayerActionConfigs, PlayerActionConfig } from '../shared';

class AvailablePlayerActionConfigsClass {
    state: AvailablePlayerActionConfigs;

    constructor() {
        this.state = {};
    }

    reset(): void {
        this.state = {};
    }

    addConfig(availableActionConfig: PlayerActionConfig): void {
        this.state[availableActionConfig.id] = availableActionConfig;
    }
}

const apac = new AvailablePlayerActionConfigsClass();

export default apac;

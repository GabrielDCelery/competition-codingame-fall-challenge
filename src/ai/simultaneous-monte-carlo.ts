export type ValidPlayerActionIdPairsGetter<TState> = ({
    gameState,
}: {
    gameState: TState;
}) => number[][];

export type PlayerActionsToGameStateApplier<TState> = ({
    gameState,
    playerActionIds,
}: {
    gameState: TState;
    playerActionIds: number[];
}) => void;

export type TerminalStateChecker<TState> = ({
    initialState,
    currentState,
}: {
    initialState: TState;
    currentState: TState;
}) => boolean;

export type OutcomeValuesGetter<TState> = ({
    isTerminalState,
    initialState,
    currentState,
}: {
    isTerminalState?: boolean;
    initialState: TState;
    currentState: TState;
}) => number[];

export type GameStateCloner<TState> = ({ gameState }: { gameState: TState }) => TState;

class MCNode<TState> {
    parent: MCNode<TState> | null;
    children: MCNode<TState>[];
    visitCount: number;
    playerActionIds: number[] | null;
    valueSums: number[];
    cloneGameState: GameStateCloner<TState>;
    applyPlayerActionsToGameState: PlayerActionsToGameStateApplier<TState>;
    getValidPlayerActionIdPairs: ValidPlayerActionIdPairsGetter<TState>;

    constructor({
        parent,
        playerActionIds,
        cloneGameState,
        applyPlayerActionsToGameState,
        getValidPlayerActionIdPairs,
    }: {
        parent: MCNode<TState> | null;
        playerActionIds: number[] | null;
        cloneGameState: GameStateCloner<TState>;
        applyPlayerActionsToGameState: PlayerActionsToGameStateApplier<TState>;
        getValidPlayerActionIdPairs: ValidPlayerActionIdPairsGetter<TState>;
    }) {
        this.parent = parent;
        this.children = [];
        this.visitCount = 0;
        this.playerActionIds = playerActionIds;
        this.valueSums = [0, 0];
        this.cloneGameState = cloneGameState;
        this.applyPlayerActionsToGameState = applyPlayerActionsToGameState;
        this.getValidPlayerActionIdPairs = getValidPlayerActionIdPairs;
    }

    getValue({ playerIndex }: { playerIndex: number }): number {
        if (this.visitCount === 0) {
            return Infinity;
        }
        return this.valueSums[playerIndex] / this.visitCount;
    }

    isLeafNode(): boolean {
        return this.children.length === 0;
    }

    hasBeenVisited(): boolean {
        return this.visitCount > 0;
    }

    applyLeafNodesToNode({ gameState }: { gameState: TState }): void {
        const validPlayerActionIdPairs = this.getValidPlayerActionIdPairs({ gameState });

        validPlayerActionIdPairs.forEach(validPlayerActionIdPair => {
            const child = new MCNode({
                parent: this,
                playerActionIds: validPlayerActionIdPair,
                cloneGameState: this.cloneGameState,
                applyPlayerActionsToGameState: this.applyPlayerActionsToGameState,
                getValidPlayerActionIdPairs: this.getValidPlayerActionIdPairs,
            });

            this.children.push(child);
        });
    }

    getMaxUCBNode({
        gameState,
        cConst,
        playerRunningTheSimulation,
    }: {
        gameState: TState;
        cConst: number;
        playerRunningTheSimulation: number;
    }): MCNode<TState> {
        let chosenNodeIndex = -1;
        let chosenNodeValue = -Infinity;

        this.children.forEach((child, index) => {
            const nodeUCBValue =
                child.visitCount === 0
                    ? Infinity
                    : child.getValue({ playerIndex: playerRunningTheSimulation }) +
                      cConst * Math.sqrt(Math.log(this.visitCount) / child.visitCount);

            if (chosenNodeValue < nodeUCBValue) {
                chosenNodeIndex = index;
                chosenNodeValue = nodeUCBValue;
            }
        });

        const chosenChild = this.children[chosenNodeIndex];

        if (chosenChild.playerActionIds === null) {
            throw new Error(`Accessing null`);
        }

        this.applyPlayerActionsToGameState({
            gameState,
            playerActionIds: chosenChild.playerActionIds,
        });

        return this.children[chosenNodeIndex];
    }
}

class SimultaneousMCSearch<TState> {
    rootNode: MCNode<TState>;
    numOfMaxIterations: number;
    maxTimetoSpend: number;
    maxRolloutSteps: number;
    cConst: number;
    getValidPlayerActionIdPairs: ValidPlayerActionIdPairsGetter<TState>;
    applyPlayerActionsToGameState: PlayerActionsToGameStateApplier<TState>;
    getOutcomeValues: OutcomeValuesGetter<TState>;
    checkIfTerminalState: TerminalStateChecker<TState>;
    cloneGameState: GameStateCloner<TState>;

    constructor({
        numOfMaxIterations,
        maxTimetoSpend,
        cConst,
        maxRolloutSteps,
        getValidPlayerActionIdPairs,
        applyPlayerActionsToGameState,
        getOutcomeValues,
        checkIfTerminalState,
        cloneGameState,
    }: {
        numOfMaxIterations: number;
        maxTimetoSpend: number;
        cConst: number;
        maxRolloutSteps: number;
        getValidPlayerActionIdPairs: ValidPlayerActionIdPairsGetter<TState>;
        applyPlayerActionsToGameState: PlayerActionsToGameStateApplier<TState>;
        getOutcomeValues: OutcomeValuesGetter<TState>;
        checkIfTerminalState: TerminalStateChecker<TState>;
        cloneGameState: GameStateCloner<TState>;
    }) {
        this.numOfMaxIterations = numOfMaxIterations;
        this.maxTimetoSpend = maxTimetoSpend;
        this.maxRolloutSteps = maxRolloutSteps;
        this.cConst = cConst;
        this.getValidPlayerActionIdPairs = getValidPlayerActionIdPairs;
        this.applyPlayerActionsToGameState = applyPlayerActionsToGameState;
        this.getOutcomeValues = getOutcomeValues;
        this.checkIfTerminalState = checkIfTerminalState;
        this.cloneGameState = cloneGameState;

        this.rootNode = new MCNode<TState>({
            parent: null,
            playerActionIds: null,
            cloneGameState: this.cloneGameState,
            getValidPlayerActionIdPairs: this.getValidPlayerActionIdPairs,
            applyPlayerActionsToGameState: this.applyPlayerActionsToGameState,
        });
    }

    traverse({
        gameState,
        startFromNode,
        playerRunningTheSimulation,
    }: {
        gameState: TState;
        startFromNode: MCNode<TState>;
        playerRunningTheSimulation: number;
    }): MCNode<TState> {
        let currentNode = startFromNode;
        while (!currentNode.isLeafNode()) {
            currentNode = currentNode.getMaxUCBNode({
                gameState,
                cConst: this.cConst,
                playerRunningTheSimulation,
            });
        }
        return currentNode;
    }

    rollout({
        initialState,
        rolloutState,
    }: {
        initialState: TState;
        rolloutState: TState;
    }): number[] {
        let currentRolloutSteps = 0;

        while (true) {
            currentRolloutSteps += 1;

            const reachedMaximumRollout = this.maxRolloutSteps < currentRolloutSteps;

            if (reachedMaximumRollout) {
                return this.getOutcomeValues({ initialState, currentState: rolloutState });
            }

            const isTerminalState = this.checkIfTerminalState({
                initialState,
                currentState: rolloutState,
            });

            if (isTerminalState) {
                return this.getOutcomeValues({
                    isTerminalState: true,
                    initialState,
                    currentState: rolloutState,
                });
            }

            const validPlayerActionIdPairs = this.getValidPlayerActionIdPairs({
                gameState: rolloutState,
            });

            const randomlyChosenActionIdPair =
                validPlayerActionIdPairs[
                    Math.floor(Math.random() * validPlayerActionIdPairs.length)
                ];

            this.applyPlayerActionsToGameState({
                gameState: rolloutState,
                playerActionIds: randomlyChosenActionIdPair,
            });
        }
    }

    backPropagate({
        startFromNode,
        values,
    }: {
        startFromNode: MCNode<TState>;
        values: number[];
    }): void {
        values.forEach((value, index) => {
            startFromNode.valueSums[index] += value;
        });
        startFromNode.visitCount = startFromNode.visitCount + 1;
        if (startFromNode.parent === null) {
            return;
        }
        this.backPropagate({ startFromNode: startFromNode.parent, values });
    }

    chooseNextActionId(): number {
        const groupedWinrates: { [index: string]: number[] } = {};

        this.rootNode.children.forEach(child => {
            if (child.playerActionIds === null) {
                return;
            }

            const playerActionId = child.playerActionIds[0];

            if (!groupedWinrates[playerActionId]) {
                groupedWinrates[playerActionId] = [];
            }

            const winPercentage =
                child.visitCount === 0 ? 0 : child.valueSums[0] / child.visitCount;

            groupedWinrates[playerActionId].push(winPercentage);
        });

        const playerActionIds = Object.keys(groupedWinrates);
        let chosenActionId = -1;
        let chosenActionWinPercentage = -1;

        playerActionIds.forEach(key => {
            const winPercentage =
                groupedWinrates[key].reduce((a, b) => a + b, 0) / groupedWinrates[key].length;

            if (chosenActionWinPercentage < winPercentage) {
                chosenActionWinPercentage = winPercentage;
                chosenActionId = parseInt(key);
            }
        });

        return chosenActionId;
    }

    run({ gameState }: { gameState: TState }): number {
        let numOfCurrentIterations = 0;
        const start = new Date().getTime();
        let playerRunningTheSimulation = 0;

        this.rootNode.applyLeafNodesToNode({ gameState });

        while (true) {
            if (this.maxTimetoSpend < new Date().getTime() - start) {
                return this.chooseNextActionId();
            }

            const analyzedState = this.cloneGameState({ gameState });

            let currentNode = this.traverse({
                gameState: analyzedState,
                startFromNode: this.rootNode,
                playerRunningTheSimulation,
            });

            if (this.maxTimetoSpend < new Date().getTime() - start) {
                return this.chooseNextActionId();
            }

            const isTerminalState = this.checkIfTerminalState({
                initialState: gameState,
                currentState: analyzedState,
            });

            if (currentNode.hasBeenVisited() && !isTerminalState) {
                currentNode.applyLeafNodesToNode({ gameState: analyzedState });
                currentNode = this.traverse({
                    gameState: analyzedState,
                    startFromNode: currentNode,
                    playerRunningTheSimulation,
                });
            }

            if (this.maxTimetoSpend < new Date().getTime() - start) {
                return this.chooseNextActionId();
            }

            const values = this.rollout({ initialState: gameState, rolloutState: analyzedState });

            if (this.maxTimetoSpend < new Date().getTime() - start) {
                return this.chooseNextActionId();
            }

            this.backPropagate({ startFromNode: currentNode, values });

            if (this.maxTimetoSpend < new Date().getTime() - start) {
                return this.chooseNextActionId();
            }

            numOfCurrentIterations += 1;
            playerRunningTheSimulation = playerRunningTheSimulation === 0 ? 1 : 0;

            if (this.numOfMaxIterations < numOfCurrentIterations) {
                return this.chooseNextActionId();
            }
        }
    }
}

export default SimultaneousMCSearch;

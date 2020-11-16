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
}) => TState;

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
    terminalState,
}: {
    isTerminalState?: boolean;
    initialState: TState;
    terminalState: TState;
}) => number[];

export type GameStateCloner<TState> = ({ gameState }: { gameState: TState }) => TState;

class MCNode<TState> {
    parent: MCNode<TState> | null;
    children: MCNode<TState>[];
    visitCount: number;
    playerActionIds: number[] | null;
    gameState: TState;
    valueSums: number[];
    cloneGameState: GameStateCloner<TState>;

    constructor({
        parent,
        playerActionIds,
        gameState,
        cloneGameState,
    }: {
        parent: MCNode<TState> | null;
        playerActionIds: number[] | null;
        gameState: TState;
        cloneGameState: GameStateCloner<TState>;
    }) {
        this.parent = parent;
        this.children = [];
        this.visitCount = 0;
        this.playerActionIds = playerActionIds;
        this.gameState = gameState;
        this.valueSums = [0, 0];
        this.cloneGameState = cloneGameState;
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

    applyLeafNodes({
        getValidPlayerActionIdPairs,
        applyPlayerActionsToGameState,
    }: {
        getValidPlayerActionIdPairs: ValidPlayerActionIdPairsGetter<TState>;
        applyPlayerActionsToGameState: PlayerActionsToGameStateApplier<TState>;
    }): void {
        const validPlayerActionIdPairs = getValidPlayerActionIdPairs({
            gameState: this.gameState,
        });

        validPlayerActionIdPairs.forEach((validPlayerActionIdPair /*, index */) => {
            const child = new MCNode({
                parent: this,
                playerActionIds: validPlayerActionIdPair,
                gameState: applyPlayerActionsToGameState({
                    gameState: this.gameState,
                    playerActionIds: validPlayerActionIdPair,
                }),
                cloneGameState: this.cloneGameState,
            });

            this.children.push(child);
        });
    }

    getMaxUCBNode({
        cConst,
        playerRunningTheSimulation,
    }: {
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

        return this.children[chosenNodeIndex];
    }

    clone(): MCNode<TState> {
        return new MCNode({
            parent: this.parent,
            playerActionIds: this.playerActionIds,
            gameState: this.cloneGameState({ gameState: this.gameState }),
            cloneGameState: this.cloneGameState,
        });
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
        startState,
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
        startState: TState;
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
            gameState: startState,
            playerActionIds: null,
            cloneGameState: this.cloneGameState,
        });
        this.rootNode.applyLeafNodes({
            getValidPlayerActionIdPairs: this.getValidPlayerActionIdPairs,
            applyPlayerActionsToGameState: this.applyPlayerActionsToGameState,
        });
    }

    traverse({
        startFromNode,
        playerRunningTheSimulation,
    }: {
        startFromNode: MCNode<TState>;
        playerRunningTheSimulation: number;
    }): MCNode<TState> {
        let currentNode = startFromNode;
        while (!currentNode.isLeafNode()) {
            currentNode = currentNode.getMaxUCBNode({
                cConst: this.cConst,
                playerRunningTheSimulation,
            });
        }
        return currentNode;
    }

    rollout(startFromNode: MCNode<TState>): number[] {
        let currentRolloutSteps = 0;
        let currentNode = startFromNode.clone();

        while (true) {
            currentRolloutSteps += 1;

            const isTerminalState = this.checkIfTerminalState({
                initialState: this.rootNode.gameState,
                currentState: currentNode.gameState,
            });

            if (isTerminalState) {
                return this.getOutcomeValues({
                    isTerminalState: true,
                    initialState: this.rootNode.gameState,
                    terminalState: currentNode.gameState,
                });
            }

            const reachedMaximumRollout = this.maxRolloutSteps < currentRolloutSteps;

            if (reachedMaximumRollout) {
                return this.getOutcomeValues({
                    initialState: this.rootNode.gameState,
                    terminalState: currentNode.gameState,
                });
            }

            const validPlayerActionIdPairs = this.getValidPlayerActionIdPairs({
                gameState: currentNode.gameState,
            });

            const randomlyChosenActionIdPair =
                validPlayerActionIdPairs[
                    Math.floor(Math.random() * validPlayerActionIdPairs.length)
                ];

            currentNode = new MCNode<TState>({
                parent: currentNode,
                playerActionIds: randomlyChosenActionIdPair,
                gameState: this.applyPlayerActionsToGameState({
                    gameState: currentNode.gameState,
                    playerActionIds: randomlyChosenActionIdPair,
                }),
                cloneGameState: this.cloneGameState,
            });
        }
    }

    backPropagate({ node, values }: { node: MCNode<TState>; values: number[] }): void {
        values.forEach((value, index) => {
            node.valueSums[index] += value;
        });
        node.visitCount = node.visitCount + 1;
        if (node.parent === null) {
            return;
        }
        this.backPropagate({ node: node.parent, values });
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

        // console.error(groupedWinrates);

        const playerActionIds = Object.keys(groupedWinrates);
        let chosenActionId = -1;
        let chosenActionWinPercentage = -1;

        //  console.error(groupedWinrates);

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

    run(): number {
        let numOfCurrentIterations = 0;
        const start = new Date().getTime();
        let playerRunningTheSimulation = 0;
        while (true) {
            if (this.maxTimetoSpend < new Date().getTime() - start) {
                return this.chooseNextActionId();
            }

            let currentNode = this.traverse({
                startFromNode: this.rootNode,
                playerRunningTheSimulation,
            });

            if (this.maxTimetoSpend < new Date().getTime() - start) {
                return this.chooseNextActionId();
            }

            const isTerminalState = this.checkIfTerminalState({
                initialState: this.rootNode.gameState,
                currentState: currentNode.gameState,
            });

            if (currentNode.hasBeenVisited() && !isTerminalState) {
                currentNode.applyLeafNodes({
                    getValidPlayerActionIdPairs: this.getValidPlayerActionIdPairs,
                    applyPlayerActionsToGameState: this.applyPlayerActionsToGameState,
                });
                currentNode = this.traverse({
                    startFromNode: currentNode,
                    playerRunningTheSimulation,
                });
            }

            if (this.maxTimetoSpend < new Date().getTime() - start) {
                return this.chooseNextActionId();
            }

            const values = this.rollout(currentNode);

            if (this.maxTimetoSpend < new Date().getTime() - start) {
                return this.chooseNextActionId();
            }

            this.backPropagate({ node: currentNode, values });

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

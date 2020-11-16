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

interface MCNode {
    visitCount: number;
    playerActionIds: number[] | null;
    valueSums: number[];
    chosenChildIndex: number | null;
    children: MCNode[];
}

class SimultaneousMCSearchSimulator<TState> {
    rootNode: MCNode;
    pointer: MCNode;
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
        this.rootNode = {
            visitCount: 0,
            playerActionIds: null,
            valueSums: [0, 0],
            chosenChildIndex: null,
            children: [],
        };
    }

    hasBeenVisited(node: MCNode): boolean {
        return node.visitCount > 0;
    }

    isLeafNode(node: MCNode): boolean {
        return node.children.length === 0;
    }

    getValue({ playerIndex, node }: { playerIndex: number; node: MCNode }): number {
        if (node.visitCount === 0) {
            return Infinity;
        }
        return node.valueSums[playerIndex] / node.visitCount;
    }

    getMaxUCBChildIndex({
        node,
        gameState,
        cConst,
        playerRunningTheSimulation,
    }: {
        node: MCNode;
        gameState: TState;
        cConst: number;
        playerRunningTheSimulation: number;
    }): number {
        let chosenNodeIndex = -1;
        let chosenNodeValue = -Infinity;

        node.children.forEach((child, index) => {
            const nodeUCBValue =
                child.visitCount === 0
                    ? Infinity
                    : this.getValue({ node: child, playerIndex: playerRunningTheSimulation }) +
                      cConst * Math.sqrt(Math.log(node.visitCount) / child.visitCount);

            if (chosenNodeValue < nodeUCBValue) {
                chosenNodeIndex = index;
                chosenNodeValue = nodeUCBValue;
            }
        });

        const chosenChild = node.children[chosenNodeIndex];

        if (chosenChild.playerActionIds === null) {
            throw new Error(`Accessing null`);
        }

        this.applyPlayerActionsToGameState({
            gameState,
            playerActionIds: chosenChild.playerActionIds,
        });

        return chosenNodeIndex;
    }

    traverse({
        gameState,
        startFromNode,
        playerRunningTheSimulation,
    }: {
        gameState: TState;
        startFromNode: MCNode;
        playerRunningTheSimulation: number;
    }): MCNode {
        let currentNode = startFromNode;
        while (!this.isLeafNode(currentNode)) {
            const chosenChildIndex = this.getMaxUCBChildIndex({
                node: currentNode,
                gameState,
                cConst: this.cConst,
                playerRunningTheSimulation,
            });

            currentNode.chosenChildIndex = chosenChildIndex;
            currentNode = currentNode.children[chosenChildIndex];
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

    backPropagate({ startFromNode, values }: { startFromNode: MCNode; values: number[] }): void {
        values.forEach((value, index) => {
            startFromNode.valueSums[index] += value;
        });
        startFromNode.visitCount += 1;
        if (startFromNode.chosenChildIndex === null) {
            return;
        }
        const nextNode = startFromNode.children[startFromNode.chosenChildIndex];
        startFromNode.chosenChildIndex = null;
        this.backPropagate({ startFromNode: nextNode, values });
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

    applyLeafNodesToNode({ gameState, node }: { gameState: TState; node: MCNode }): void {
        this.getValidPlayerActionIdPairs({ gameState }).forEach(validPlayerActionIdPair => {
            node.children.push({
                visitCount: 0,
                playerActionIds: validPlayerActionIdPair,
                valueSums: [0, 0],
                chosenChildIndex: null,
                children: [],
            });
        });
    }

    run({ gameState }: { gameState: TState }): number {
        let numOfCurrentIterations = 0;
        const start = new Date().getTime();
        let playerRunningTheSimulation = 0;

        while (true) {
            if (this.maxTimetoSpend < new Date().getTime() - start) {
                console.error(`ran ${numOfCurrentIterations} simulations`);
                return this.chooseNextActionId();
            }
            this.pointer = this.rootNode;
            const analyzedState = this.cloneGameState({ gameState });

            this.pointer = this.traverse({
                gameState: analyzedState,
                startFromNode: this.pointer,
                playerRunningTheSimulation,
            });

            if (this.maxTimetoSpend < new Date().getTime() - start) {
                console.error(`ran ${numOfCurrentIterations} simulations`);
                return this.chooseNextActionId();
            }

            const isTerminalState = this.checkIfTerminalState({
                initialState: gameState,
                currentState: analyzedState,
            });

            if (this.hasBeenVisited(this.pointer) && !isTerminalState) {
                this.applyLeafNodesToNode({ node: this.pointer, gameState: analyzedState });
                this.pointer = this.traverse({
                    gameState: analyzedState,
                    startFromNode: this.pointer,
                    playerRunningTheSimulation,
                });
            }

            if (this.maxTimetoSpend < new Date().getTime() - start) {
                console.error(`ran ${numOfCurrentIterations} simulations`);
                return this.chooseNextActionId();
            }

            const values = this.rollout({ initialState: gameState, rolloutState: analyzedState });

            if (this.maxTimetoSpend < new Date().getTime() - start) {
                console.error(`ran ${numOfCurrentIterations} simulations`);
                return this.chooseNextActionId();
            }

            this.backPropagate({ startFromNode: this.rootNode, values });

            if (this.maxTimetoSpend < new Date().getTime() - start) {
                console.error(`ran ${numOfCurrentIterations} simulations`);
                return this.chooseNextActionId();
            }

            numOfCurrentIterations += 1;
            playerRunningTheSimulation = playerRunningTheSimulation === 0 ? 1 : 0;

            if (this.numOfMaxIterations < numOfCurrentIterations) {
                console.error(`ran ${numOfCurrentIterations} simulations`);
                return this.chooseNextActionId();
            }
        }
    }
}

export default SimultaneousMCSearchSimulator;

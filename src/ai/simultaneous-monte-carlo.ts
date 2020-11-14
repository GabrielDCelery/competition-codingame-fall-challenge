// import { joinPlayerActionIds } from '../utils';

export type ValidPlayerActionIdPairsGetter<TState> = ({
    gameState,
}: {
    gameState: TState;
}) => string[][];

export type PlayerActionsToGameStateApplier<TState> = ({
    gameState,
    playerActionIds,
}: {
    gameState: TState;
    playerActionIds: string[];
}) => TState;

export type TerminalStateChecker<TState> = ({
    initialState,
    currentState,
}: {
    initialState: TState;
    currentState: TState;
}) => boolean;

export type OutcomeValuesGetter<TState> = ({
    initialState,
    terminalState,
}: {
    initialState: TState;
    terminalState: TState;
}) => number[];

export type GameStateCloner<TState> = ({ gameState }: { gameState: TState }) => TState;

class MCNode<TState> {
    parent: MCNode<TState> | null;
    children: MCNode<TState>[];
    visitCount: number;
    playerActionIds: string[] | null;
    gameState: TState;
    valueSums: number[];
    actionIdsToChildrenIndexesMap: { [index: string]: number };
    cloneGameState: GameStateCloner<TState>;

    constructor({
        parent,
        playerActionIds,
        gameState,
        cloneGameState,
    }: {
        parent: MCNode<TState> | null;
        playerActionIds: string[] | null;
        gameState: TState;
        cloneGameState: GameStateCloner<TState>;
    }) {
        this.parent = parent;
        this.children = [];
        this.visitCount = 0;
        this.playerActionIds = playerActionIds;
        this.gameState = gameState;
        this.valueSums = [0, 0];
        this.actionIdsToChildrenIndexesMap = {};
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
            /*
            this.actionIdsToChildrenIndexesMap[
                joinPlayerActionIds(validPlayerActionIdPair)
            ] = index;
            */
            this.children.push(child);
        });
    }
    /*
    getMaxUCBNode({ cConst }: { cConst: number }): MCNode<TState> {
        console.log('--- getMaxUCBNode ---');
        const playerIndexes = [0, 1];
        const chosenNodeIndexes = [-1, -1];
        const chosenNodeValues = [-Infinity, -Infinity];

        this.children.forEach((child, index) => {
            playerIndexes.forEach(playerIndex => {
                const nodeUCBValue =
                    child.visitCount === 0
                        ? Infinity
                        : child.getValue({ playerIndex }) +
                          cConst * Math.sqrt(Math.log(this.visitCount) / child.visitCount);

                if (
                    playerIndex === 0 &&
                    child.visitCount !== 0 &&
                    chosenNodeValues[playerIndex] < nodeUCBValue
                ) {
                    //  console.log(`${chosenNodeValues[playerIndex]} - ${nodeUCBValue}`);
                    console.log(child.playerActionIds);
                    console.log(child.getValue({ playerIndex }));
                }
                if (chosenNodeValues[playerIndex] < nodeUCBValue) {
                    chosenNodeIndexes[playerIndex] = index;
                    chosenNodeValues[playerIndex] = nodeUCBValue;
                }
            });
        });

        const chodenActionIds = playerIndexes.map(playerIndex => {
            const chosenNodeIndex = chosenNodeIndexes[playerIndex];
            const chosenNode = this.children[chosenNodeIndex];
            if (chosenNode.playerActionIds === null) {
                throw new Error(`Tried to access null`);
            }
            return chosenNode.playerActionIds[playerIndex];
        });

        const maxUCBNodeIndex = this.actionIdsToChildrenIndexesMap[
            joinPlayerActionIds(chodenActionIds)
        ];

        return this.children[maxUCBNodeIndex];
    }
    */

    getMaxUCBNode({ cConst }: { cConst: number }): MCNode<TState> {
        const playerIndexes = [0, 1];
        let chosenNodeIndex = -1;
        let chosenNodeValue = -Infinity;

        this.children.forEach((child, index) => {
            let totalNodeUCBValue = 0;

            playerIndexes.forEach(playerIndex => {
                totalNodeUCBValue +=
                    child.visitCount === 0
                        ? Infinity
                        : child.getValue({ playerIndex }) +
                          cConst * Math.sqrt(Math.log(this.visitCount) / child.visitCount);
            });

            if (chosenNodeValue < totalNodeUCBValue) {
                chosenNodeIndex = index;
                chosenNodeValue = totalNodeUCBValue;
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

    traverse(startFromNode: MCNode<TState>): MCNode<TState> {
        let currentNode = startFromNode;
        while (!currentNode.isLeafNode()) {
            currentNode = currentNode.getMaxUCBNode({ cConst: this.cConst });
        }
        return currentNode;
    }

    rollout(startFromNode: MCNode<TState>): number[] {
        let currentRolloutSteps = 0;
        let currentNode = startFromNode.clone();

        while (true) {
            currentRolloutSteps += 1;

            const reachedMaximumRollout = this.maxRolloutSteps < currentRolloutSteps;
            if (reachedMaximumRollout) {
                return this.getOutcomeValues({
                    initialState: this.rootNode.gameState,
                    terminalState: currentNode.gameState,
                });
            }

            const isTerminalState = this.checkIfTerminalState({
                initialState: this.rootNode.gameState,
                currentState: currentNode.gameState,
            });

            if (isTerminalState) {
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

    chooseNextActionId(): string {
        let chosenNodeIndex = 0;
        let chosenNodeValue = 0;
        this.rootNode.children.forEach((child, index) => {
            const nodeValue = child.visitCount;

            if (chosenNodeValue < nodeValue) {
                chosenNodeIndex = index;
                chosenNodeValue = nodeValue;
            }
        });
        const chosenNode = this.rootNode.children[chosenNodeIndex];
        if (chosenNode.playerActionIds === null) {
            throw new Error(`Tried to pick action from rootnode`);
        }
        return chosenNode.playerActionIds[0];
    }

    run(): string {
        let numOfCurrentIterations = 0;
        const start = new Date().getTime();
        let keepRunning = true;
        while (keepRunning) {
            let currentNode = this.traverse(this.rootNode);

            const isTerminalState = this.checkIfTerminalState({
                initialState: this.rootNode.gameState,
                currentState: currentNode.gameState,
            });

            if (currentNode.hasBeenVisited() && !isTerminalState) {
                currentNode.applyLeafNodes({
                    getValidPlayerActionIdPairs: this.getValidPlayerActionIdPairs,
                    applyPlayerActionsToGameState: this.applyPlayerActionsToGameState,
                });
                currentNode = this.traverse(currentNode);
            }

            const values = this.rollout(currentNode);

            this.backPropagate({ node: currentNode, values });

            numOfCurrentIterations += 1;
            const elapsed = new Date().getTime() - start;
            keepRunning =
                numOfCurrentIterations < this.numOfMaxIterations && elapsed < this.maxTimetoSpend;
        }
        return this.chooseNextActionId();
    }
}

export default SimultaneousMCSearch;

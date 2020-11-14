export type ValidPlayerActionIdsGetter<TState> = ({
    gameState,
    playerId,
}: {
    gameState: TState;
    playerId: string;
}) => string[];

export type PlayerActionToGameStateApplier<TState> = ({
    gameState,
    playerActionId,
    playerId,
    removeTakenActionFromPool,
}: {
    gameState: TState;
    playerActionId: string;
    playerId: string;
    removeTakenActionFromPool: boolean;
}) => TState;

export type TerminalStateChecker<TState> = ({
    activePlayerChoseTheSameAction,
    activePlayerId,
    initialState,
    prevState,
    currentState,
}: {
    activePlayerChoseTheSameAction: boolean;
    activePlayerId: string;
    initialState: TState;
    prevState: TState;
    currentState: TState;
}) => boolean;

export type OutcomeValuesGetter<TState> = ({
    initialState,
    terminalState,
}: {
    initialState: TState;
    terminalState: TState;
}) => number[];

class MCNode<TState> {
    parent: MCNode<TState> | null;
    children: MCNode<TState>[];
    visitCount: number;
    playerActionId: null | string;
    gameState: TState;
    playerIds: string[];
    activePlayerIndex: number;
    valueSums: number[];

    constructor({
        parent,
        playerActionId,
        gameState,
        playerIds,
        activePlayerIndex,
    }: {
        parent: MCNode<TState> | null;
        playerActionId: string | null;
        gameState: TState;
        playerIds: string[];
        activePlayerIndex: number;
    }) {
        this.parent = parent;
        this.children = [];
        this.visitCount = 0;
        this.playerActionId = playerActionId;
        this.gameState = gameState;
        this.playerIds = playerIds;
        this.activePlayerIndex = activePlayerIndex;
        this.valueSums = [0, 0];
    }

    getValue(): number {
        if (this.visitCount === 0) {
            return Infinity;
        }
        return this.valueSums[this.getOtherPlayerIndex()] / this.visitCount;
    }

    isLeafNode(): boolean {
        return this.children.length === 0;
    }

    hasBeenVisited(): boolean {
        return this.visitCount > 0;
    }

    applyLeafNodes({
        getValidPlayerActionIds,
        applyPlayerActionToGameState,
    }: {
        getValidPlayerActionIds: ValidPlayerActionIdsGetter<TState>;
        applyPlayerActionToGameState: PlayerActionToGameStateApplier<TState>;
    }): void {
        const validPlayerActionIds = getValidPlayerActionIds({
            gameState: this.gameState,
            playerId: this.getCurrentPlayerId(),
        });
        this.children = validPlayerActionIds.map(playerActionId => {
            return new MCNode({
                parent: this,
                playerActionId,
                gameState: applyPlayerActionToGameState({
                    gameState: this.gameState,
                    playerId: this.getCurrentPlayerId(),
                    playerActionId,
                    removeTakenActionFromPool: !this.isFirstPlayer(),
                }),
                playerIds: this.playerIds,
                activePlayerIndex: this.getOtherPlayerIndex(),
            });
        });
    }

    isFirstPlayer(): boolean {
        return this.activePlayerIndex === 0;
    }

    isSecondPlayer(): boolean {
        return this.activePlayerIndex === 1;
    }

    getOtherPlayerIndex(): number {
        return this.activePlayerIndex === 0 ? 1 : 0;
    }

    getCurrentPlayerId(): string {
        return this.playerIds[this.activePlayerIndex];
    }

    getMaxUCBNode({ cConst }: { cConst: number }): MCNode<TState> {
        let chosenNodeIndex = -1;
        let chosenNodeVale = -Infinity;

        this.children.forEach((child, index) => {
            const nodeUCBValue =
                child.visitCount === 0
                    ? Infinity
                    : child.getValue() +
                      cConst * Math.sqrt(Math.log(this.visitCount) / child.visitCount);
            if (chosenNodeVale < nodeUCBValue) {
                chosenNodeIndex = index;
                chosenNodeVale = nodeUCBValue;
            }
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
    getValidPlayerActionIds: ValidPlayerActionIdsGetter<TState>;
    applyPlayerActionToGameState: PlayerActionToGameStateApplier<TState>;
    getOutcomeValues: OutcomeValuesGetter<TState>;
    checkIfTerminalState: TerminalStateChecker<TState>;

    constructor({
        startState,
        numOfMaxIterations,
        maxTimetoSpend,
        cConst,
        maxRolloutSteps,
        playerIds,
        getValidPlayerActionIds,
        applyPlayerActionToGameState,

        getOutcomeValues,
        checkIfTerminalState,
    }: {
        startState: TState;
        numOfMaxIterations: number;
        maxTimetoSpend: number;
        cConst: number;
        maxRolloutSteps: number;
        playerIds: string[];
        getValidPlayerActionIds: ValidPlayerActionIdsGetter<TState>;
        applyPlayerActionToGameState: PlayerActionToGameStateApplier<TState>;
        getOutcomeValues: OutcomeValuesGetter<TState>;
        checkIfTerminalState: TerminalStateChecker<TState>;
    }) {
        this.numOfMaxIterations = numOfMaxIterations;
        this.maxTimetoSpend = maxTimetoSpend;
        this.maxRolloutSteps = maxRolloutSteps;
        this.cConst = cConst;
        this.getValidPlayerActionIds = getValidPlayerActionIds;
        this.applyPlayerActionToGameState = applyPlayerActionToGameState;
        this.getOutcomeValues = getOutcomeValues;
        this.checkIfTerminalState = checkIfTerminalState;

        this.rootNode = new MCNode<TState>({
            parent: null,
            gameState: startState,
            playerActionId: null,
            playerIds,
            activePlayerIndex: 0,
        });
        this.rootNode.applyLeafNodes({
            getValidPlayerActionIds: this.getValidPlayerActionIds,
            applyPlayerActionToGameState: this.applyPlayerActionToGameState,
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
        let isTerminalState = false;
        let currentNode = startFromNode;

        while (!isTerminalState && currentRolloutSteps < this.maxRolloutSteps) {
            currentRolloutSteps += 1;

            const validPlayerActionIds = this.getValidPlayerActionIds({
                gameState: currentNode.gameState,
                playerId: currentNode.getCurrentPlayerId(),
            });

            if (validPlayerActionIds.length === 0) {
                console.log(currentNode.getCurrentPlayerId());
                console.log(JSON.stringify(currentNode.gameState));
            }

            const randomlyChosenActionId =
                validPlayerActionIds[Math.floor(Math.random() * validPlayerActionIds.length)];

            const nextNode = new MCNode({
                parent: currentNode,
                playerActionId: randomlyChosenActionId,
                gameState: this.applyPlayerActionToGameState({
                    gameState: currentNode.gameState,
                    playerId: currentNode.getCurrentPlayerId(),
                    playerActionId: randomlyChosenActionId,
                    removeTakenActionFromPool: !currentNode.isFirstPlayer(),
                }),
                playerIds: currentNode.playerIds,
                activePlayerIndex: currentNode.getOtherPlayerIndex(),
            });

            isTerminalState = this.checkIfTerminalState({
                activePlayerChoseTheSameAction:
                    currentNode.playerActionId === nextNode.playerActionId,
                activePlayerId: nextNode.getCurrentPlayerId(),
                initialState: this.rootNode.gameState,
                prevState: currentNode.gameState,
                currentState: nextNode.gameState,
            });

            currentNode = nextNode;
        }

        return this.getOutcomeValues({
            initialState: this.rootNode.gameState,
            terminalState: currentNode.gameState,
        });
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
        let chosenNodeVale = 0;
        this.rootNode.children.forEach((child, index) => {
            const nodeValue = child.getValue();

            if (chosenNodeVale < nodeValue) {
                chosenNodeIndex = index;
                chosenNodeVale = nodeValue;
            }
        });
        const chosenNode = this.rootNode.children[chosenNodeIndex];
        return chosenNode.playerActionId as string;
    }

    run(): string {
        let numOfCurrentIterations = 0;
        const start = new Date().getTime();
        let keepRunning = true;
        while (keepRunning) {
            let currentNode = this.traverse(this.rootNode);

            if (currentNode.hasBeenVisited()) {
                currentNode.applyLeafNodes({
                    getValidPlayerActionIds: this.getValidPlayerActionIds,
                    applyPlayerActionToGameState: this.applyPlayerActionToGameState,
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

export type PlayerActionToStateApplier<TState, TAction> = ({
    state,
    action,
    playerId,
}: {
    state: TState;
    action: TAction;
    playerId: string;
}) => TState;

export type StateScorer<TState> = ({
    numOfSteps,
    initialState,
    terminalState,
}: {
    numOfSteps: number;
    initialState: TState;
    terminalState: TState;
}) => number;

export type TerminalStateChecker<TState> = ({
    initialState,
    prevState,
    currentState,
}: {
    initialState: TState;
    prevState: TState;
    currentState: TState;
}) => boolean;

export type StateCloner<TState> = (state: TState) => TState;

export type OpponentIdGetter = (playerId: string) => string;

export type ValidPlayerActionsGetter<TState> = ({
    gameState,
    playerId,
    removeTakenActionFromPool,
}: {
    gameState: TState;
    playerId: string;
    removeTakenActionFromPool: boolean;
}) => { playerActionId: string; newGameState: TState }[];

class MCNode<TState> {
    parent: MCNode<TState> | null;
    children: MCNode<TState>[];
    visitCount: number;
    valueSum: number;
    playerActionId: null | string;
    gameState: TState;
    playerIds: string[];
    activePlayerIndex: number;
    playerScores: number[];

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
        this.valueSum = 0;
        this.playerActionId = playerActionId;
        this.gameState = gameState;
        this.playerIds = playerIds;
        this.activePlayerIndex = activePlayerIndex;
        this.playerScores = new Array(this.playerIds.length).fill(null).map(() => 0);
    }

    getValue(): number {
        if (this.visitCount === 0) {
            return Infinity;
        }
        return this.valueSum / this.visitCount;
    }

    isLeafNode(): boolean {
        return this.children.length === 0;
    }

    hasBeenVisited(): boolean {
        return this.visitCount > 0;
    }

    applyLeafNodes({
        getValidPlayerActions,
    }: {
        getValidPlayerActions: ValidPlayerActionsGetter<TState>;
    }): void {
        const playerId = this.playerIds[this.activePlayerIndex];
        const validPlayerActions = getValidPlayerActions({
            gameState: this.gameState,
            playerId,
            removeTakenActionFromPool: !this.isFirstPlayer(),
        });
        const nextActivePlayerIndex = this.getNextActivePlayerIndex();
        this.children = validPlayerActions.map(({ playerActionId, newGameState }) => {
            return new MCNode({
                parent: this,
                playerActionId,
                gameState: newGameState,
                playerIds: this.playerIds,
                activePlayerIndex: nextActivePlayerIndex,
            });
        });
    }

    isFirstPlayer(): boolean {
        return this.activePlayerIndex === 0;
    }

    getNextActivePlayerIndex(): number {
        return this.playerIds[this.activePlayerIndex + 1] === undefined
            ? 0
            : this.activePlayerIndex + 1;
    }

    getMaxUCBNode(cConst: number): MCNode<TState> {
        let chosenNodeIndex = -1;
        let chosenNodeVale = -1;

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

class SimultaneousMCSearch<TState, TAction> {
    rootNode: MCNode<TState, TAction>;
    numOfMaxIterations: number;
    maxTimetoSpend: number;
    maxRolloutSteps: number;
    availableActions: TAction[];
    cConst: number;
    applyPlayerActionToState: PlayerActionToStateApplier<TState, TAction>;
    scoreState: StateScorer<TState>;
    checkIfTerminalState: TerminalStateChecker<TState>;
    cloneState: StateCloner<TState>;
    getValidPlayerActions: ValidPlayerActionsGetter<TState>;

    constructor({
        startState,
        numOfMaxIterations,
        maxTimetoSpend,
        availableActions,
        cConst,
        maxRolloutSteps,
        playerIds,
        applyPlayerActionToState,
        scoreState,
        checkIfTerminalState,
        cloneState,
        getValidPlayerActions,
    }: {
        startState: TState;
        numOfMaxIterations: number;
        maxTimetoSpend: number;
        availableActions: TAction[];
        cConst: number;
        maxRolloutSteps: number;
        playerIds: string[];
        applyPlayerActionToState: PlayerActionToStateApplier<TState, TAction>;
        scoreState: StateScorer<TState>;
        checkIfTerminalState: TerminalStateChecker<TState>;
        cloneState: StateCloner<TState>;
        getOpponentId: OpponentIdGetter;
        getValidPlayerActions: ValidPlayerActionsGetter<TState>;
    }) {
        this.numOfMaxIterations = numOfMaxIterations;
        this.maxTimetoSpend = maxTimetoSpend;
        this.maxRolloutSteps = maxRolloutSteps;
        this.availableActions = availableActions;
        this.cConst = cConst;
        this.applyPlayerActionToState = applyPlayerActionToState;
        this.scoreState = scoreState;
        this.checkIfTerminalState = checkIfTerminalState;
        this.cloneState = cloneState;
        this.getValidPlayerActions = getValidPlayerActions;
        this.rootNode = new MCNode<TState, TAction>({
            parent: null,
            state: startState,
            action: null,
            playerIds,
            activePlayerIndex: 0,
        });
        this.rootNode.applyLeafNodes(this.availableActions, this.applyPlayerActionToState);
    }

    traverse(startFromNode: MCNode<TState, TAction>): MCNode<TState, TAction> {
        let currentNode = startFromNode;
        while (!currentNode.isLeafNode()) {
            currentNode = currentNode.getMaxUCBNode(this.cConst);
        }
        return currentNode;
    }

    rollout(startFromNode: MCNode<TState, TAction>): number {
        let currentRolloutSteps = 0;
        let isTerminalState = false;
        let prevState = startFromNode.state;
        let playerId = startFromNode.playerId;
        while (!isTerminalState && currentRolloutSteps < this.maxRolloutSteps) {
            currentRolloutSteps += 1;
            const randomlyChosenAction = this.availableActions[
                Math.floor(Math.random() * this.availableActions.length)
            ];
            const currentState = this.applyPlayerActionToState({
                state: prevState,
                action: randomlyChosenAction,
                playerId: playerId,
            });
            isTerminalState = this.checkIfTerminalState({
                initialState: this.rootNode.state,
                prevState,
                currentState,
            });
            prevState = currentState;
            playerId = this.getOpponentId(playerId);
        }

        return this.scoreState({
            numOfSteps: currentRolloutSteps,
            initialState: this.rootNode.state,
            terminalState: prevState,
        });
    }

    backPropagate(startFromNode: MCNode<TState, TAction>, value: number): void {
        startFromNode.valueSum = startFromNode.valueSum + value;
        startFromNode.visitCount = startFromNode.visitCount + 1;
        if (startFromNode.parent === null) {
            return;
        }
        this.backPropagate(startFromNode.parent, value);
    }

    chooseNextAction(): TAction {
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
        return chosenNode.action as TAction;
    }

    run(): TAction {
        let numOfCurrentIterations = 0;
        const start = new Date().getTime();
        let keepRunning = true;
        while (keepRunning) {
            let currentNode = this.traverse(this.rootNode);

            if (currentNode.hasBeenVisited()) {
                currentNode.applyLeafNodes(this.availableActions, this.applyPlayerActionToState);
                currentNode = this.traverse(currentNode);
            }

            const value = this.rollout(currentNode);

            this.backPropagate(currentNode, value);

            numOfCurrentIterations += 1;
            const elapsed = new Date().getTime() - start;
            keepRunning =
                numOfCurrentIterations < this.numOfMaxIterations && elapsed < this.maxTimetoSpend;
        }
        return this.chooseNextAction();
    }
}

export default SimultaneousMCSearch;

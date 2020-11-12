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

class MCNode<TState, TAction> {
    parent: MCNode<TState, TAction> | null;
    children: MCNode<TState, TAction>[];
    visitCount: number;
    valueSum: number;
    action: null | TAction;
    state: TState;
    playerId: string;

    constructor({
        parent,
        action,
        state,
        playerId,
    }: {
        parent: MCNode<TState, TAction> | null;
        action: TAction | null;
        state: TState;
        playerId: string;
    }) {
        this.parent = parent;
        this.children = [];
        this.visitCount = 0;
        this.valueSum = 0;
        this.action = action;
        this.state = state;
        this.playerId = playerId;
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

    applyLeafNodes(
        availableActions: TAction[],
        applyPlayerActionToState: PlayerActionToStateApplier<TState, TAction>,
        getOpponentId: OpponentIdGetter
    ): void {
        this.children = availableActions.map(availableAction => {
            return new MCNode({
                parent: this,
                action: availableAction,
                state: applyPlayerActionToState({
                    state: this.state,
                    action: availableAction,
                    playerId: this.playerId,
                }),
                playerId: getOpponentId(this.playerId),
            });
        });
    }

    getMaxUCBNode(cConst: number): MCNode<TState, TAction> {
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

class MCSearch<TState, TAction> {
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
    getOpponentId: OpponentIdGetter;

    constructor({
        startState,
        numOfMaxIterations,
        maxTimetoSpend,
        availableActions,
        cConst,
        maxRolloutSteps,
        initialPlayerId,
        applyPlayerActionToState,
        scoreState,
        checkIfTerminalState,
        cloneState,
        getOpponentId,
    }: {
        startState: TState;
        numOfMaxIterations: number;
        maxTimetoSpend: number;
        availableActions: TAction[];
        cConst: number;
        maxRolloutSteps: number;
        initialPlayerId: string;
        applyPlayerActionToState: PlayerActionToStateApplier<TState, TAction>;
        scoreState: StateScorer<TState>;
        checkIfTerminalState: TerminalStateChecker<TState>;
        cloneState: StateCloner<TState>;
        getOpponentId: OpponentIdGetter;
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
        this.getOpponentId = getOpponentId;
        this.rootNode = new MCNode<TState, TAction>({
            parent: null,
            state: startState,
            action: null,
            playerId: initialPlayerId,
        });
        this.rootNode.applyLeafNodes(
            this.availableActions,
            this.applyPlayerActionToState,
            this.getOpponentId
        );
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
                currentNode.applyLeafNodes(
                    this.availableActions,
                    this.applyPlayerActionToState,
                    this.getOpponentId
                );
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

export default MCSearch;

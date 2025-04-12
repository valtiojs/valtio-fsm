export type TaskContext = Record<string, unknown>

export type StateConfig<TState extends string, TContext> = {
	[key in TState]?: {
		transitions: TState[]
		onEnter?: (context: TContext, payload?: unknown) => void
		onExit?: (context: TContext, payload?: unknown) => void
	}
}
export interface TransitionHistoryItem<TState extends string> {
	from: TState
	to: TState
	timestamp: number
	payload?: unknown
}
export type TransitionListener<TState extends string> = (
	from: TState,
	to: TState,
	payload?: unknown,
) => void
export type StateCallback<TContext> = (context: TContext) => void
export type ContextChangeListener<TContext> = (
	context: TContext,
	changes: { key: string; value: unknown; previousValue: unknown }[],
) => void

export interface MachineStore<
	TState extends string,
	TContext extends Record<string, unknown>,
> {
	state: TState
	context: TContext
	history: TransitionHistoryItem<TState>[]
	historyEnabled: boolean
	historySize: number
}

export interface ChainableStateMachine<
	TState extends string,
	TContext extends Record<string, unknown>,
> {
	readonly current: TState
	readonly context: TContext
	getStore(): MachineStore<TState, TContext>
	moveTo(
		state: TState,
		payload?: unknown,
	): ChainableStateMachine<TState, TContext>
	resetContext(): ChainableStateMachine<TState, TContext>

	isIn(state: TState): boolean
	canMoveTo(state: TState): boolean

	onTransition(
		listener: TransitionListener<TState>,
	): ChainableStateMachine<TState, TContext>
	whenIn(
		state: TState,
		callback: StateCallback<TContext>,
	): ChainableStateMachine<TState, TContext>
	onContextChange(listener: ContextChangeListener<TContext>): () => void

	setTransitions(
		state: TState,
		transitions: TState[],
	): ChainableStateMachine<TState, TContext>
	addTransition(
		state: TState,
		transition: TState,
	): ChainableStateMachine<TState, TContext>
	removeTransition(
		state: TState,
		transition: TState,
	): ChainableStateMachine<TState, TContext>
	setHandler(
		state: TState,
		type: "onEnter" | "onExit",
		handler: (context: TContext, payload?: unknown) => void,
	): ChainableStateMachine<TState, TContext>

	getHistory(): TransitionHistoryItem<TState>[]
	clearHistory(): ChainableStateMachine<TState, TContext>
	enableHistory(enable?: boolean): ChainableStateMachine<TState, TContext>
	setHistorySize(size: number): ChainableStateMachine<TState, TContext>
	on(
		eventName: string,
		handler: EventHandler<TContext>,
	): ChainableStateMachine<TState, TContext>
	once(
		eventName: string,
		handler: EventHandler<TContext>,
	): ChainableStateMachine<TState, TContext>
	off(
		eventName: string,
		handler?: EventHandler<TContext>,
	): ChainableStateMachine<TState, TContext>
	fire(
		eventName: string,
		payload?: unknown,
	): ChainableStateMachine<TState, TContext>
}
export interface MachineOptions<TState extends string> {
	enableHistory?: boolean
	historySize?: number
	onTransition?: TransitionListener<TState>
}

// In your types file
export type EventHandler<TContext extends Record<string, unknown>> = (
	context: TContext,
	payload?: unknown,
) => void

export interface EventHandlers<TContext extends Record<string, unknown>> {
	[eventName: string]: Set<EventHandler<TContext>>
}

export interface InternalMachine<
	TState extends string,
	TContext extends Record<string, unknown>,
> {
	current: TState
	context: TContext
	historyEnabled: boolean
	historySize: number
	transitionListeners: Set<
		(from: TState, to: TState, payload?: unknown) => void
	>
	stateCallbacks: Map<TState, Set<(context: TContext) => void>>
	contextListeners: Set<(context: TContext, changes: unknown[]) => void>
	previousContextSnapshot: unknown
	eventHandlers: Record<string, Set<EventHandler<TContext>>>
	oneTimeEventHandlers: Record<string, Set<EventHandler<TContext>>>
}

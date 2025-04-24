/**
 * Base type for storing context data in a state machine
 */
export type TaskContext = Record<string, unknown>

/**
 * Configuration for state machine states
 * @template TState - String literal type representing valid states
 * @template TContext - Context data type for the state machine
 */
export type StateConfig<TState extends string, TContext> = {
	[key in TState]?: {
		/** List of states that can be transitioned to from this state */
		transitions: TState[]
		/** Handler called when entering this state */
		onEnter?: (context: TContext, payload?: unknown) => void
		/** Handler called when exiting this state */
		onExit?: (context: TContext, payload?: unknown) => void
	}
}
/**
 * Represents a historical state transition
 * @template TState - String literal type representing valid states
 */
export interface TransitionHistoryItem<TState extends string> {
	/** State transitioning from */
	from: TState
	/** State transitioning to */
	to: TState
	/** Timestamp when transition occurred */
	timestamp: number
	/** Optional data passed with transition */
	payload?: unknown
}

/**
 * Listener function called when state transitions occur
 * @template TState - String literal type representing valid states
 */
export type TransitionListener<TState extends string> = (
	from: TState,
	to: TState,
	payload?: unknown,
) => void

/**
 * Callback function triggered on specific state entry
 * @template TContext - Context data type for the state machine
 */
export type StateCallback<TContext> = (context: TContext) => void

/**
 * Listener function for context property changes
 * @template TContext - Context data type for the state machine
 */
export type ContextChangeListener<TContext> = (
	context: TContext,
	changes: { key: string; value: unknown; previousValue: unknown }[],
) => void

/**
 * Represents the internal state store used by Valtio
 * @template TState - String literal type representing valid states
 * @template TContext - Context data type for the state machine
 */
export interface MachineStore<
	TState extends string,
	TContext extends Record<string, unknown>,
> {
	/** Current state */
	state: TState
	/** Current context data */
	context: TContext
	/** List of historical transitions */
	history: TransitionHistoryItem<TState>[]
	/** Whether transition history is being tracked */
	historyEnabled: boolean
	/** Maximum number of history items to store */
	historySize: number
}

/**
 * Main interface for the state machine
 * @template TState - String literal type representing valid states
 * @template TContext - Context data type for the state machine
 */
export interface ChainableStateMachine<
	TState extends string,
	TContext extends Record<string, unknown>,
> {
	/** Current state (read-only) */
	readonly current: TState
	/** Current context data (read-only) */
	readonly context: TContext
	/** Get the internal Valtio store for use with useSnapshot */
	getStore(): MachineStore<TState, TContext>
	/** 
	 * Transition to a new state
	 * @param state - Target state
	 * @param payload - Optional data to pass to transition handlers
	 */
	moveTo(
		state: TState,
		payload?: unknown,
	): ChainableStateMachine<TState, TContext>
	/** Reset context to initial values */
	resetContext(): ChainableStateMachine<TState, TContext>

	/** 
	 * Check if machine is in a specific state
	 * @param state - State to check
	 */
	isIn(state: TState): boolean
	/**
	 * Check if transition to a specific state is allowed
	 * @param state - Target state to check
	 */
	canMoveTo(state: TState): boolean

	/**
	 * Add a listener for state transitions
	 * @param listener - Function to call on transition
	 */
	onTransition(
		listener: TransitionListener<TState>,
	): ChainableStateMachine<TState, TContext>
	/**
	 * Register a callback for a specific state
	 * @param state - State to watch
	 * @param callback - Function to call when in this state
	 */
	whenIn(
		state: TState,
		callback: StateCallback<TContext>,
	): ChainableStateMachine<TState, TContext>
	/**
	 * Add a listener for context changes
	 * @param listener - Function to call when context changes
	 * @returns Function to remove the listener
	 */
	onContextChange(listener: ContextChangeListener<TContext>): () => void

	/**
	 * Set allowed transitions for a state
	 * @param state - State to configure
	 * @param transitions - Array of allowed target states
	 */
	setTransitions(
		state: TState,
		transitions: TState[],
	): ChainableStateMachine<TState, TContext>
	/**
	 * Add a single allowed transition
	 * @param state - Source state
	 * @param transition - Target state
	 */
	addTransition(
		state: TState,
		transition: TState,
	): ChainableStateMachine<TState, TContext>
	/**
	 * Remove an allowed transition
	 * @param state - Source state
	 * @param transition - Target state to remove
	 */
	removeTransition(
		state: TState,
		transition: TState,
	): ChainableStateMachine<TState, TContext>
	/**
	 * Set a state handler (onEnter or onExit)
	 * @param state - State to configure
	 * @param type - Handler type ("onEnter" or "onExit")
	 * @param handler - Function to call
	 */
	setHandler(
		state: TState,
		type: "onEnter" | "onExit",
		handler: (context: TContext, payload?: unknown) => void,
	): ChainableStateMachine<TState, TContext>

	/** Get the transition history array */
	getHistory(): TransitionHistoryItem<TState>[]
	/** Clear transition history */
	clearHistory(): ChainableStateMachine<TState, TContext>
	/** 
	 * Enable or disable history tracking
	 * @param enable - Whether to enable history
	 */
	enableHistory(enable?: boolean): ChainableStateMachine<TState, TContext>
	/**
	 * Set maximum history size
	 * @param size - Maximum number of history items
	 */
	setHistorySize(size: number): ChainableStateMachine<TState, TContext>
	/**
	 * Register event handler
	 * @param eventName - Event name to listen for
	 * @param handler - Function to call when event fires
	 */
	on(
		eventName: string,
		handler: EventHandler<TContext>,
	): ChainableStateMachine<TState, TContext>
	/**
	 * Register one-time event handler
	 * @param eventName - Event name to listen for
	 * @param handler - Function to call when event fires (once)
	 */
	once(
		eventName: string,
		handler: EventHandler<TContext>,
	): ChainableStateMachine<TState, TContext>
	/**
	 * Remove event handler(s)
	 * @param eventName - Event name
	 * @param handler - Specific handler to remove (removes all if omitted)
	 */
	off(
		eventName: string,
		handler?: EventHandler<TContext>,
	): ChainableStateMachine<TState, TContext>
	/**
	 * Fire an event
	 * @param eventName - Event name to fire
	 * @param payload - Optional data to pass to handlers
	 */
	fire(
		eventName: string,
		payload?: unknown,
	): ChainableStateMachine<TState, TContext>
}
/**
 * Configuration options for state machine creation
 * @template TState - String literal type representing valid states
 */
export interface MachineOptions<TState extends string> {
	/** Whether to enable transition history tracking */
	enableHistory?: boolean
	/** Maximum number of history entries to keep */
	historySize?: number
	/** Initial transition listener */
	onTransition?: TransitionListener<TState>
}

/**
 * Handler function for custom events
 * @template TContext - Context data type for the state machine
 */
export type EventHandler<TContext extends Record<string, unknown>> = (
	context: TContext,
	payload?: unknown,
) => void

/**
 * Collection of event handlers by event name
 * @template TContext - Context data type for the state machine
 */
export interface EventHandlers<TContext extends Record<string, unknown>> {
	[eventName: string]: Set<EventHandler<TContext>>
}

/**
 * Internal machine state structure
 * @template TState - String literal type representing valid states
 * @template TContext - Context data type for the state machine
 */
export interface InternalMachine<
	TState extends string,
	TContext extends Record<string, unknown>,
> {
	/** Current state */
	current: TState
	/** Current context data */
	context: TContext
	/** Whether history tracking is enabled */
	historyEnabled: boolean
	/** Maximum history size */
	historySize: number
	/** Set of transition listeners */
	transitionListeners: Set<
		(from: TState, to: TState, payload?: unknown) => void
	>
	/** Map of state-specific callbacks */
	stateCallbacks: Map<TState, Set<(context: TContext) => void>>
	/** Set of context change listeners */
	contextListeners: Set<(context: TContext, changes: unknown[]) => void>
	/** Snapshot of previous context for change detection */
	previousContextSnapshot: unknown
	/** Map of event handlers by event name */
	eventHandlers: Record<string, Set<EventHandler<TContext>>>
	/** Map of one-time event handlers by event name */
	oneTimeEventHandlers: Record<string, Set<EventHandler<TContext>>>
}

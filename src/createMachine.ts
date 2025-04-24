import { proxy, subscribe } from "valtio";
import { deepClone } from "valtio/utils";
import type {
	StateConfig,
	MachineOptions,
	ChainableStateMachine,
	TransitionHistoryItem,
	EventHandler,
} from "./types";

/**
 * Creates a state machine with chainable API backed by Valtio for reactivity
 * 
 * @template TState - String literal type representing valid states
 * @template TContext - Context data type for the state machine
 * @param initialState - Starting state for the machine
 * @param stateConfig - Configuration object defining states and transitions
 * @param initialContext - Initial context data (defaults to empty object)
 * @param options - Additional configuration options
 * @returns A chainable state machine instance
 * 
 * @example
 * ```ts
 * const machine = createMachine(
 *   'idle',
 *   {
 *     idle: { transitions: ['loading'] },
 *     loading: { transitions: ['success', 'error'] },
 *     success: { transitions: ['idle'] },
 *     error: { transitions: ['idle'] }
 *   },
 *   { data: null, error: null }
 * );
 * ```
 */
const createMachine = <
	TState extends string,
	TContext extends Record<string, unknown>,
>(
	initialState: TState,
	stateConfig: StateConfig<TState, TContext>,
	initialContext: TContext = {} as TContext,
	options: MachineOptions<TState> = {},
): ChainableStateMachine<TState, TContext> => {
	// Create a deep clone of the initial context to avoid reference issues
	// Using valtio's deepClone utility to preserve functions
	const clonedInitialContext = deepClone(initialContext);

	// Create a mutable copy of the state config that we can modify
	// Using valtio's deepClone utility to preserve handler functions
	const mutableStateConfig: StateConfig<TState, TContext> = deepClone(stateConfig);

	// Set up options with defaults
	const { enableHistory = false, historySize = 100, onTransition } = options;

	// // Track transitions for debugging (only when enabled)
	// const history: TransitionHistoryItem<TState>[] = [];

	// Create a reactive store for the state, context and other machine properties
	// This will be accessible for React components via useSnapshot
	const store = proxy<{
		state: TState;
		context: TContext;
		history: TransitionHistoryItem<TState>[];
		historyEnabled: boolean;
		historySize: number;
	}>({
		state: initialState,
		context: clonedInitialContext as TContext,
		history: [],
		historyEnabled: enableHistory,
		historySize: historySize,
	});

	// Internal machine state for non-reactive parts (listeners, callbacks, etc.)
	const internalMachine = {
		transitionListeners: new Set<
			(from: TState, to: TState, payload?: unknown) => void
		>(),
		stateCallbacks: new Map<TState, Set<(context: TContext) => void>>(),
		contextListeners: new Set<
			(
				context: TContext,
				changes: { key: string; value: unknown; previousValue: unknown }[],
			) => void
		>(),
		previousContextSnapshot: JSON.parse(JSON.stringify(clonedInitialContext)),
		eventHandlers: {} as Record<string, Set<EventHandler<TContext>>>,
		oneTimeEventHandlers: {} as Record<string, Set<EventHandler<TContext>>>,
	};

	// Add initial transition listener if provided
	if (onTransition) {
		internalMachine.transitionListeners.add(onTransition);
	}

	// Create the chainable interface
	const machine: ChainableStateMachine<TState, TContext> = {
		// Expose current state and context as getters that read from the store
		get current() {
			return store.state;
		},

		get context() {
			return store.context;
		},

		// Expose the store directly - this is what you'll use with useSnapshot in React
		getStore() {
			return store;
		},

		// Move to a new state
		moveTo(state, payload = {}) {
			// Validate the transition
			const validTransitions =
				mutableStateConfig[store.state]?.transitions || [];
			if (!validTransitions.includes(state)) {
				console.warn(`Invalid transition from ${store.state} to ${state}`);
				return this;
			}

			// Store the current state before changing
			const previousState = store.state;

			// Run exit action if available
			const exitAction = mutableStateConfig[store.state]?.onExit;
			if (exitAction) exitAction(store.context, payload);

			// Record the transition in history if enabled
			if (store.historyEnabled) {
				const transitionItem = {
					from: previousState,
					to: state,
					timestamp: Date.now(),
					payload,
				};
				store.history.push(transitionItem);

				// Limit history size
				if (store.history.length > store.historySize) {
					store.history.shift(); // Remove oldest entry
				}
			}

			// Update the state
			store.state = state;

			// Call transition listeners
			if (internalMachine.transitionListeners.size > 0) {
				for (const listener of internalMachine.transitionListeners) {
					listener(previousState, state, payload);
				}
			}

			// Run enter action if available
			const enterAction = mutableStateConfig[state]?.onEnter;
			if (enterAction) enterAction(store.context, payload);

			// Call state callbacks for the new state
			const callbacks = internalMachine.stateCallbacks.get(state);
			if (callbacks) {
				for (const callback of callbacks) {
					callback(store.context);
				}
			}

			return this;
		},

		// Reset context to initial values
		resetContext() {
			// Simply replace the entire context with a fresh deep copy of the initial context
			store.context = proxy(deepClone(clonedInitialContext));
			
			return this;
		},

		// Check if in a specific state
		isIn(state) {
			return store.state === state;
		},

		// Check if can transition to a state
		canMoveTo(state) {
			const validTransitions =
				mutableStateConfig[store.state]?.transitions || [];
			return validTransitions.includes(state);
		},

		// Add transition listener
		onTransition(listener) {
			internalMachine.transitionListeners.add(listener);
			return this;
		},

		// Subscribe to specific state
		whenIn(state, callback) {
			// Get or create the callback set for this state
			if (!internalMachine.stateCallbacks.has(state)) {
				internalMachine.stateCallbacks.set(state, new Set());
			}

			const callbacks = internalMachine.stateCallbacks.get(state);
			if (callbacks) {
				callbacks.add(callback);
			}

			// Immediately call if we're already in that state
			if (store.state === state) {
				callback(store.context);
			}

			return this;
		},

		// 2. Then update the onContextChange method:
		onContextChange(listener) {
			internalMachine.contextListeners.add(listener);

			// Set up subscription to detect context changes
			const unsub = subscribe(store.context, () => {
				const currentSnapshot = JSON.parse(JSON.stringify(store.context));
				const changes: {
					key: string;
					value: unknown;
					previousValue: unknown;
				}[] = [];

				// Find all changed properties
				const allKeys = new Set([
					...Object.keys(currentSnapshot),
					...Object.keys(internalMachine.previousContextSnapshot),
				]);

				for (const key of allKeys) {
					const currentValue = currentSnapshot[key];
					const previousValue = internalMachine.previousContextSnapshot[key];

					// Check if value has changed (using JSON comparison for deep equality)
					if (JSON.stringify(currentValue) !== JSON.stringify(previousValue)) {
						changes.push({
							key,
							value: currentValue,
							previousValue,
						});
					}
				}

				// Only notify if there are actual changes
				if (changes.length > 0) {
					// Update listeners
					for (const contextListener of internalMachine.contextListeners) {
						contextListener(store.context, changes);
					}

					// Update the snapshot for next comparison
					internalMachine.previousContextSnapshot = currentSnapshot;
				}
			});

			return unsub;
		},

		// Get transition history
		getHistory() {
			return store.historyEnabled ? [...store.history] : [];
		},

		// Clear transition history
		clearHistory() {
			if (store.historyEnabled) {
				store.history = [];
			}
			return this;
		},

		// Enable or disable history tracking
		enableHistory(enable = true) {
			store.historyEnabled = enable;
			if (!enable) {
				store.history = []; // Clear history when disabling
			}
			return this;
		},

		// Set history size
		setHistorySize(size) {
			store.historySize = size;
			// Trim history if needed
			if (store.history.length > size) {
				store.history = store.history.slice(-size);
			}
			return this;
		},

		// Set allowed transitions for a state
		setTransitions(state, transitions) {
			if (!mutableStateConfig[state]) {
				mutableStateConfig[state] = { transitions: [] };
			}

			mutableStateConfig[state].transitions = [...transitions];
			return this;
		},

		// Add a single transition to a state
		addTransition(state, transition) {
			if (!mutableStateConfig[state]) {
				mutableStateConfig[state] = { transitions: [] };
			}

			if (!mutableStateConfig[state].transitions) {
				mutableStateConfig[state].transitions = [];
			}

			if (!mutableStateConfig[state].transitions.includes(transition)) {
				mutableStateConfig[state].transitions.push(transition);
			}

			return this;
		},

		// Remove a transition from a state
		removeTransition(state, transition) {
			if (
				!mutableStateConfig[state] ||
				!mutableStateConfig[state].transitions
			) {
				return this;
			}

			mutableStateConfig[state].transitions = mutableStateConfig[
				state
			].transitions.filter((t) => t !== transition);

			return this;
		},

		// Set an event handler (onEnter or onExit) for a state
		setHandler(state, type, handler) {
			if (!mutableStateConfig[state]) {
				mutableStateConfig[state] = { transitions: [] };
			}

			mutableStateConfig[state][type] = handler;
			return this;
		},

		on(eventName: string, handler: EventHandler<TContext>) {
			if (!internalMachine.eventHandlers[eventName]) {
				internalMachine.eventHandlers[eventName] = new Set();
			}

			internalMachine.eventHandlers[eventName].add(handler);
			return this;
		},

		// Register a one-time event handler
		once(eventName: string, handler: EventHandler<TContext>) {
			if (!internalMachine.oneTimeEventHandlers[eventName]) {
				internalMachine.oneTimeEventHandlers[eventName] = new Set();
			}

			internalMachine.oneTimeEventHandlers[eventName].add(handler);
			return this;
		},

		// Remove an event handler
		off(eventName: string, handler?: EventHandler<TContext>) {
			if (!handler) {
				// Remove all handlers for this event
				delete internalMachine.eventHandlers[eventName];
				delete internalMachine.oneTimeEventHandlers[eventName];
			} else {
				// Remove specific handler
				internalMachine.eventHandlers[eventName]?.delete(handler);
				internalMachine.oneTimeEventHandlers[eventName]?.delete(handler);
			}
			return this;
		},

		// Fire an event
		fire(eventName: string, payload?: unknown) {
			// Process regular handlers
			if (internalMachine.eventHandlers[eventName]) {
				for (const handler of internalMachine.eventHandlers[eventName]) {
					handler(store.context, payload);
				}
			}

			// Process one-time handlers
			if (internalMachine.oneTimeEventHandlers[eventName]) {
				const handlers = Array.from(
					internalMachine.oneTimeEventHandlers[eventName],
				);
				// Clear before executing to prevent recursion issues
				delete internalMachine.oneTimeEventHandlers[eventName];

				for (const handler of handlers) {
					handler(store.context, payload);
				}
			}

			return this;
		},
	};

	return machine;
};

export default createMachine;

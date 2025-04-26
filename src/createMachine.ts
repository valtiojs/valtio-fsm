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
 * @returns A chainable state machine instance with the following methods:
 * 
 * ## Core API
 * - {@link ChainableStateMachine.moveTo | moveTo(state, payload?)} - Transition to a new state
 * - {@link ChainableStateMachine.isIn | isIn(state)} - Check if machine is in a specific state
 * - {@link ChainableStateMachine.canMoveTo | canMoveTo(state)} - Check if transition to a specific state is allowed
 * - {@link ChainableStateMachine.getStore | getStore()} - Get the internal Valtio store for use with useSnapshot
 * - {@link ChainableStateMachine.resetContext | resetContext()} - Reset context to initial values
 * 
 * ## Event System
 * - {@link ChainableStateMachine.on | on(eventName, handler)} - Register event handler
 * - {@link ChainableStateMachine.once | once(eventName, handler)} - Register one-time event handler
 * - {@link ChainableStateMachine.off | off(eventName, handler?)} - Remove event handler(s)
 * - {@link ChainableStateMachine.fire | fire(eventName, payload?)} - Fire an event
 * 
 * ## Listeners and Callbacks
 * - {@link ChainableStateMachine.onTransition | onTransition(listener)} - Add a listener for state transitions
 * - {@link ChainableStateMachine.whenIn | whenIn(state, callback)} - Register a callback for a specific state
 * - {@link ChainableStateMachine.onContextChange | onContextChange(listener)} - Add a listener for context changes
 * 
 * ## Runtime Configuration
 * - {@link ChainableStateMachine.setTransitions | setTransitions(state, transitions)} - Set allowed transitions for a state
 * - {@link ChainableStateMachine.addTransition | addTransition(state, transition)} - Add a single allowed transition
 * - {@link ChainableStateMachine.removeTransition | removeTransition(state, transition)} - Remove an allowed transition
 * - {@link ChainableStateMachine.setHandler | setHandler(state, type, handler)} - Set a state handler (onEnter or onExit)
 * 
 * ## History Management
 * - {@link ChainableStateMachine.getHistory | getHistory()} - Get the transition history array
 * - {@link ChainableStateMachine.clearHistory | clearHistory()} - Clear transition history
 * - {@link ChainableStateMachine.enableHistory | enableHistory(enable?)} - Enable or disable history tracking
 * - {@link ChainableStateMachine.setHistorySize | setHistorySize(size)} - Set maximum history size
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
		/**
		 * Current state of the machine (read-only)
		 * @readonly
		 * @category Core Properties
		 */
		get current() {
			return store.state;
		},

		/**
		 * Current context data of the machine (read-only)
		 * @readonly
		 * @category Core Properties
		 */
		get context() {
			return store.context;
		},

		/**
		 * Returns the internal Valtio store for use with useSnapshot in React components
		 * @returns The internal store object with state, context, and history
		 * @category Core API
		 * @example
		 * ```tsx
		 * function MyComponent() {
		 *   const state = useSnapshot(machine.getStore());
		 *   return <div>Current state: {state.state}</div>;
		 * }
		 * ```
		 */
		getStore() {
			return store;
		},

		/**
		 * Transitions the machine to a new state
		 * @param state - Target state to transition to
		 * @param payload - Optional data to pass to transition handlers
		 * @returns The machine instance for chaining
		 * @category Core API
		 * @example
		 * ```ts
		 * machine.moveTo('loading');
		 * // With payload
		 * machine.moveTo('success', { data: response });
		 * ```
		 */
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
		/**
		 * Resets the context to its initial values
		 * @returns The machine instance for chaining
		 * @category Core API
		 * @example
		 * ```ts
		 * // Reset context data to initial values
		 * machine.resetContext();
		 * ```
		 */
		resetContext() {
			// Simply replace the entire context with a fresh deep copy of the initial context
			store.context = proxy(deepClone(clonedInitialContext));
			
			return this;
		},

		/**
		 * Checks if the machine is in a specific state
		 * @param state - State to check against current state
		 * @returns True if the machine is in the specified state
		 * @category Core API
		 * @example
		 * ```ts
		 * if (machine.isIn('loading')) {
		 *   showLoadingIndicator();
		 * }
		 * ```
		 */
		isIn(state) {
			return store.state === state;
		},

		/**
		 * Checks if transition to a specific state is allowed from current state
		 * @param state - Target state to check
		 * @returns True if the transition is valid
		 * @category Core API
		 * @example
		 * ```ts
		 * if (machine.canMoveTo('success')) {
		 *   submitButton.disabled = false;
		 * }
		 * ```
		 */
		canMoveTo(state) {
			const validTransitions =
				mutableStateConfig[store.state]?.transitions || [];
			return validTransitions.includes(state);
		},

		/**
		 * Adds a listener for state transitions
		 * @param listener - Function to call when state transitions occur
		 * @returns The machine instance for chaining
		 * @category Listeners and Callbacks
		 * @example
		 * ```ts
		 * machine.onTransition((from, to, payload) => {
		 *   console.log(`Transitioned from ${from} to ${to}`);
		 * });
		 * ```
		 */
		onTransition(listener) {
			internalMachine.transitionListeners.add(listener);
			return this;
		},

		/**
		 * Registers a callback for a specific state
		 * @param state - State to watch for
		 * @param callback - Function to call when machine enters this state
		 * @returns The machine instance for chaining
		 * @category Listeners and Callbacks
		 * @example
		 * ```ts
		 * machine.whenIn('loading', (context) => {
		 *   startLoadingIndicator();
		 * });
		 * ```
		 */
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

		/**
		 * Adds a listener for context changes
		 * @param listener - Function to call when context properties change
		 * @returns Function to remove the listener
		 * @category Listeners and Callbacks
		 * @example
		 * ```ts
		 * const unsubscribe = machine.onContextChange((context, changes) => {
		 *   console.log('Context changed:', changes);
		 * });
		 * 
		 * // Later, to stop listening:
		 * unsubscribe();
		 * ```
		 */
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

		/**
		 * Returns the transition history array
		 * @returns Array of transition history items
		 * @category History Management
		 * @example
		 * ```ts
		 * const history = machine.getHistory();
		 * console.log(`Last transition: ${history[history.length-1].from} -> ${history[history.length-1].to}`);
		 * ```
		 */
		getHistory() {
			return store.historyEnabled ? [...store.history] : [];
		},

		/**
		 * Clears the transition history
		 * @returns The machine instance for chaining
		 * @category History Management
		 * @example
		 * ```ts
		 * machine.clearHistory();
		 * ```
		 */
		clearHistory() {
			if (store.historyEnabled) {
				store.history = [];
			}
			return this;
		},

		/**
		 * Enables or disables history tracking
		 * @param enable - Whether to enable history (defaults to true)
		 * @returns The machine instance for chaining
		 * @category History Management
		 * @example
		 * ```ts
		 * // Enable history tracking
		 * machine.enableHistory();
		 * 
		 * // Disable history tracking
		 * machine.enableHistory(false);
		 * ```
		 */
		enableHistory(enable = true) {
			store.historyEnabled = enable;
			if (!enable) {
				store.history = []; // Clear history when disabling
			}
			return this;
		},

		/**
		 * Sets the maximum history size
		 * @param size - Maximum number of history items to keep
		 * @returns The machine instance for chaining
		 * @category History Management
		 * @example
		 * ```ts
		 * // Keep last 50 transitions in history
		 * machine.setHistorySize(50);
		 * ```
		 */
		setHistorySize(size) {
			store.historySize = size;
			// Trim history if needed
			if (store.history.length > size) {
				store.history = store.history.slice(-size);
			}
			return this;
		},

		/**
		 * Sets allowed transitions for a state
		 * @param state - State to configure
		 * @param transitions - Array of allowed target states
		 * @returns The machine instance for chaining
		 * @category Runtime Configuration
		 * @example
		 * ```ts
		 * // Update the allowed transitions for the 'idle' state
		 * machine.setTransitions('idle', ['loading', 'disabled']);
		 * ```
		 */
		setTransitions(state, transitions) {
			if (!mutableStateConfig[state]) {
				mutableStateConfig[state] = { transitions: [] };
			}

			mutableStateConfig[state].transitions = [...transitions];
			return this;
		},

		/**
		 * Adds a single allowed transition to a state
		 * @param state - Source state
		 * @param transition - Target state to allow
		 * @returns The machine instance for chaining
		 * @category Runtime Configuration
		 * @example
		 * ```ts
		 * // Add a new possible transition from 'idle' to 'paused'
		 * machine.addTransition('idle', 'paused');
		 * ```
		 */
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

		/**
		 * Removes an allowed transition from a state
		 * @param state - Source state
		 * @param transition - Target state to disallow
		 * @returns The machine instance for chaining
		 * @category Runtime Configuration
		 * @example
		 * ```ts
		 * // Remove the ability to transition from 'idle' to 'error'
		 * machine.removeTransition('idle', 'error');
		 * ```
		 */
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

		/**
		 * Sets a state handler (onEnter or onExit)
		 * @param state - State to configure
		 * @param type - Handler type ("onEnter" or "onExit")
		 * @param handler - Function to call when entering/exiting the state
		 * @returns The machine instance for chaining
		 * @category Runtime Configuration
		 * @example
		 * ```ts
		 * // Add an entry action to the 'loading' state
		 * machine.setHandler('loading', 'onEnter', (context) => {
		 *   context.loadingStartTime = Date.now();
		 * });
		 * 
		 * // Add an exit action to the 'loading' state
		 * machine.setHandler('loading', 'onExit', (context) => {
		 *   context.loadingTime = Date.now() - context.loadingStartTime;
		 * });
		 * ```
		 */
		setHandler(state, type, handler) {
			if (!mutableStateConfig[state]) {
				mutableStateConfig[state] = { transitions: [] };
			}

			mutableStateConfig[state][type] = handler;
			return this;
		},

		/**
		 * Registers an event handler
		 * @param eventName - Event name to listen for
		 * @param handler - Function to call when event fires
		 * @returns The machine instance for chaining
		 * @category Event System
		 * @example
		 * ```ts
		 * machine.on('userLoggedIn', (context, payload) => {
		 *   context.user = payload.user;
		 * });
		 * ```
		 */
		on(eventName: string, handler: EventHandler<TContext>) {
			if (!internalMachine.eventHandlers[eventName]) {
				internalMachine.eventHandlers[eventName] = new Set();
			}

			internalMachine.eventHandlers[eventName].add(handler);
			return this;
		},

		/**
		 * Registers a one-time event handler that runs once then is removed
		 * @param eventName - Event name to listen for
		 * @param handler - Function to call when event fires (once)
		 * @returns The machine instance for chaining
		 * @category Event System
		 * @example
		 * ```ts
		 * machine.once('serverResponse', (context, payload) => {
		 *   // This handler will only run the first time 'serverResponse' is fired
		 *   context.firstResponseData = payload;
		 * });
		 * ```
		 */
		once(eventName: string, handler: EventHandler<TContext>) {
			if (!internalMachine.oneTimeEventHandlers[eventName]) {
				internalMachine.oneTimeEventHandlers[eventName] = new Set();
			}

			internalMachine.oneTimeEventHandlers[eventName].add(handler);
			return this;
		},

		/**
		 * Removes event handler(s)
		 * @param eventName - Event name
		 * @param handler - Specific handler to remove (removes all if omitted)
		 * @returns The machine instance for chaining
		 * @category Event System
		 * @example
		 * ```ts
		 * // Remove a specific handler
		 * machine.off('userAction', specificHandler);
		 * 
		 * // Remove all handlers for an event
		 * machine.off('userAction');
		 * ```
		 */
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

		/**
		 * Fires an event, triggering all registered handlers
		 * @param eventName - Event name to fire
		 * @param payload - Optional data to pass to handlers
		 * @returns The machine instance for chaining
		 * @category Event System
		 * @example
		 * ```ts
		 * // Fire an event without payload
		 * machine.fire('initialize');
		 * 
		 * // Fire an event with payload
		 * machine.fire('dataReceived', { id: 123, name: 'Example' });
		 * ```
		 */
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

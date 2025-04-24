/**
 * Valtio FSM - Finite State Machine backed by Valtio reactivity
 * 
 * A lightweight, reactive finite state machine implementation for managing application state
 * with TypeScript support, powered by Valtio for reactivity.
 * 
 * @packageDocumentation
 */

export { default, default as createMachine } from "./createMachine"
export type {
	TaskContext,
	StateConfig,
	TransitionHistoryItem,
	TransitionListener,
	StateCallback,
	ContextChangeListener,
	MachineStore,
	ChainableStateMachine,
	MachineOptions,
	EventHandler,
	EventHandlers,
	InternalMachine,
} from "./types"

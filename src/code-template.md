```ts
// @ts-nocheck
import { createMachine, type StateConfig, type MachineOptions } from 'valtio-fsm'
import { useSnapshot } from 'valtio'

// option to default to empty symbol as placeholder value
// instead of null, undefined, 0, empty string, etc.
const EMPTY = Symbol('Empty Value')

/**
 * State - the names of each individuatl state the app has
 */
export const STATE = {
// for each state:
  idle: 'idle', // initial state - first state defaults to 'idle'
  state1: 'state1',
  state2: 'state2',
} as const

export type State = (typeof STATE)[keyof typeof STATE]
export const { idle, state1, state2 } = STATE

/**
 * Context - The valtio store and data object shared between states
 */


// biome-ignore lint/suspicious/noEmptyInterface: <explanation>
export  interface Context {
  /**
   * If empty symbol option is turned on, default all values to EMPTY
   * with an option to override
   * types:
   *    string - EMPTY or ''
   *    number - EMPTY or 0
   *    boolean - EMPTY or false
   *    bigint - EMPTY - when adding values, make sure to put 'n' at the end
   *    object - {}
   *    array - []
   *    proxyMap - [[]]
   *    proxySet - []
   *    symbol - Symbol(description)
   *    undefined
   *    null
   */
}

const initialContext: Context = {}

/**
 * Transitions - Specify which state can transition to where
 */
export const stateConfig: StateConfig<State, Context> = {
	idle: {
		transitions: [],
	},
	state1: {
		transitions: [],
	},
	state2: {
		transitions: [],
	},
}

/**
 * Machine Config - all properties are optional
 */
// You can pass it as the 4 param in machine creation funtion
// const options: MachineOptions<State> = {
// 	enableHistory: false,
// 	historySize: 0,
//   onTransition: (fromState, toState, payload) => {

//   }
// }

export const machine = createMachine(idle, stateConfig, initialContext)
export const store = machine.getStore() // convenience methods

/**
 * Events
 */
machine
  .on('event', (context, payload) => {})
```
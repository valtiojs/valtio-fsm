[**valtio-fsm**](../README.md)

***

[valtio-fsm](../globals.md) / createMachine

# Function: createMachine()

> **createMachine**\<`TState`, `TContext`\>(`initialState`, `stateConfig`, `initialContext`, `options`): [`ChainableStateMachine`](../interfaces/ChainableStateMachine.md)\<`TState`, `TContext`\>

Defined in: [createMachine.ts:66](https://github.com/valtiojs/valtio-fsm/blob/1b855f4c52c53780ab3525907650e73542c9fda4/src/createMachine.ts#L66)

Creates a state machine with chainable API backed by Valtio for reactivity

## Type Parameters

### TState

`TState` *extends* `string`

String literal type representing valid states

### TContext

`TContext` *extends* `Record`\<`string`, `unknown`\>

Context data type for the state machine

## Parameters

### initialState

`TState`

Starting state for the machine

### stateConfig

[`StateConfig`](../type-aliases/StateConfig.md)\<`TState`, `TContext`\>

Configuration object defining states and transitions

### initialContext

`TContext` = `...`

Initial context data (defaults to empty object)

### options

[`MachineOptions`](../interfaces/MachineOptions.md)\<`TState`\> = `{}`

Additional configuration options

## Returns

[`ChainableStateMachine`](../interfaces/ChainableStateMachine.md)\<`TState`, `TContext`\>

A chainable state machine instance with the following methods:

## Core API
- [moveTo(state, payload?)](../interfaces/ChainableStateMachine.md#moveto) - Transition to a new state
- [isIn(state)](../interfaces/ChainableStateMachine.md#isin) - Check if machine is in a specific state
- [canMoveTo(state)](../interfaces/ChainableStateMachine.md#canmoveto) - Check if transition to a specific state is allowed
- [getStore()](../interfaces/ChainableStateMachine.md#getstore) - Get the internal Valtio store for use with useSnapshot
- [resetContext()](../interfaces/ChainableStateMachine.md#resetcontext) - Reset context to initial values

## Event System
- [on(eventName, handler)](../interfaces/ChainableStateMachine.md#on) - Register event handler
- [once(eventName, handler)](../interfaces/ChainableStateMachine.md#once) - Register one-time event handler
- [off(eventName, handler?)](../interfaces/ChainableStateMachine.md#off) - Remove event handler(s)
- [fire(eventName, payload?)](../interfaces/ChainableStateMachine.md#fire) - Fire an event

## Listeners and Callbacks
- [onTransition(listener)](../interfaces/ChainableStateMachine.md#ontransition) - Add a listener for state transitions
- [whenIn(state, callback)](../interfaces/ChainableStateMachine.md#whenin) - Register a callback for a specific state
- [onContextChange(listener)](../interfaces/ChainableStateMachine.md#oncontextchange) - Add a listener for context changes

## Runtime Configuration
- [setTransitions(state, transitions)](../interfaces/ChainableStateMachine.md#settransitions) - Set allowed transitions for a state
- [addTransition(state, transition)](../interfaces/ChainableStateMachine.md#addtransition) - Add a single allowed transition
- [removeTransition(state, transition)](../interfaces/ChainableStateMachine.md#removetransition) - Remove an allowed transition
- [setHandler(state, type, handler)](../interfaces/ChainableStateMachine.md#sethandler) - Set a state handler (onEnter or onExit)

## History Management
- [getHistory()](../interfaces/ChainableStateMachine.md#gethistory) - Get the transition history array
- [clearHistory()](../interfaces/ChainableStateMachine.md#clearhistory) - Clear transition history
- [enableHistory(enable?)](../interfaces/ChainableStateMachine.md#enablehistory) - Enable or disable history tracking
- [setHistorySize(size)](../interfaces/ChainableStateMachine.md#sethistorysize) - Set maximum history size

## Example

```ts
const machine = createMachine(
  'idle',
  {
    idle: { transitions: ['loading'] },
    loading: { transitions: ['success', 'error'] },
    success: { transitions: ['idle'] },
    error: { transitions: ['idle'] }
  },
  { data: null, error: null }
);
```

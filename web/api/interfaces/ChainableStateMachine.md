[valtio-fsm](../globals.md) / ChainableStateMachine

# Interface: ChainableStateMachine\<TState, TContext\>

Defined in: [types.ts:87](https://github.com/valtiojs/valtio-fsm/blob/e130d8462b1e3f3b9ad04f79c2f25bb6904906cd/src/types.ts#L87)

Main interface for the state machine

## Type Parameters

### TState

`TState` *extends* `string`

String literal type representing valid states

### TContext

`TContext` *extends* `Record`\<`string`, `unknown`\>

Context data type for the state machine

## Properties

### context

```ts
readonly context: TContext;
```

Defined in: [types.ts:94](https://github.com/valtiojs/valtio-fsm/blob/e130d8462b1e3f3b9ad04f79c2f25bb6904906cd/src/types.ts#L94)

Current context data (read-only)

***

### current

```ts
readonly current: TState;
```

Defined in: [types.ts:92](https://github.com/valtiojs/valtio-fsm/blob/e130d8462b1e3f3b9ad04f79c2f25bb6904906cd/src/types.ts#L92)

Current state (read-only)

## Methods

### addTransition()

```ts
addTransition(state, transition): ChainableStateMachine<TState, TContext>;
```

Defined in: [types.ts:157](https://github.com/valtiojs/valtio-fsm/blob/e130d8462b1e3f3b9ad04f79c2f25bb6904906cd/src/types.ts#L157)

Add a single allowed transition

#### Parameters

##### state

`TState`

Source state

##### transition

`TState`

Target state

#### Returns

`ChainableStateMachine`\<`TState`, `TContext`\>

***

### canMoveTo()

```ts
canMoveTo(state): boolean;
```

Defined in: [types.ts:118](https://github.com/valtiojs/valtio-fsm/blob/e130d8462b1e3f3b9ad04f79c2f25bb6904906cd/src/types.ts#L118)

Check if transition to a specific state is allowed

#### Parameters

##### state

`TState`

Target state to check

#### Returns

`boolean`

***

### clearHistory()

```ts
clearHistory(): ChainableStateMachine<TState, TContext>;
```

Defined in: [types.ts:185](https://github.com/valtiojs/valtio-fsm/blob/e130d8462b1e3f3b9ad04f79c2f25bb6904906cd/src/types.ts#L185)

Clear transition history

#### Returns

`ChainableStateMachine`\<`TState`, `TContext`\>

***

### enableHistory()

```ts
enableHistory(enable?): ChainableStateMachine<TState, TContext>;
```

Defined in: [types.ts:190](https://github.com/valtiojs/valtio-fsm/blob/e130d8462b1e3f3b9ad04f79c2f25bb6904906cd/src/types.ts#L190)

Enable or disable history tracking

#### Parameters

##### enable?

`boolean`

Whether to enable history

#### Returns

`ChainableStateMachine`\<`TState`, `TContext`\>

***

### fire()

```ts
fire(eventName, payload?): ChainableStateMachine<TState, TContext>;
```

Defined in: [types.ts:228](https://github.com/valtiojs/valtio-fsm/blob/e130d8462b1e3f3b9ad04f79c2f25bb6904906cd/src/types.ts#L228)

Fire an event

#### Parameters

##### eventName

`string`

Event name to fire

##### payload?

`unknown`

Optional data to pass to handlers

#### Returns

`ChainableStateMachine`\<`TState`, `TContext`\>

***

### getHistory()

```ts
getHistory(): TransitionHistoryItem<TState>[];
```

Defined in: [types.ts:183](https://github.com/valtiojs/valtio-fsm/blob/e130d8462b1e3f3b9ad04f79c2f25bb6904906cd/src/types.ts#L183)

Get the transition history array

#### Returns

[`TransitionHistoryItem`](TransitionHistoryItem.md)\<`TState`\>[]

***

### getStore()

```ts
getStore(): MachineStore<TState, TContext>;
```

Defined in: [types.ts:96](https://github.com/valtiojs/valtio-fsm/blob/e130d8462b1e3f3b9ad04f79c2f25bb6904906cd/src/types.ts#L96)

Get the internal Valtio store for use with useSnapshot

#### Returns

[`MachineStore`](MachineStore.md)\<`TState`, `TContext`\>

***

### isIn()

```ts
isIn(state): boolean;
```

Defined in: [types.ts:113](https://github.com/valtiojs/valtio-fsm/blob/e130d8462b1e3f3b9ad04f79c2f25bb6904906cd/src/types.ts#L113)

Check if machine is in a specific state

#### Parameters

##### state

`TState`

State to check

#### Returns

`boolean`

***

### moveTo()

```ts
moveTo(state, payload?): ChainableStateMachine<TState, TContext>;
```

Defined in: [types.ts:102](https://github.com/valtiojs/valtio-fsm/blob/e130d8462b1e3f3b9ad04f79c2f25bb6904906cd/src/types.ts#L102)

Transition to a new state

#### Parameters

##### state

`TState`

Target state

##### payload?

`unknown`

Optional data to pass to transition handlers

#### Returns

`ChainableStateMachine`\<`TState`, `TContext`\>

***

### off()

```ts
off(eventName, handler?): ChainableStateMachine<TState, TContext>;
```

Defined in: [types.ts:219](https://github.com/valtiojs/valtio-fsm/blob/e130d8462b1e3f3b9ad04f79c2f25bb6904906cd/src/types.ts#L219)

Remove event handler(s)

#### Parameters

##### eventName

`string`

Event name

##### handler?

[`EventHandler`](../type-aliases/EventHandler.md)\<`TContext`\>

Specific handler to remove (removes all if omitted)

#### Returns

`ChainableStateMachine`\<`TState`, `TContext`\>

***

### on()

```ts
on(eventName, handler): ChainableStateMachine<TState, TContext>;
```

Defined in: [types.ts:201](https://github.com/valtiojs/valtio-fsm/blob/e130d8462b1e3f3b9ad04f79c2f25bb6904906cd/src/types.ts#L201)

Register event handler

#### Parameters

##### eventName

`string`

Event name to listen for

##### handler

[`EventHandler`](../type-aliases/EventHandler.md)\<`TContext`\>

Function to call when event fires

#### Returns

`ChainableStateMachine`\<`TState`, `TContext`\>

***

### once()

```ts
once(eventName, handler): ChainableStateMachine<TState, TContext>;
```

Defined in: [types.ts:210](https://github.com/valtiojs/valtio-fsm/blob/e130d8462b1e3f3b9ad04f79c2f25bb6904906cd/src/types.ts#L210)

Register one-time event handler

#### Parameters

##### eventName

`string`

Event name to listen for

##### handler

[`EventHandler`](../type-aliases/EventHandler.md)\<`TContext`\>

Function to call when event fires (once)

#### Returns

`ChainableStateMachine`\<`TState`, `TContext`\>

***

### onContextChange()

```ts
onContextChange(listener): () => void;
```

Defined in: [types.ts:141](https://github.com/valtiojs/valtio-fsm/blob/e130d8462b1e3f3b9ad04f79c2f25bb6904906cd/src/types.ts#L141)

Add a listener for context changes

#### Parameters

##### listener

[`ContextChangeListener`](../type-aliases/ContextChangeListener.md)\<`TContext`\>

Function to call when context changes

#### Returns

Function to remove the listener

```ts
(): void;
```

##### Returns

`void`

***

### onTransition()

```ts
onTransition(listener): ChainableStateMachine<TState, TContext>;
```

Defined in: [types.ts:124](https://github.com/valtiojs/valtio-fsm/blob/e130d8462b1e3f3b9ad04f79c2f25bb6904906cd/src/types.ts#L124)

Add a listener for state transitions

#### Parameters

##### listener

[`TransitionListener`](../type-aliases/TransitionListener.md)\<`TState`\>

Function to call on transition

#### Returns

`ChainableStateMachine`\<`TState`, `TContext`\>

***

### removeTransition()

```ts
removeTransition(state, transition): ChainableStateMachine<TState, TContext>;
```

Defined in: [types.ts:166](https://github.com/valtiojs/valtio-fsm/blob/e130d8462b1e3f3b9ad04f79c2f25bb6904906cd/src/types.ts#L166)

Remove an allowed transition

#### Parameters

##### state

`TState`

Source state

##### transition

`TState`

Target state to remove

#### Returns

`ChainableStateMachine`\<`TState`, `TContext`\>

***

### resetContext()

```ts
resetContext(): ChainableStateMachine<TState, TContext>;
```

Defined in: [types.ts:107](https://github.com/valtiojs/valtio-fsm/blob/e130d8462b1e3f3b9ad04f79c2f25bb6904906cd/src/types.ts#L107)

Reset context to initial values

#### Returns

`ChainableStateMachine`\<`TState`, `TContext`\>

***

### setHandler()

```ts
setHandler(
   state, 
   type, 
handler): ChainableStateMachine<TState, TContext>;
```

Defined in: [types.ts:176](https://github.com/valtiojs/valtio-fsm/blob/e130d8462b1e3f3b9ad04f79c2f25bb6904906cd/src/types.ts#L176)

Set a state handler (onEnter or onExit)

#### Parameters

##### state

`TState`

State to configure

##### type

Handler type ("onEnter" or "onExit")

`"onEnter"` | `"onExit"`

##### handler

(`context`, `payload?`) => `void`

Function to call

#### Returns

`ChainableStateMachine`\<`TState`, `TContext`\>

***

### setHistorySize()

```ts
setHistorySize(size): ChainableStateMachine<TState, TContext>;
```

Defined in: [types.ts:195](https://github.com/valtiojs/valtio-fsm/blob/e130d8462b1e3f3b9ad04f79c2f25bb6904906cd/src/types.ts#L195)

Set maximum history size

#### Parameters

##### size

`number`

Maximum number of history items

#### Returns

`ChainableStateMachine`\<`TState`, `TContext`\>

***

### setTransitions()

```ts
setTransitions(state, transitions): ChainableStateMachine<TState, TContext>;
```

Defined in: [types.ts:148](https://github.com/valtiojs/valtio-fsm/blob/e130d8462b1e3f3b9ad04f79c2f25bb6904906cd/src/types.ts#L148)

Set allowed transitions for a state

#### Parameters

##### state

`TState`

State to configure

##### transitions

`TState`[]

Array of allowed target states

#### Returns

`ChainableStateMachine`\<`TState`, `TContext`\>

***

### whenIn()

```ts
whenIn(state, callback): ChainableStateMachine<TState, TContext>;
```

Defined in: [types.ts:132](https://github.com/valtiojs/valtio-fsm/blob/e130d8462b1e3f3b9ad04f79c2f25bb6904906cd/src/types.ts#L132)

Register a callback for a specific state

#### Parameters

##### state

`TState`

State to watch

##### callback

[`StateCallback`](../type-aliases/StateCallback.md)\<`TContext`\>

Function to call when in this state

#### Returns

`ChainableStateMachine`\<`TState`, `TContext`\>

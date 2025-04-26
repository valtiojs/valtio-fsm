[valtio-fsm](../globals.md) / InternalMachine

# Interface: InternalMachine\<TState, TContext\>

Defined in: [types.ts:268](https://github.com/valtiojs/valtio-fsm/blob/e130d8462b1e3f3b9ad04f79c2f25bb6904906cd/src/types.ts#L268)

Internal machine state structure

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
context: TContext;
```

Defined in: [types.ts:275](https://github.com/valtiojs/valtio-fsm/blob/e130d8462b1e3f3b9ad04f79c2f25bb6904906cd/src/types.ts#L275)

Current context data

***

### contextListeners

```ts
contextListeners: Set<(context, changes) => void>;
```

Defined in: [types.ts:287](https://github.com/valtiojs/valtio-fsm/blob/e130d8462b1e3f3b9ad04f79c2f25bb6904906cd/src/types.ts#L287)

Set of context change listeners

***

### current

```ts
current: TState;
```

Defined in: [types.ts:273](https://github.com/valtiojs/valtio-fsm/blob/e130d8462b1e3f3b9ad04f79c2f25bb6904906cd/src/types.ts#L273)

Current state

***

### eventHandlers

```ts
eventHandlers: Record<string, Set<EventHandler<TContext>>>;
```

Defined in: [types.ts:291](https://github.com/valtiojs/valtio-fsm/blob/e130d8462b1e3f3b9ad04f79c2f25bb6904906cd/src/types.ts#L291)

Map of event handlers by event name

***

### historyEnabled

```ts
historyEnabled: boolean;
```

Defined in: [types.ts:277](https://github.com/valtiojs/valtio-fsm/blob/e130d8462b1e3f3b9ad04f79c2f25bb6904906cd/src/types.ts#L277)

Whether history tracking is enabled

***

### historySize

```ts
historySize: number;
```

Defined in: [types.ts:279](https://github.com/valtiojs/valtio-fsm/blob/e130d8462b1e3f3b9ad04f79c2f25bb6904906cd/src/types.ts#L279)

Maximum history size

***

### oneTimeEventHandlers

```ts
oneTimeEventHandlers: Record<string, Set<EventHandler<TContext>>>;
```

Defined in: [types.ts:293](https://github.com/valtiojs/valtio-fsm/blob/e130d8462b1e3f3b9ad04f79c2f25bb6904906cd/src/types.ts#L293)

Map of one-time event handlers by event name

***

### previousContextSnapshot

```ts
previousContextSnapshot: unknown;
```

Defined in: [types.ts:289](https://github.com/valtiojs/valtio-fsm/blob/e130d8462b1e3f3b9ad04f79c2f25bb6904906cd/src/types.ts#L289)

Snapshot of previous context for change detection

***

### stateCallbacks

```ts
stateCallbacks: Map<TState, Set<(context) => void>>;
```

Defined in: [types.ts:285](https://github.com/valtiojs/valtio-fsm/blob/e130d8462b1e3f3b9ad04f79c2f25bb6904906cd/src/types.ts#L285)

Map of state-specific callbacks

***

### transitionListeners

```ts
transitionListeners: Set<(from, to, payload?) => void>;
```

Defined in: [types.ts:281](https://github.com/valtiojs/valtio-fsm/blob/e130d8462b1e3f3b9ad04f79c2f25bb6904906cd/src/types.ts#L281)

Set of transition listeners

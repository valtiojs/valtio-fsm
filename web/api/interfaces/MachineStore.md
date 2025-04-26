[valtio-fsm](../globals.md) / MachineStore

# Interface: MachineStore\<TState, TContext\>

Defined in: [types.ts:66](https://github.com/valtiojs/valtio-fsm/blob/e130d8462b1e3f3b9ad04f79c2f25bb6904906cd/src/types.ts#L66)

Represents the internal state store used by Valtio

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

Defined in: [types.ts:73](https://github.com/valtiojs/valtio-fsm/blob/e130d8462b1e3f3b9ad04f79c2f25bb6904906cd/src/types.ts#L73)

Current context data

***

### history

```ts
history: TransitionHistoryItem<TState>[];
```

Defined in: [types.ts:75](https://github.com/valtiojs/valtio-fsm/blob/e130d8462b1e3f3b9ad04f79c2f25bb6904906cd/src/types.ts#L75)

List of historical transitions

***

### historyEnabled

```ts
historyEnabled: boolean;
```

Defined in: [types.ts:77](https://github.com/valtiojs/valtio-fsm/blob/e130d8462b1e3f3b9ad04f79c2f25bb6904906cd/src/types.ts#L77)

Whether transition history is being tracked

***

### historySize

```ts
historySize: number;
```

Defined in: [types.ts:79](https://github.com/valtiojs/valtio-fsm/blob/e130d8462b1e3f3b9ad04f79c2f25bb6904906cd/src/types.ts#L79)

Maximum number of history items to store

***

### state

```ts
state: TState;
```

Defined in: [types.ts:71](https://github.com/valtiojs/valtio-fsm/blob/e130d8462b1e3f3b9ad04f79c2f25bb6904906cd/src/types.ts#L71)

Current state

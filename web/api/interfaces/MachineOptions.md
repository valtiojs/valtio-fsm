[valtio-fsm](../globals.md) / MachineOptions

# Interface: MachineOptions\<TState\>

Defined in: [types.ts:237](https://github.com/valtiojs/valtio-fsm/blob/e130d8462b1e3f3b9ad04f79c2f25bb6904906cd/src/types.ts#L237)

Configuration options for state machine creation

## Type Parameters

### TState

`TState` *extends* `string`

String literal type representing valid states

## Properties

### enableHistory?

```ts
optional enableHistory: boolean;
```

Defined in: [types.ts:239](https://github.com/valtiojs/valtio-fsm/blob/e130d8462b1e3f3b9ad04f79c2f25bb6904906cd/src/types.ts#L239)

Whether to enable transition history tracking

***

### historySize?

```ts
optional historySize: number;
```

Defined in: [types.ts:241](https://github.com/valtiojs/valtio-fsm/blob/e130d8462b1e3f3b9ad04f79c2f25bb6904906cd/src/types.ts#L241)

Maximum number of history entries to keep

***

### onTransition?

```ts
optional onTransition: TransitionListener<TState>;
```

Defined in: [types.ts:243](https://github.com/valtiojs/valtio-fsm/blob/e130d8462b1e3f3b9ad04f79c2f25bb6904906cd/src/types.ts#L243)

Initial transition listener

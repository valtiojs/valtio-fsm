[valtio-fsm](../globals.md) / StateConfig

# Type Alias: StateConfig\<TState, TContext\>

```ts
type StateConfig<TState, TContext> = { [key in TState]?: { onEnter?: (context: TContext, payload?: unknown) => void; onExit?: (context: TContext, payload?: unknown) => void; transitions: TState[] } };
```

Defined in: [types.ts:11](https://github.com/valtiojs/valtio-fsm/blob/e130d8462b1e3f3b9ad04f79c2f25bb6904906cd/src/types.ts#L11)

Configuration for state machine states

## Type Parameters

### TState

`TState` *extends* `string`

String literal type representing valid states

### TContext

`TContext`

Context data type for the state machine

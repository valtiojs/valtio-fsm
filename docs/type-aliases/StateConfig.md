[**valtio-fsm**](../README.md)

***

[valtio-fsm](../globals.md) / StateConfig

# Type Alias: StateConfig\<TState, TContext\>

> **StateConfig**\<`TState`, `TContext`\> = `{ [key in TState]?: { onEnter?: (context: TContext, payload?: unknown) => void; onExit?: (context: TContext, payload?: unknown) => void; transitions: TState[] } }`

Defined in: [types.ts:11](https://github.com/valtiojs/valtio-fsm/blob/1b855f4c52c53780ab3525907650e73542c9fda4/src/types.ts#L11)

Configuration for state machine states

## Type Parameters

### TState

`TState` *extends* `string`

String literal type representing valid states

### TContext

`TContext`

Context data type for the state machine

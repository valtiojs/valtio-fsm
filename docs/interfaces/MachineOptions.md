[**valtio-fsm**](../README.md)

***

[valtio-fsm](../globals.md) / MachineOptions

# Interface: MachineOptions\<TState\>

Defined in: [types.ts:237](https://github.com/valtiojs/valtio-fsm/blob/1b855f4c52c53780ab3525907650e73542c9fda4/src/types.ts#L237)

Configuration options for state machine creation

## Type Parameters

### TState

`TState` *extends* `string`

String literal type representing valid states

## Properties

### enableHistory?

> `optional` **enableHistory**: `boolean`

Defined in: [types.ts:239](https://github.com/valtiojs/valtio-fsm/blob/1b855f4c52c53780ab3525907650e73542c9fda4/src/types.ts#L239)

Whether to enable transition history tracking

***

### historySize?

> `optional` **historySize**: `number`

Defined in: [types.ts:241](https://github.com/valtiojs/valtio-fsm/blob/1b855f4c52c53780ab3525907650e73542c9fda4/src/types.ts#L241)

Maximum number of history entries to keep

***

### onTransition?

> `optional` **onTransition**: [`TransitionListener`](../type-aliases/TransitionListener.md)\<`TState`\>

Defined in: [types.ts:243](https://github.com/valtiojs/valtio-fsm/blob/1b855f4c52c53780ab3525907650e73542c9fda4/src/types.ts#L243)

Initial transition listener

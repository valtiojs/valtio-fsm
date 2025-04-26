[**valtio-fsm**](../README.md)

***

[valtio-fsm](../globals.md) / TransitionHistoryItem

# Interface: TransitionHistoryItem\<TState\>

Defined in: [types.ts:25](https://github.com/valtiojs/valtio-fsm/blob/1b855f4c52c53780ab3525907650e73542c9fda4/src/types.ts#L25)

Represents a historical state transition

## Type Parameters

### TState

`TState` *extends* `string`

String literal type representing valid states

## Properties

### from

> **from**: `TState`

Defined in: [types.ts:27](https://github.com/valtiojs/valtio-fsm/blob/1b855f4c52c53780ab3525907650e73542c9fda4/src/types.ts#L27)

State transitioning from

***

### payload?

> `optional` **payload**: `unknown`

Defined in: [types.ts:33](https://github.com/valtiojs/valtio-fsm/blob/1b855f4c52c53780ab3525907650e73542c9fda4/src/types.ts#L33)

Optional data passed with transition

***

### timestamp

> **timestamp**: `number`

Defined in: [types.ts:31](https://github.com/valtiojs/valtio-fsm/blob/1b855f4c52c53780ab3525907650e73542c9fda4/src/types.ts#L31)

Timestamp when transition occurred

***

### to

> **to**: `TState`

Defined in: [types.ts:29](https://github.com/valtiojs/valtio-fsm/blob/1b855f4c52c53780ab3525907650e73542c9fda4/src/types.ts#L29)

State transitioning to

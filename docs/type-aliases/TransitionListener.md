[**valtio-fsm**](../README.md)

***

[valtio-fsm](../globals.md) / TransitionListener

# Type Alias: TransitionListener()\<TState\>

> **TransitionListener**\<`TState`\> = (`from`, `to`, `payload?`) => `void`

Defined in: [types.ts:40](https://github.com/valtiojs/valtio-fsm/blob/1b855f4c52c53780ab3525907650e73542c9fda4/src/types.ts#L40)

Listener function called when state transitions occur

## Type Parameters

### TState

`TState` *extends* `string`

String literal type representing valid states

## Parameters

### from

`TState`

### to

`TState`

### payload?

`unknown`

## Returns

`void`

[**valtio-fsm**](../README.md)

***

[valtio-fsm](../globals.md) / EventHandler

# Type Alias: EventHandler()\<TContext\>

> **EventHandler**\<`TContext`\> = (`context`, `payload?`) => `void`

Defined in: [types.ts:250](https://github.com/valtiojs/valtio-fsm/blob/1b855f4c52c53780ab3525907650e73542c9fda4/src/types.ts#L250)

Handler function for custom events

## Type Parameters

### TContext

`TContext` *extends* `Record`\<`string`, `unknown`\>

Context data type for the state machine

## Parameters

### context

`TContext`

### payload?

`unknown`

## Returns

`void`

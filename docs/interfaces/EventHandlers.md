[**valtio-fsm**](../README.md)

***

[valtio-fsm](../globals.md) / EventHandlers

# Interface: EventHandlers\<TContext\>

Defined in: [types.ts:259](https://github.com/valtiojs/valtio-fsm/blob/1b855f4c52c53780ab3525907650e73542c9fda4/src/types.ts#L259)

Collection of event handlers by event name

## Type Parameters

### TContext

`TContext` *extends* `Record`\<`string`, `unknown`\>

Context data type for the state machine

## Indexable

\[`eventName`: `string`\]: `Set`\<[`EventHandler`](../type-aliases/EventHandler.md)\<`TContext`\>\>

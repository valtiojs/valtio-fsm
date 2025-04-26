[valtio-fsm](../globals.md) / EventHandlers

# Interface: EventHandlers\<TContext\>

Defined in: [types.ts:259](https://github.com/valtiojs/valtio-fsm/blob/e130d8462b1e3f3b9ad04f79c2f25bb6904906cd/src/types.ts#L259)

Collection of event handlers by event name

## Type Parameters

### TContext

`TContext` *extends* `Record`\<`string`, `unknown`\>

Context data type for the state machine

## Indexable

```ts
[eventName: string]: Set<EventHandler<TContext>>
```

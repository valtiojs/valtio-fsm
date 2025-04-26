[valtio-fsm](../globals.md) / EventHandler

# Type Alias: EventHandler()\<TContext\>

```ts
type EventHandler<TContext> = (context, payload?) => void;
```

Defined in: [types.ts:250](https://github.com/valtiojs/valtio-fsm/blob/e130d8462b1e3f3b9ad04f79c2f25bb6904906cd/src/types.ts#L250)

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

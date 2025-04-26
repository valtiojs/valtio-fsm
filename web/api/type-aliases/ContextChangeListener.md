[valtio-fsm](../globals.md) / ContextChangeListener

# Type Alias: ContextChangeListener()\<TContext\>

```ts
type ContextChangeListener<TContext> = (context, changes) => void;
```

Defined in: [types.ts:56](https://github.com/valtiojs/valtio-fsm/blob/e130d8462b1e3f3b9ad04f79c2f25bb6904906cd/src/types.ts#L56)

Listener function for context property changes

## Type Parameters

### TContext

`TContext`

Context data type for the state machine

## Parameters

### context

`TContext`

### changes

`object`[]

## Returns

`void`

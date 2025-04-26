[valtio-fsm](../globals.md) / TransitionListener

# Type Alias: TransitionListener()\<TState\>

```ts
type TransitionListener<TState> = (from, to, payload?) => void;
```

Defined in: [types.ts:40](https://github.com/valtiojs/valtio-fsm/blob/e130d8462b1e3f3b9ad04f79c2f25bb6904906cd/src/types.ts#L40)

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

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { snapshot, subscribe } from 'valtio/vanilla';
import createMachine from '../../src/createMachine';
import type { StateConfig } from '../../src/types';

describe('valtio integration', () => {
  type CounterState = 'idle' | 'counting' | 'paused' | 'reset';
  type CounterContext = {
    count: number;
    lastIncrement: number;
    history: number[];
  };

  let stateConfig: StateConfig<CounterState, CounterContext>;
  let initialContext: CounterContext;

  beforeEach(() => {
    stateConfig = {
      idle: {
        transitions: ['counting'],
        onExit: (ctx) => {
          ctx.history = [];
        }
      },
      counting: {
        transitions: ['paused', 'reset'],
        onEnter: (ctx) => {
          ctx.count = 0;
        }
      },
      paused: {
        transitions: ['counting', 'reset'],
      },
      reset: {
        transitions: ['idle'],
        onEnter: (ctx) => {
          ctx.count = 0;
          ctx.lastIncrement = 0;
          ctx.history = [];
        }
      }
    };

    initialContext = {
      count: 0,
      lastIncrement: 0,
      history: []
    };
  });

  test('should create a reactive store that can be subscribed to', async () => {
    const machine = createMachine<CounterState, CounterContext>(
      'idle', stateConfig, initialContext
    );
    
    const store = machine.getStore();
    const subscriber = vi.fn();
    
    // Set up subscription
    const unsubscribe = subscribe(store, subscriber);
    
    // Force a state change
    store.state = 'counting';
    
    // Wait for the subscription to trigger
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(subscriber).toHaveBeenCalled();
    
    unsubscribe();
  });

  test('should get immutable snapshots from the store', () => {
    const machine = createMachine<CounterState, CounterContext>(
      'idle', stateConfig, initialContext
    );
    
    const store = machine.getStore();
    
    // Get an immutable snapshot
    const snap = snapshot(store);
    
    expect(snap.state).toBe('idle');
    
    // Snapshot should be immutable
    expect(() => {
      // @ts-expect-error - Snapshots are immutable so this will error
      snap.state = 'counting';
    }).toThrow();
    
    // Original store can be mutated through the machine
    machine.moveTo('counting');
    const newSnap = snapshot(store);
    expect(newSnap.state).toBe('counting');
  });

  test('should update context reactively', async () => {
    const machine = createMachine<CounterState, CounterContext>(
      'idle', stateConfig, initialContext
    );
    
    const storeSubscriber = vi.fn();
    const contextSubscriber = vi.fn();
    
    const store = machine.getStore();
    
    // Subscribe to the whole store
    subscribe(store, storeSubscriber);
    
    // Subscribe to context changes
    machine.onContextChange(contextSubscriber);
    
    // Directly modify context (this should trigger reactivity)
    store.context.count = 5;
    
    // Wait for the subscriptions to trigger
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(storeSubscriber).toHaveBeenCalled();
    expect(contextSubscriber).toHaveBeenCalledWith(
      expect.any(Object),
      expect.arrayContaining([
        expect.objectContaining({
          key: 'count',
          value: 5,
          previousValue: 0
        })
      ])
    );
  });

  test('should track nested context changes', async () => {
    type NestedContext = {
      user: {
        name: string,
        preferences: {
          theme: string
        }
      }
    };
    
    const nestedConfig: StateConfig<'default' | 'custom', NestedContext> = {
      default: {
        transitions: ['custom']
      },
      custom: {
        transitions: ['default']
      }
    };
    
    const initialNestedContext: NestedContext = {
      user: {
        name: 'User',
        preferences: {
          theme: 'light'
        }
      }
    };
    
    const machine = createMachine<'default' | 'custom', NestedContext>(
      'default', nestedConfig, initialNestedContext
    );
    
    const contextListener = vi.fn();
    machine.onContextChange(contextListener);
    
    // Modify nested property
    machine.getStore().context.user.preferences.theme = 'dark';
    
    // Wait for the subscription to trigger
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(contextListener).toHaveBeenCalledWith(
      expect.any(Object),
      expect.arrayContaining([
        expect.objectContaining({
          key: 'user',
          value: expect.objectContaining({
            preferences: expect.objectContaining({
              theme: 'dark'
            })
          }),
          previousValue: expect.any(Object)
        })
      ])
    );
  });

  test('should handle array mutations in context', async () => {
    const machine = createMachine<CounterState, CounterContext>(
      'idle', stateConfig, initialContext
    );
    
    const contextListener = vi.fn();
    machine.onContextChange(contextListener);
    
    // Modify array in context
    machine.getStore().context.history.push(1);
    
    // Wait for the subscription to trigger
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(contextListener).toHaveBeenCalledWith(
      expect.any(Object),
      expect.arrayContaining([
        expect.objectContaining({
          key: 'history',
          value: [1],
          previousValue: []
        })
      ])
    );
  });

  test('should integrate with event system', async () => {
    const machine = createMachine<CounterState, CounterContext>(
      'counting', stateConfig, initialContext
    );
    
    // Add event handlers that update the context
    machine.on('increment', (ctx, amount = 1) => {
      ctx.count += amount;
      ctx.lastIncrement = amount;
      ctx.history.push(ctx.count);
    });
    
    // Subscribe to context changes
    const contextListener = vi.fn();
    machine.onContextChange(contextListener);
    
    // Fire event that modifies context
    machine.fire('increment', 5);
    
    // Wait for the subscription to trigger
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(machine.context.count).toBe(5);
    expect(machine.context.lastIncrement).toBe(5);
    expect(machine.context.history).toEqual([5]);
    
    expect(contextListener).toHaveBeenCalled();
  });

  test('should correctly return the store', () => {
    const machine = createMachine<CounterState, CounterContext>(
      'idle', stateConfig, initialContext
    );
    
    const store = machine.getStore();
    
    expect(store).toEqual({
      state: 'idle',
      context: initialContext,
      history: [],
      historyEnabled: false,
      historySize: 100,
    });
    
    // The store should reflect changes to the machine
    machine.moveTo('counting');
    
    expect(store.state).toBe('counting');
    expect(store.context.history).toEqual([]);
  });
});
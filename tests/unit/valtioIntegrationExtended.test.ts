import { describe, test, expect, vi, beforeEach } from 'vitest';
import { snapshot, subscribe } from 'valtio/vanilla';
import createMachine from '../../src/createMachine';
import type { StateConfig } from '../../src/types';

describe('advanced valtio integration', () => {
  type AppState = 'idle' | 'loading' | 'success' | 'error';
  type AppContext = {
    data: any;
    error: string | null;
    attempts: number;
    user: {
      name: string;
      preferences: {
        theme: string;
        notifications: boolean;
      };
    };
    items: string[];
  };

  let stateConfig: StateConfig<AppState, AppContext>;
  let initialContext: AppContext;

  beforeEach(() => {
    stateConfig = {
      idle: {
        transitions: ['loading'],
      },
      loading: {
        transitions: ['success', 'error', 'idle'],
      },
      success: {
        transitions: ['idle'],
      },
      error: {
        transitions: ['idle'],
      },
    };

    initialContext = {
      data: null,
      error: null,
      attempts: 0,
      user: {
        name: 'default',
        preferences: {
          theme: 'light',
          notifications: true
        }
      },
      items: []
    };
  });

  test('should track deep nested mutations in context', async () => {
    const machine = createMachine<AppState, AppContext>(
      'idle', stateConfig, initialContext
    );
    
    const contextListener = vi.fn();
    machine.onContextChange(contextListener);
    
    // Deeply modify the context
    machine.getStore().context.user.preferences.theme = 'dark';
    
    // Wait for the subscription to trigger
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Should detect nested changes
    expect(contextListener).toHaveBeenCalledWith(
      expect.any(Object),
      expect.arrayContaining([
        expect.objectContaining({
          key: 'user',
          value: expect.objectContaining({
            preferences: expect.objectContaining({
              theme: 'dark'
            })
          })
        })
      ])
    );
  });

  test('should detect and track array operations properly', async () => {
    const machine = createMachine<AppState, AppContext>(
      'idle', stateConfig, initialContext
    );
    
    const contextListener = vi.fn();
    machine.onContextChange(contextListener);
    
    // Perform an array mutation
    machine.getStore().context.items.push('item1');
    
    // Wait for the subscription to trigger
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Check that the array change was detected
    expect(contextListener).toHaveBeenCalledWith(
      expect.any(Object),
      expect.arrayContaining([
        expect.objectContaining({
          key: 'items',
          value: ['item1'],
          previousValue: []
        })
      ])
    );
    
    // Reset the mock
    contextListener.mockClear();
    
    // Perform a different array operation
    machine.getStore().context.items.splice(0, 1);
    
    // Wait for the subscription to trigger
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Check that this change was also detected
    expect(contextListener).toHaveBeenCalledWith(
      expect.any(Object),
      expect.arrayContaining([
        expect.objectContaining({
          key: 'items',
          value: [],
          previousValue: ['item1']
        })
      ])
    );
  });

  test('should detect multiple simultaneous context changes', async () => {
    const machine = createMachine<AppState, AppContext>(
      'idle', stateConfig, initialContext
    );
    
    const contextListener = vi.fn();
    machine.onContextChange(contextListener);
    
    // Make multiple changes in a batch
    machine.getStore().context.attempts = 3;
    machine.getStore().context.user.name = 'updated';
    machine.getStore().context.items.push('item1');
    
    // Wait for the subscription to trigger
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Expect all changes to be detected
    expect(contextListener).toHaveBeenCalledWith(
      expect.any(Object),
      expect.arrayContaining([
        expect.objectContaining({
          key: 'attempts',
          value: 3,
          previousValue: 0
        }),
        expect.objectContaining({
          key: 'user',
          value: expect.objectContaining({
            name: 'updated'
          })
        }),
        expect.objectContaining({
          key: 'items',
          value: ['item1'],
          previousValue: []
        })
      ])
    );
  });

  test('should integrate with transition handlers for reactive updates', async () => {
    // Create a machine with an onEnter handler that updates context
    const machine = createMachine<AppState, AppContext>(
      'idle', stateConfig, initialContext
    );
    
    // Set up a handler that will modify context when entering the loading state
    machine.setHandler('loading', 'onEnter', (ctx) => {
      ctx.attempts += 1;
      ctx.user.preferences.theme = 'system';
    });
    
    // Set up a context change listener
    const contextListener = vi.fn();
    machine.onContextChange(contextListener);
    
    // Transition to the loading state
    machine.moveTo('loading');
    
    // Wait for the subscription to trigger
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Verify that context changes from the handler were detected
    expect(contextListener).toHaveBeenCalledWith(
      expect.any(Object),
      expect.arrayContaining([
        expect.objectContaining({
          key: 'attempts',
          value: 1,
          previousValue: 0
        }),
        expect.objectContaining({
          key: 'user',
          value: expect.objectContaining({
            preferences: expect.objectContaining({
              theme: 'system'
            })
          })
        })
      ])
    );
  });

  test('should provide consistent snapshot behavior when using Valtio functions', () => {
    const machine = createMachine<AppState, AppContext>(
      'idle', stateConfig, initialContext
    );
    
    // Get initial snapshot
    const initialSnap = snapshot(machine.getStore());
    
    // Verify initial state is reflected in snapshot
    expect(initialSnap.state).toBe('idle');
    expect(initialSnap.context.attempts).toBe(0);
    
    // Modify state through machine
    machine.moveTo('loading');
    machine.getStore().context.attempts = 1;
    
    // Get updated snapshot
    const updatedSnap = snapshot(machine.getStore());
    
    // Verify snapshot reflects changes
    expect(updatedSnap.state).toBe('loading');
    expect(updatedSnap.context.attempts).toBe(1);
    
    // Initial snapshot should remain unchanged (immutable)
    expect(initialSnap.state).toBe('idle');
    expect(initialSnap.context.attempts).toBe(0);
  });

  test('should maintain context reactivity after reset', async () => {
    const machine = createMachine<AppState, AppContext>(
      'idle', stateConfig, initialContext
    );
    
    // Modify context first
    machine.getStore().context.attempts = 5;
    
    // Reset the context
    machine.resetContext();
    
    // Set up context change listener after reset
    const contextListener = vi.fn();
    machine.onContextChange(contextListener);
    
    // Modify context again
    machine.getStore().context.attempts = 2;
    
    // Wait for subscription
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Verify listener works after reset
    expect(contextListener).toHaveBeenCalled();
    
    // Verify the change is visible in a snapshot
    const snap = snapshot(machine.getStore());
    expect(snap.context.attempts).toBe(2);
  });

  test('should handle multiple subscribers to the store correctly', async () => {
    const machine = createMachine<AppState, AppContext>(
      'idle', stateConfig, initialContext
    );
    
    const store = machine.getStore();
    
    // Create two subscribers
    const subscriber1 = vi.fn();
    const subscriber2 = vi.fn();
    
    // Subscribe both to the store
    const unsub1 = subscribe(store, subscriber1);
    const unsub2 = subscribe(store, subscriber2);
    
    // Make a state change
    machine.moveTo('loading');
    
    // Wait for subscribers to be called
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Both subscribers should be called
    expect(subscriber1).toHaveBeenCalledTimes(1);
    expect(subscriber2).toHaveBeenCalledTimes(1);
    
    // Unsubscribe the first subscriber
    unsub1();
    
    // Make another state change
    machine.moveTo('success');
    
    // Wait for subscribers
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Only the second subscriber should be called again
    expect(subscriber1).toHaveBeenCalledTimes(1); // Still just once
    expect(subscriber2).toHaveBeenCalledTimes(2);
  });
});
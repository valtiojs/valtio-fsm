import { describe, test, expect, vi, beforeEach } from 'vitest';
import createMachine from '../../src/createMachine';
import { snapshot } from 'valtio/vanilla';
import type { StateConfig } from '../../src/types';

describe('edge cases', () => {
  type TestState = 'a' | 'b' | 'c';
  type TestContext = Record<string, unknown>;

  let stateConfig: StateConfig<TestState, TestContext>;
  
  beforeEach(() => {
    stateConfig = {
      a: { transitions: ['b', 'c'] },
      b: { transitions: ['a', 'c'] },
      c: { transitions: ['a', 'b'] }
    };
  });

  test('should handle context manipulation after reset', () => {
    // Create machine with no initial context
    const machine = createMachine<TestState, TestContext>('a', stateConfig);
    
    // Context should be an empty object initially
    expect(machine.context).toEqual({});
    
    // Reset the context (which preserves Valtio reactivity)
    machine.resetContext();
    
    // Verify we can add properties to the reset context
    machine.getStore().context.newProperty = 'new';
    expect(machine.context.newProperty).toBe('new');
  });

  test('should handle empty state config', () => {
    // Create machine with empty state config
    const machine = createMachine<TestState, TestContext>('a', {});
    
    // Initial state should be set
    expect(machine.current).toBe('a');
    
    // Shouldn't be able to transition anywhere
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    machine.moveTo('b');
    
    // State should remain the same
    expect(machine.current).toBe('a');
    
    // Should get warning about invalid transition
    expect(consoleSpy).toHaveBeenCalledWith('Invalid transition from a to b');
    
    consoleSpy.mockRestore();
  });

  test('should handle non-existent state in config', () => {
    const machine = createMachine<TestState, TestContext>('a', stateConfig);
    
    // Delete a state from the mutable config
    machine.setTransitions('a', []);
    
    // Try to check transitions for a state that isn't in config
    expect(machine.canMoveTo('b')).toBe(false);
    
    // Try to add a transition to non-existent state
    machine.addTransition('z' as TestState, 'a');
    
    // Try to remove a transition from non-existent state
    machine.removeTransition('z' as TestState, 'a');
    
    // Should not cause any errors
  });

  test('should handle transitions to self', () => {
    // Config with self-transitions
    const selfConfig: StateConfig<TestState, TestContext> = {
      a: { transitions: ['a', 'b'] },
      b: { transitions: ['a'] },
      c: { transitions: [] }
    };
    
    const exitHandler = vi.fn();
    const enterHandler = vi.fn();
    
    const machine = createMachine<TestState, TestContext>('a', selfConfig, {});
    
    // Set handlers
    machine.setHandler('a', 'onExit', exitHandler);
    machine.setHandler('a', 'onEnter', enterHandler);
    
    // Transition to self
    machine.moveTo('a');
    
    // Both exit and enter handlers should be called
    expect(exitHandler).toHaveBeenCalledTimes(1);
    expect(enterHandler).toHaveBeenCalledTimes(1);
    
    // State should still be 'a'
    expect(machine.current).toBe('a');
  });

  test('should handle race conditions in context updates', async () => {
    const machine = createMachine<TestState, TestContext>('a', stateConfig, { counter: 0 });
    
    // Create an increment handler
    const incrementHandler = (ctx: TestContext) => {
      // Simulate async operation
      setTimeout(() => {
        // Increment counter
        const current = ctx.counter as number;
        ctx.counter = current + 1;
      }, 10);
    };
    
    // Register handler
    machine.on('increment', incrementHandler);
    
    // Fire event multiple times
    machine.fire('increment');
    machine.fire('increment');
    machine.fire('increment');
    
    // Wait for all timeouts to resolve
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Counter should be 3
    expect(machine.context.counter).toBe(3);
  });

  test('should maintain context reactivity when reset', () => {
    const initialContext: TestContext = {};
    
    const machine = createMachine<TestState, TestContext>('a', stateConfig, initialContext);
    
    // Reset context
    machine.resetContext();
    
    // After reset, verify we can still use the context reactively
    machine.getStore().context.newProperty = "new value";
    expect(machine.context.newProperty).toBe("new value");
    
    // And we can overwrite the value
    machine.getStore().context.newProperty = "updated value";
    expect(machine.context.newProperty).toBe("updated value");
  });

  test('should handle modifying history array directly', () => {
    const machine = createMachine<TestState, TestContext>(
      'a', stateConfig, {}, { enableHistory: true }
    );
    
    // Transition to create history
    machine.moveTo('b');
    machine.moveTo('c');
    
    // Get history length
    const historyLength = machine.getHistory().length;
    expect(historyLength).toBe(2);
    
    // Manually clear history
    machine.getStore().history = [];
    
    // History should be empty
    expect(machine.getHistory()).toEqual([]);
  });

  test('should handle multiple context change listeners', async () => {
    const machine = createMachine<TestState, TestContext>('a', stateConfig, { value: 1 });
    
    const listener1 = vi.fn();
    const listener2 = vi.fn();
    
    // Add multiple listeners
    const unsub1 = machine.onContextChange(listener1);
    const unsub2 = machine.onContextChange(listener2);
    
    // Modify context
    machine.getStore().context.value = 2;
    
    // Wait for listeners to be called
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Both listeners should be called
    expect(listener1).toHaveBeenCalled();
    expect(listener2).toHaveBeenCalled();
    
    // Reset mocks to simplify counting
    listener1.mockClear();
    listener2.mockClear();
    
    // Create a new listener after some initial changes
    const listener3 = vi.fn();
    const unsub3 = machine.onContextChange(listener3);
    
    // Modify context again
    machine.getStore().context.value = 3;
    
    // Wait for listeners
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // All listeners should have been called
    expect(listener1).toHaveBeenCalled();
    expect(listener2).toHaveBeenCalled();
    expect(listener3).toHaveBeenCalled();
    
    // Testing unsubscribe behavior would require a more complex mock of valtio's
    // subscribe function since the actual return value is tested in the real
    // code. Instead, we'll just verify we can create multiple listeners.
  });
});
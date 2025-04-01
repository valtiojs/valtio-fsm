import { describe, test, expect, vi } from 'vitest';
import createMachine from '../../src/createMachine';

describe('transition edge cases', () => {
  type TestState = 'a' | 'b' | 'c' | 'd';
  type TestContext = Record<string, unknown>;

  test('should handle setHandler on non-existent state', () => {
    // Create a machine without any specific handler configuration
    const machine = createMachine<TestState, TestContext>('a', {
      a: { transitions: ['b'] },
      b: { transitions: ['a'] }
    });
    
    // Spy handler
    const handler = vi.fn();
    
    // Set a handler on a state that doesn't exist in the initial config
    machine.setHandler('c', 'onEnter', handler);
    
    // Add a transition to the non-existent state
    machine.addTransition('b', 'c');
    
    // Move to state c
    machine.moveTo('b');
    machine.moveTo('c');
    
    // The handler should have been called
    expect(handler).toHaveBeenCalledTimes(1);
  });

  test('should handle removeTransition on non-existent transition', () => {
    // Create a machine with transitions
    const machine = createMachine<TestState, TestContext>('a', {
      a: { transitions: ['b', 'c'] },
      b: { transitions: ['a'] },
      c: { transitions: ['a'] }
    });
    
    // Verify initial state
    expect(machine.canMoveTo('b')).toBe(true);
    expect(machine.canMoveTo('c')).toBe(true);
    
    // Remove a non-existent transition - should not error
    expect(() => machine.removeTransition('a', 'd')).not.toThrow();
    
    // Existing transitions should still work
    expect(machine.canMoveTo('b')).toBe(true);
    expect(machine.canMoveTo('c')).toBe(true);
  });

  test('should handle removeTransition for all transitions', () => {
    // Create a machine with transitions
    const machine = createMachine<TestState, TestContext>('a', {
      a: { transitions: ['b', 'c'] },
      b: { transitions: ['a'] },
      c: { transitions: ['a'] }
    });
    
    // Remove all transitions from state a
    machine.removeTransition('a', 'b');
    machine.removeTransition('a', 'c');
    
    // Should not be able to transition anywhere from a
    expect(machine.canMoveTo('b')).toBe(false);
    expect(machine.canMoveTo('c')).toBe(false);
  });

  test('should handle setTransitions with empty array', () => {
    // Create a machine with transitions
    const machine = createMachine<TestState, TestContext>('a', {
      a: { transitions: ['b', 'c'] },
      b: { transitions: ['a'] },
      c: { transitions: ['a'] }
    });
    
    // Clear all transitions with empty array
    machine.setTransitions('a', []);
    
    // Should not be able to transition anywhere
    expect(machine.canMoveTo('b')).toBe(false);
    expect(machine.canMoveTo('c')).toBe(false);
  });

  test('should handle setHandler with undefined handler', () => {
    // Create a machine with a handler
    const initialHandler = vi.fn();
    
    const machine = createMachine<TestState, TestContext>('a', {
      a: { transitions: ['b'] },
      b: { transitions: ['a'] }
    });
    
    // Set an initial handler
    machine.setHandler('b', 'onEnter', initialHandler);
    
    // Transition to trigger the handler
    machine.moveTo('b');
    
    // Handler should have been called
    expect(initialHandler).toHaveBeenCalledTimes(1);
    
    // Reset the mock
    initialHandler.mockClear();
    
    // Set handler to undefined
    machine.setHandler('b', 'onEnter', undefined);
    
    // Transition again
    machine.moveTo('a');
    machine.moveTo('b');
    
    // Original handler should not have been called
    expect(initialHandler).not.toHaveBeenCalled();
  });

  test('should handle setHandler with both enter and exit handlers', () => {
    // Create spy handlers
    const enterHandler = vi.fn();
    const exitHandler = vi.fn();
    
    // Create a machine
    const machine = createMachine<TestState, TestContext>('a', {
      a: { transitions: ['b'] },
      b: { transitions: ['a'] }
    });
    
    // Set both handlers
    machine.setHandler('a', 'onExit', exitHandler);
    machine.setHandler('b', 'onEnter', enterHandler);
    
    // Transition
    machine.moveTo('b');
    
    // Both handlers should have been called
    expect(exitHandler).toHaveBeenCalledTimes(1);
    expect(enterHandler).toHaveBeenCalledTimes(1);
    
    // Reset mocks
    exitHandler.mockClear();
    enterHandler.mockClear();
    
    // Replace with undefined
    machine.setHandler('a', 'onExit', undefined);
    
    // Transition back and forth
    machine.moveTo('a');
    
    // Exit handler should not have been called (we removed it)
    expect(exitHandler).not.toHaveBeenCalled();
    
    // Reset and test b → a transition
    enterHandler.mockClear();
    
    // Set a new enter handler for state a
    const enterHandlerA = vi.fn();
    machine.setHandler('a', 'onEnter', enterHandlerA);
    
    // Move back to b then to a to test
    machine.moveTo('b');
    machine.moveTo('a');
    
    // The enter handler should be called
    expect(enterHandlerA).toHaveBeenCalledTimes(1);
  });
});
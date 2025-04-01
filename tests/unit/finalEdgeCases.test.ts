import { describe, test, expect } from 'vitest';
import createMachine from '../../src/createMachine';

describe('final edge cases', () => {
  type TestState = 'a' | 'b' | 'c';
  type TestContext = Record<string, unknown>;

  test('should handle edge cases in addTransition', () => {
    // Create a machine with minimal config
    const machine = createMachine<TestState, TestContext>('a', {
      a: { transitions: ['b'] }
    });
    
    // Add a transition to a state that doesn't exist in the config
    machine.addTransition('c', 'a');
    
    // Add a transition to a non-existent state with no transitions array
    machine.addTransition('c', 'b');
    
    // This should have created the state in the config
    expect(machine.canMoveTo('b')).toBe(true);
    
    // Move to c first (even though we're not technically allowed yet)
    // This simulates having reached state c through some other means
    machine.getStore().state = 'c' as TestState;
    
    // Now we should be able to move to a
    expect(machine.canMoveTo('a')).toBe(true);
    expect(machine.canMoveTo('b')).toBe(true);
  });

  test('should handle removing transitions from non-existent states', () => {
    // Create a machine with minimal config
    const machine = createMachine<TestState, TestContext>('a', {});
    
    // Remove a transition from a non-existent state - should not throw
    expect(() => machine.removeTransition('nonexistent' as TestState, 'a')).not.toThrow();
  });
});
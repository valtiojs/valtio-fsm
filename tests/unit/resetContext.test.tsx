import { describe, test, expect, vi } from 'vitest';
import createMachine from '../../src/createMachine';
import { snapshot, subscribe } from 'valtio/vanilla';

describe('resetContext behavior', () => {
  type TestState = 'idle' | 'active';
  
  test('should support context manipulation after reset', () => {
    // Given a machine with initial context
    const initialContext = { value: 0 };
    const machine = createMachine<TestState, typeof initialContext>(
      'idle', { idle: { transitions: ['active'] } }, initialContext
    );
    
    // When we reset the context 
    machine.resetContext();
    
    // Then we should be able to modify it
    machine.getStore().context.value = 100;
    
    // And the modification should be visible
    expect(machine.context.value).toBe(100);
  });
  
  test('should maintain reactivity across reset', async () => {
    // Given a machine with a context
    const machine = createMachine<TestState, { count: number }>(
      'idle', { idle: { transitions: ['active'] } }, { count: 0 }
    );
    
    // And I reset the context
    machine.resetContext();
    
    // When I set up a listener and modify the context
    const contextListener = vi.fn();
    machine.onContextChange(contextListener);
    machine.getStore().context.count = 42;
    
    // Then my listener should be called
    await new Promise(resolve => setTimeout(resolve, 10));
    expect(contextListener).toHaveBeenCalled();
  });
  
  test('should maintain state and history settings during reset', () => {
    // Given a machine with history enabled and a non-initial state
    const machine = createMachine<TestState, { value: number }>(
      'idle', 
      { idle: { transitions: ['active'] }, active: { transitions: ['idle'] } },
      { value: 0 },
      { enableHistory: true, historySize: 5 }
    );
    
    // And I transition to another state
    machine.moveTo('active');
    
    // When I reset the context
    machine.resetContext();
    
    // Then my state and history settings are preserved
    expect(machine.current).toBe('active');
    expect(machine.getStore().historyEnabled).toBe(true);
    expect(machine.getStore().historySize).toBe(5);
  });
});
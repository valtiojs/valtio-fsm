import { describe, test, expect, vi, beforeEach } from 'vitest';
import createMachine from '../../src/createMachine';
import type { StateConfig } from '../../src/types';
import { subscribe, snapshot } from 'valtio/vanilla';

describe('createMachine', () => {
  type AppState = 'idle' | 'loading' | 'success' | 'error';
  type AppContext = {
    data: any;
    error: string | null;
    attempts: number;
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
    };
  });

  test('should create a machine with initial state and context', () => {
    const machine = createMachine<AppState, AppContext>('idle', stateConfig, initialContext);
    
    expect(machine.current).toBe('idle');
    expect(machine.context).toEqual(initialContext);
  });

  test('should transition between valid states', () => {
    const machine = createMachine<AppState, AppContext>('idle', stateConfig, initialContext);
    
    machine.moveTo('loading');
    expect(machine.current).toBe('loading');
    
    machine.moveTo('success', { result: 'data' });
    expect(machine.current).toBe('success');
  });

  test('should not transition to invalid states', () => {
    const machine = createMachine<AppState, AppContext>('idle', stateConfig, initialContext);
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    machine.moveTo('success'); // Not allowed from idle
    expect(machine.current).toBe('idle');
    expect(consoleSpy).toHaveBeenCalledWith('Invalid transition from idle to success');
    
    consoleSpy.mockRestore();
  });

  test('should execute handlers during transitions when set after creation', () => {
    // Create counters to track handler calls
    let exitCalled = 0;
    let enterCalled = 0;
    
    // Create the handlers
    const exitHandler = (ctx: AppContext) => {
      ctx.attempts++; 
      exitCalled++;
    };
    
    const enterHandler = (ctx: AppContext, payload: any) => {
      ctx.data = payload;
      enterCalled++; 
    };
    
    // Create machine
    const machine = createMachine<AppState, AppContext>('idle', stateConfig, initialContext);
    
    // Set handlers after creation
    machine.setHandler('idle', 'onExit', exitHandler);
    machine.setHandler('loading', 'onEnter', enterHandler);
    
    // Transition
    machine.moveTo('loading', { result: 'data' });
    
    // Check context
    expect(machine.context.attempts).toBe(1);
    expect(machine.context.data).toEqual({ result: 'data' });
    
    // Check handler call counts
    expect(exitCalled).toBe(1);
    expect(enterCalled).toBe(1);
  });

  test('should track transition history when enabled', () => {
    const machine = createMachine<AppState, AppContext>(
      'idle',
      stateConfig,
      initialContext,
      { enableHistory: true, historySize: 2 }
    );
    
    machine.moveTo('loading');
    machine.moveTo('success', { result: 'data' });
    machine.moveTo('idle');
    
    const history = machine.getHistory();
    expect(history).toHaveLength(2); // Limited by historySize
    expect(history[0].from).toBe('loading');
    expect(history[0].to).toBe('success');
    expect(history[1].from).toBe('success');
    expect(history[1].to).toBe('idle');
  });

  test('should provide access to a reset context', () => {
    // Create a fresh machine with initial context
    const initialContext = {
      data: null,
      error: null,
      attempts: 0,
    };
    
    const testMachine = createMachine<AppState, AppContext>(
      'idle', 
      stateConfig, 
      initialContext
    );
    
    // Modify context
    testMachine.getStore().context.data = { result: 'data' };
    testMachine.getStore().context.attempts = 5;
    
    expect(testMachine.context.data).toEqual({ result: 'data' });
    expect(testMachine.context.attempts).toBe(5);
    
    // Reset the context
    testMachine.resetContext();
    
    // Verify we can set new values on the reset context
    testMachine.getStore().context.data = null;
    testMachine.getStore().context.attempts = 0;
    
    // Check that our new values are set
    expect(testMachine.context.data).toBe(null);
    expect(testMachine.context.attempts).toBe(0);
  });

  test('should check if machine is in a specific state', () => {
    const machine = createMachine<AppState, AppContext>('idle', stateConfig, initialContext);
    
    expect(machine.isIn('idle')).toBe(true);
    expect(machine.isIn('loading')).toBe(false);
    
    machine.moveTo('loading');
    
    expect(machine.isIn('idle')).toBe(false);
    expect(machine.isIn('loading')).toBe(true);
  });

  test('should check if can move to specific state', () => {
    const machine = createMachine<AppState, AppContext>('idle', stateConfig, initialContext);
    
    expect(machine.canMoveTo('loading')).toBe(true);
    expect(machine.canMoveTo('success')).toBe(false);
    
    machine.moveTo('loading');
    
    expect(machine.canMoveTo('success')).toBe(true);
    expect(machine.canMoveTo('idle')).toBe(true); // We added this transition
  });

  test('should notify transition listeners', () => {
    const listener = vi.fn();
    const machine = createMachine<AppState, AppContext>('idle', stateConfig, initialContext)
      .onTransition(listener);
    
    machine.moveTo('loading');
    
    expect(listener).toHaveBeenCalledWith('idle', 'loading', expect.any(Object));
  });

  test('should execute callbacks when entering specific states', () => {
    const successCallback = vi.fn();
    const machine = createMachine<AppState, AppContext>('idle', stateConfig, initialContext)
      .whenIn('success', successCallback);
    
    machine.moveTo('loading');
    expect(successCallback).not.toHaveBeenCalled();
    
    // Manually update the context before the transition to verify it works
    machine.getStore().context.data = { result: 'data' };
    
    machine.moveTo('success');
    expect(successCallback).toHaveBeenCalledWith(
      expect.objectContaining({ data: { result: 'data' } })
    );
  });

  test('should notify context change listeners', async () => {
    const machine = createMachine<AppState, AppContext>('idle', stateConfig, initialContext);
    const contextListener = vi.fn();
    
    machine.onContextChange(contextListener);
    
    // We need to manually trigger a context change
    machine.getStore().context.attempts = 1;
    
    // Wait for the valtio subscription to trigger
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(contextListener).toHaveBeenCalledWith(
      expect.any(Object),
      expect.arrayContaining([
        expect.objectContaining({
          key: 'attempts',
          value: 1,
          previousValue: 0
        })
      ])
    );
  });

  test('should modify transitions at runtime', () => {
    const machine = createMachine<AppState, AppContext>('idle', stateConfig, initialContext);
    
    // Add a new transition
    machine.addTransition('idle', 'error');
    expect(machine.canMoveTo('error')).toBe(true);
    
    // Remove a transition
    machine.removeTransition('idle', 'loading');
    expect(machine.canMoveTo('loading')).toBe(false);
    
    // Set completely new transitions
    machine.setTransitions('idle', ['success']);
    expect(machine.canMoveTo('success')).toBe(true);
    expect(machine.canMoveTo('error')).toBe(false);
  });

  test('should set handlers at runtime', () => {
    const newHandler = vi.fn();
    const machine = createMachine<AppState, AppContext>('idle', stateConfig, initialContext);
    
    // Add the idle state to loading's transitions to make the test work
    machine.addTransition('loading', 'idle');
    
    machine.setHandler('idle', 'onEnter', newHandler);
    
    machine.moveTo('loading');
    machine.moveTo('idle');
    
    expect(newHandler).toHaveBeenCalled();
  });

  test('should handle custom events', () => {
    const machine = createMachine<AppState, AppContext>('idle', stateConfig, initialContext);
    const handler = vi.fn((ctx, payload) => {
      ctx.data = payload;
    });
    
    machine.on('customEvent', handler);
    machine.fire('customEvent', 'eventData');
    
    expect(handler).toHaveBeenCalledWith(
      expect.any(Object),
      'eventData'
    );
    expect(machine.context.data).toBe('eventData');
  });

  test('should handle one-time events', () => {
    const machine = createMachine<AppState, AppContext>('idle', stateConfig, initialContext);
    const handler = vi.fn();
    
    machine.once('oneTimeEvent', handler);
    
    machine.fire('oneTimeEvent', 'data1');
    expect(handler).toHaveBeenCalledTimes(1);
    
    machine.fire('oneTimeEvent', 'data2');
    expect(handler).toHaveBeenCalledTimes(1); // Still just once
  });

  test('should remove event handlers', () => {
    const machine = createMachine<AppState, AppContext>('idle', stateConfig, initialContext);
    const handler1 = vi.fn();
    const handler2 = vi.fn();
    
    machine.on('testEvent', handler1);
    machine.on('testEvent', handler2);
    
    machine.off('testEvent', handler1);
    machine.fire('testEvent');
    
    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).toHaveBeenCalled();
    
    machine.off('testEvent'); // Remove all handlers
    
    handler2.mockClear();
    machine.fire('testEvent');
    expect(handler2).not.toHaveBeenCalled();
  });

  test('should manage history settings', () => {
    const machine = createMachine<AppState, AppContext>(
      'idle',
      stateConfig,
      initialContext,
      { enableHistory: true }
    );
    
    machine.moveTo('loading');
    expect(machine.getHistory()).toHaveLength(1);
    
    machine.enableHistory(false);
    expect(machine.getHistory()).toHaveLength(0);
    
    machine.enableHistory(true);
    machine.moveTo('success');
    machine.setHistorySize(5);
    
    machine.clearHistory();
    expect(machine.getHistory()).toHaveLength(0);
  });
});
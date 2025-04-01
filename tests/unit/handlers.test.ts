import { describe, test, expect, vi } from 'vitest';
import createMachine from '../../src/createMachine';

describe('state machine handlers', () => {
  // Define types for our test machine
  type MachineState = 'initial' | 'step1' | 'step2' | 'final';
  type MachineContext = {
    counter: number;
    processed: boolean;
    payload: unknown;
    trace: string[];
  };

  test('should execute handlers when set using setHandler method', () => {
    // Create spy handlers
    const onExitInitial = vi.fn((ctx: MachineContext, payload?: unknown) => {
      ctx.trace.push('exitInitial');
      ctx.payload = payload;
    });
    
    const onEnterStep1 = vi.fn((ctx: MachineContext) => {
      ctx.trace.push('enterStep1');
      ctx.counter++;
    });
    
    // Basic state config without handlers - we'll add them after creation
    const config = {
      initial: { transitions: ['step1'] },
      step1: { transitions: ['step2'] },
      step2: { transitions: ['final'] },
      final: { transitions: [] }
    };
    
    // Create initial context
    const initialContext: MachineContext = {
      counter: 0,
      processed: false,
      payload: null,
      trace: []
    };
    
    // Create machine
    const machine = createMachine<MachineState, MachineContext>(
      'initial', config, initialContext
    );
    
    // Set handlers after creation
    machine.setHandler('initial', 'onExit', onExitInitial);
    machine.setHandler('step1', 'onEnter', onEnterStep1);
    
    // Transition
    const transitionPayload = { data: 'test' };
    machine.moveTo('step1', transitionPayload);
    
    // Verify handlers were called
    expect(onExitInitial).toHaveBeenCalledTimes(1);
    expect(onExitInitial).toHaveBeenCalledWith(
      expect.any(Object), 
      transitionPayload
    );
    
    expect(onEnterStep1).toHaveBeenCalledTimes(1);
    
    // Verify context updates from handlers
    expect(machine.context.counter).toBe(1);
    expect(machine.context.trace).toEqual(['exitInitial', 'enterStep1']);
    expect(machine.context.payload).toEqual(transitionPayload);
  });

  test('should update handlers at runtime', () => {
    // Create multiple handlers for testing replacement
    const firstHandler = vi.fn((ctx: MachineContext) => {
      ctx.trace.push('first');
    });
    
    const replacementHandler = vi.fn((ctx: MachineContext) => {
      ctx.trace.push('replacement');
      ctx.processed = true;
    });
    
    // Config with transitions
    const config = {
      initial: { transitions: ['step1'] },
      step1: { transitions: ['initial'] }
    };
    
    // Initial context
    const initialContext: MachineContext = {
      counter: 0,
      processed: false,
      payload: null,
      trace: []
    };
    
    // Create machine
    const machine = createMachine<MachineState, MachineContext>(
      'initial', config, initialContext
    );
    
    // Set initial handler
    machine.setHandler('step1', 'onEnter', firstHandler);
    
    // First transition to step1
    machine.moveTo('step1');
    
    // Verify first handler ran
    expect(firstHandler).toHaveBeenCalledTimes(1);
    expect(machine.context.trace).toEqual(['first']);
    
    // Replace the handler
    machine.setHandler('step1', 'onEnter', replacementHandler);
    
    // Go back and forth to trigger the new handler
    machine.moveTo('initial');
    machine.moveTo('step1');
    
    // Verify replacement handler ran and the first one didn't get called again
    expect(firstHandler).toHaveBeenCalledTimes(1); // Still just once
    expect(replacementHandler).toHaveBeenCalledTimes(1);
    expect(machine.context.trace).toEqual(['first', 'replacement']);
    expect(machine.context.processed).toBe(true);
  });

  test('should allow removing handlers by setting to undefined', () => {
    // Create a handler
    const handler = vi.fn((ctx: MachineContext) => {
      ctx.counter++;
    });
    
    // Config with transitions
    const config = {
      initial: { transitions: ['step1'] },
      step1: { transitions: ['initial'] }
    };
    
    // Create machine
    const machine = createMachine<MachineState, MachineContext>(
      'initial', config, { counter: 0, processed: false, payload: null, trace: [] }
    );
    
    // Set handler
    machine.setHandler('step1', 'onEnter', handler);
    
    // Transition to trigger handler
    machine.moveTo('step1');
    
    // Verify handler ran
    expect(handler).toHaveBeenCalledTimes(1);
    expect(machine.context.counter).toBe(1);
    
    // Remove handler by setting to undefined
    machine.setHandler('step1', 'onEnter', undefined);
    
    // Reset counter for clarity
    machine.getStore().context.counter = 0;
    
    // Transition again
    machine.moveTo('initial');
    machine.moveTo('step1');
    
    // Verify handler didn't run again
    expect(handler).toHaveBeenCalledTimes(1); // Still just the first call
    expect(machine.context.counter).toBe(0); // Unchanged
  });

  test('should verify that handlers in initial config are preserved', () => {
    // This test verifies the correct behavior when defining handlers in the initial configuration
    // With valtio's deepClone utility, function references are now preserved.
    
    // Spy handlers
    const exitHandler = vi.fn();
    const enterHandler = vi.fn();
    
    // Config with handlers
    const configWithHandlers = {
      initial: { 
        transitions: ['step1'],
        onExit: exitHandler 
      },
      step1: { 
        transitions: ['initial'],
        onEnter: enterHandler
      }
    };
    
    // Create machine
    const machine = createMachine<'initial' | 'step1', Record<string, unknown>>(
      'initial', configWithHandlers, {}
    );
    
    // Transition to step1
    machine.moveTo('step1');
    
    // Verify handlers ran because they're properly preserved with deepClone
    expect(exitHandler).toHaveBeenCalledTimes(1);
    expect(enterHandler).toHaveBeenCalledTimes(1);
    
    // Reset the mocks to test again
    exitHandler.mockClear();
    enterHandler.mockClear();
    
    // Transition back and forth
    machine.moveTo('initial');
    machine.moveTo('step1');
    
    // Handlers should continue to work
    expect(exitHandler).toHaveBeenCalledTimes(1);
    expect(enterHandler).toHaveBeenCalledTimes(1);
  });
});
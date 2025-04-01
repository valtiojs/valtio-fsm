import { describe, test, expect, vi } from 'vitest';
import createMachine from '../../src/createMachine';

describe('event system', () => {
  type MachineState = 'idle' | 'active';
  type MachineContext = {
    count: number;
    events: string[];
    lastEvent: string | null;
    lastPayload: unknown;
  };
  
  const initialContext: MachineContext = {
    count: 0,
    events: [],
    lastEvent: null,
    lastPayload: null
  };
  
  const stateConfig = {
    idle: { transitions: ['active'] },
    active: { transitions: ['idle'] }
  };

  test('should register and trigger multiple event handlers', () => {
    const machine = createMachine<MachineState, MachineContext>(
      'idle', stateConfig, initialContext
    );
    
    // Create handlers
    const handler1 = vi.fn((ctx: MachineContext) => {
      ctx.count++;
      ctx.events.push('handler1');
    });
    
    const handler2 = vi.fn((ctx: MachineContext, payload: unknown) => {
      ctx.lastPayload = payload;
      ctx.events.push('handler2');
    });
    
    // Register multiple handlers for the same event
    machine.on('test', handler1);
    machine.on('test', handler2);
    
    // Fire the event
    machine.fire('test', { id: 123 });
    
    // Verify both handlers ran
    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(1);
    
    // Verify context updates from both handlers
    expect(machine.context.count).toBe(1);
    expect(machine.context.events).toEqual(['handler1', 'handler2']);
    expect(machine.context.lastPayload).toEqual({ id: 123 });
  });

  test('should handle one-time events correctly', () => {
    const machine = createMachine<MachineState, MachineContext>(
      'idle', stateConfig, initialContext
    );
    
    // Create handlers
    const regularHandler = vi.fn((ctx: MachineContext) => {
      ctx.events.push('regular');
    });
    
    const oneTimeHandler = vi.fn((ctx: MachineContext) => {
      ctx.events.push('oneTime');
    });
    
    // Register handlers
    machine.on('testEvent', regularHandler);
    machine.once('testEvent', oneTimeHandler);
    
    // Fire the event twice
    machine.fire('testEvent');
    machine.fire('testEvent');
    
    // Regular handler should run twice
    expect(regularHandler).toHaveBeenCalledTimes(2);
    
    // One-time handler should run only once
    expect(oneTimeHandler).toHaveBeenCalledTimes(1);
    
    // Verify context updates
    expect(machine.context.events).toEqual(['regular', 'oneTime', 'regular']);
  });

  test('should remove specific handlers with off method', () => {
    const machine = createMachine<MachineState, MachineContext>(
      'idle', stateConfig, initialContext
    );
    
    // Create handlers
    const handler1 = vi.fn();
    const handler2 = vi.fn();
    const handler3 = vi.fn();
    
    // Register handlers for different events
    machine.on('event1', handler1);
    machine.on('event2', handler2);
    machine.on('event2', handler3);
    
    // Remove one specific handler
    machine.off('event2', handler2);
    
    // Fire events
    machine.fire('event1');
    machine.fire('event2');
    
    // Check which handlers ran
    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).not.toHaveBeenCalled();
    expect(handler3).toHaveBeenCalledTimes(1);
  });

  test('should remove all handlers for an event', () => {
    const machine = createMachine<MachineState, MachineContext>(
      'idle', stateConfig, initialContext
    );
    
    // Create handlers
    const handler1 = vi.fn();
    const handler2 = vi.fn();
    
    // Register multiple handlers for the same event
    machine.on('testEvent', handler1);
    machine.on('testEvent', handler2);
    
    // Remove all handlers for the event
    machine.off('testEvent');
    
    // Fire the event
    machine.fire('testEvent');
    
    // Neither handler should have run
    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).not.toHaveBeenCalled();
  });

  test('should handle recursive event calls gracefully', () => {
    const machine = createMachine<MachineState, MachineContext>(
      'idle', stateConfig, initialContext
    );
    
    // Create a counter to prevent infinite recursion
    let counter = 0;
    
    // Create a handler that fires another event
    const recursiveHandler = vi.fn((ctx: MachineContext) => {
      ctx.events.push('recursive');
      counter++;
      
      // Fire another event, but limit recursion depth
      if (counter < 3) {
        machine.fire('recursiveEvent');
      }
    });
    
    // Register the handler
    machine.on('recursiveEvent', recursiveHandler);
    
    // Fire the event to start the chain
    machine.fire('recursiveEvent');
    
    // Handler should have been called 3 times
    expect(recursiveHandler).toHaveBeenCalledTimes(3);
    expect(machine.context.events).toEqual(['recursive', 'recursive', 'recursive']);
  });

  test('should integrate event system with state transitions', () => {
    const machine = createMachine<MachineState, MachineContext>(
      'idle', stateConfig, initialContext
    );
    
    // Create an event handler that changes state
    const stateChangeHandler = vi.fn((ctx: MachineContext) => {
      ctx.lastEvent = 'stateChange';
      // This handler will also change the state to active
      if (machine.current === 'idle') {
        machine.moveTo('active');
      }
    });
    
    // Register the handler
    machine.on('activate', stateChangeHandler);
    
    // Fire the event
    machine.fire('activate');
    
    // Verify the handler ran and changed state
    expect(stateChangeHandler).toHaveBeenCalledTimes(1);
    expect(machine.current).toBe('active');
    expect(machine.context.lastEvent).toBe('stateChange');
  });

  test('should handle event with undefined payload', () => {
    const machine = createMachine<MachineState, MachineContext>(
      'idle', stateConfig, initialContext
    );
    
    // Create a handler that tracks the payload
    const handler = vi.fn((ctx: MachineContext, payload: unknown) => {
      ctx.lastPayload = payload;
      ctx.events.push('handler');
    });
    
    // Register the handler
    machine.on('test', handler);
    
    // Fire the event without payload
    machine.fire('test');
    
    // Verify the handler ran with undefined payload
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(expect.any(Object), undefined);
    expect(machine.context.lastPayload).toBeUndefined();
    expect(machine.context.events).toEqual(['handler']);
  });
});
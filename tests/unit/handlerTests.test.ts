import { describe, test, expect, vi, beforeEach } from 'vitest';
import createMachine from '../../src/createMachine';
import type { StateConfig } from '../../src/types';

describe('state machine handlers', () => {
  // Simple traffic light machine without deep cloning
  type TrafficLightState = 'green' | 'yellow' | 'red';
  type TrafficContext = {
    greenDuration: number;
    yellowDuration: number;
    redDuration: number;
    currentDuration: number;
    cycleCount: number;
  };

  test('verifies that handlers in initial config are preserved', () => {
    // Set up counters to track handler calls
    let onExitGreenCallCount = 0;
    let onEnterYellowCallCount = 0;
    
    // Define config with simple counters
    const config = {
      green: {
        transitions: ['yellow'],
        onExit: (ctx: TrafficContext) => { 
          ctx.currentDuration = ctx.yellowDuration; 
          onExitGreenCallCount++;
        }
      },
      yellow: {
        transitions: ['red'],
        onEnter: (ctx: TrafficContext) => { 
          ctx.cycleCount++; 
          onEnterYellowCallCount++;
        }
      },
      red: {
        transitions: ['green']
      }
    };
    
    // Initial context
    const initialContext: TrafficContext = {
      greenDuration: 30,
      yellowDuration: 5,
      redDuration: 20,
      currentDuration: 30,
      cycleCount: 0
    };
    
    // Let's examine the config object directly before creating the machine
    const greenExitHandlerExists = typeof config.green.onExit === 'function';
    const yellowEnterHandlerExists = typeof config.yellow.onEnter === 'function';
    
    expect(greenExitHandlerExists).toBe(true);
    expect(yellowEnterHandlerExists).toBe(true);
    
    // Create machine
    const machine = createMachine<TrafficLightState, TrafficContext>(
      'green', config, initialContext
    );
    
    // Transition to yellow
    machine.moveTo('yellow');
    
    // With the fixed deepClone, these values should be updated
    expect(machine.context.currentDuration).toBe(5); // Changed from 30 to 5
    expect(machine.context.cycleCount).toBe(1); // Incremented to 1
    
    // Handlers should be called when using deepClone
    expect(onExitGreenCallCount).toBe(1);
    expect(onEnterYellowCallCount).toBe(1);
  });
  
  test('workaround: explicitly setting handlers after machine creation', () => {
    // Set up counters to track handler calls
    let onExitGreenCallCount = 0;
    let onEnterYellowCallCount = 0;
    
    // Exit handler
    const onExitGreen = (ctx: TrafficContext) => { 
      ctx.currentDuration = ctx.yellowDuration; 
      onExitGreenCallCount++;
    };
    
    // Enter handler
    const onEnterYellow = (ctx: TrafficContext) => { 
      ctx.cycleCount++; 
      onEnterYellowCallCount++;
    };
    
    // Define config with transitions only
    const config = {
      green: {
        transitions: ['yellow']
      },
      yellow: {
        transitions: ['red']
      },
      red: {
        transitions: ['green']
      }
    };
    
    // Initial context
    const initialContext: TrafficContext = {
      greenDuration: 30,
      yellowDuration: 5,
      redDuration: 20,
      currentDuration: 30,
      cycleCount: 0
    };
    
    // Create machine
    const machine = createMachine<TrafficLightState, TrafficContext>(
      'green', config, initialContext
    );
    
    // Set handlers after creation
    machine.setHandler('green', 'onExit', onExitGreen);
    machine.setHandler('yellow', 'onEnter', onEnterYellow);
    
    // Transition to yellow
    machine.moveTo('yellow');
    
    // Check context updates
    expect(machine.context.currentDuration).toBe(5);
    expect(machine.context.cycleCount).toBe(1);
    
    // Check if handlers were called - this should work since we're setting them after creation
    expect(onExitGreenCallCount).toBe(1);
    expect(onEnterYellowCallCount).toBe(1);
  });
});
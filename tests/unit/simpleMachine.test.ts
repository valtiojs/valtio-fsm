import { describe, test, expect, vi } from 'vitest';
import createMachine from '../../src/createMachine';

describe('simplified state machine tests', () => {
  // Simple traffic light machine
  type TrafficLightState = 'green' | 'yellow' | 'red';
  type TrafficContext = {
    greenDuration: number;
    yellowDuration: number;
    redDuration: number;
    currentDuration: number;
    cycleCount: number;
    // Flag to track handler execution
    onExitGreenCalled: boolean;
    onEnterYellowCalled: boolean;
  };

  test('verifies that handlers in config work properly', () => {
    // Create a machine with handlers defined in the config
    // With valtio's deepClone utility, these handlers are now preserved
    const configWithHandlers = {
      green: {
        transitions: ['yellow'],
        onExit: (ctx: TrafficContext) => { 
          ctx.currentDuration = ctx.yellowDuration; 
          ctx.onExitGreenCalled = true;
        }
      },
      yellow: {
        transitions: ['red'],
        onEnter: (ctx: TrafficContext) => { 
          ctx.cycleCount++; 
          ctx.onEnterYellowCalled = true;
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
      currentDuration: 30, // Starting with green duration
      cycleCount: 0,
      // Initialize flags as false
      onExitGreenCalled: false,
      onEnterYellowCalled: false
    };
    
    // Create the machine
    const trafficLight = createMachine<TrafficLightState, TrafficContext>(
      'green', configWithHandlers, initialContext
    );
    
    // Transition to yellow - handlers should now run with deepClone
    trafficLight.moveTo('yellow');
    
    // Verify state change
    expect(trafficLight.current).toBe('yellow');
    
    // These flags should now be true because the handlers are preserved
    expect(trafficLight.context.onExitGreenCalled).toBe(true);
    expect(trafficLight.context.onEnterYellowCalled).toBe(true);
    
    // Context values should be updated by the handlers
    expect(trafficLight.context.currentDuration).toBe(5);
    expect(trafficLight.context.cycleCount).toBe(1);
    
    // We can also set new handlers explicitly
    const newExitHandler = vi.fn((ctx: TrafficContext) => {
      ctx.onExitGreenCalled = false; // Reset to test
    });
    
    // Replace the original handler
    trafficLight.setHandler('yellow', 'onExit', newExitHandler);
    
    // Move to red to test the new handler
    trafficLight.moveTo('red');
    
    // The new handler should have been called
    expect(newExitHandler).toHaveBeenCalledTimes(1);
  });
});
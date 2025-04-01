![NPM Version](https://img.shields.io/npm/v/valtio-fsm?style=flat-square&color=%23e8b339)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/valtiojs/valtio-fsm/test.yml?style=flat-square&color=%23e8b339)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/valtio-fsm?style=flat-square&color=%23e8b339)
![NPM License](https://img.shields.io/npm/l/valtio-fsm?style=flat-square&color=%23e8b339)

# Valtio FSM

A reactive finite state machine library built on top of [Valtio](https://github.com/pmndrs/valtio).

## Features

- ⚡ Reactive state management powered by Valtio
- 🔒 Type-safe with TypeScript generics
- 🔄 Finite state machine pattern for predictable state transitions
- 📜 Context and transition history tracking
- ⚛️ Seamless React integration
- 🔌 Event system for cross-cutting concerns
- 🔧 Chainable API for expressive code
- 🧪 Well-tested with extensive coverage

## Installation

```bash
npm install valtio-fsm valtio
# or
yarn add valtio-fsm valtio
# or 
pnpm add valtio-fsm valtio
```

## Quick Start

```typescript
import { createMachine } from 'valtio-fsm';
import { useSnapshot } from 'valtio';

// Define state and context types
type LightState = 'green' | 'yellow' | 'red';
type LightContext = {
  duration: number;
  cycleCount: number;
};

// Create a state machine
const trafficLight = createMachine<LightState, LightContext>(
  'green', // Initial state
  {
    green: {
      transitions: ['yellow'],
      onExit: (ctx) => { ctx.duration = 5; }
    },
    yellow: {
      transitions: ['red'],
      onEnter: (ctx) => { ctx.cycleCount++; }
    },
    red: {
      transitions: ['green']
    }
  },
  // Initial context
  { duration: 30, cycleCount: 0 },
  // Options
  { enableHistory: true }
);

// Use in React components
function TrafficLightComponent() {
  const snap = useSnapshot(trafficLight.getStore());
  
  return (
    <div>
      <div className={`light ${snap.state}`} />
      <p>State: {snap.state}</p>
      <p>Duration: {snap.context.duration}</p>
      <p>Cycle count: {snap.context.cycleCount}</p>
      <button 
        onClick={() => {
          if (trafficLight.canMoveTo('yellow')) {
            trafficLight.moveTo('yellow');
          }
        }}
      >
        Next
      </button>
    </div>
  );
}
```

## Core Concepts

### State Machine

A finite state machine (FSM) is a mathematical model that has a finite number of states and transitions between those states. At any given time, the machine can be in only one state.

### States

Each state represents a condition of the system. In Valtio FSM, states are defined as string literals.

### Transitions

Transitions define how the machine can move from one state to another. Only explicitly defined transitions are allowed.

### Context

Context stores data that persists across state transitions. It's a reactive Valtio proxy object that triggers updates when modified.

### Handlers

Handlers are functions executed when entering or exiting a state:
- `onEnter`: Runs when entering a state
- `onExit`: Runs when leaving a state

Both handlers receive the current context and optional payload data.

### Events

Events provide a way to respond to external triggers without changing the state. Event handlers can modify the context.

## API Reference

### `createMachine`

```typescript
createMachine<TState, TContext>(
  initialState: TState,
  stateConfig: StateConfig<TState, TContext>,
  initialContext?: TContext,
  options?: MachineOptions<TState>
): ChainableStateMachine<TState, TContext>
```

Creates a new state machine instance.

#### Parameters:

- `initialState`: The starting state of the machine.
- `stateConfig`: Configuration object defining states, transitions, and handlers.
- `initialContext`: (Optional) Initial context data.
- `options`: (Optional) Machine configuration options.

#### Return value:

A chainable state machine instance.

### StateConfig

Configuration defining states, their allowed transitions, and handlers.

```typescript
type StateConfig<TState, TContext> = {
  [key in TState]?: {
    transitions: TState[];
    onEnter?: (context: TContext, payload?: unknown) => void;
    onExit?: (context: TContext, payload?: unknown) => void;
  };
};
```

### MachineOptions

Options for customizing the state machine.

```typescript
interface MachineOptions<TState> {
  enableHistory?: boolean;  // Whether to track transition history
  historySize?: number;     // Maximum size of history (default: 100)
  onTransition?: TransitionListener<TState>; // Global transition listener
}
```

### ChainableStateMachine Methods

The state machine instance returned by `createMachine` provides these methods:

#### State Management
- `moveTo(state, payload?)`: Transitions to a new state with optional payload
- `isIn(state)`: Checks if the machine is in a specific state
- `canMoveTo(state)`: Checks if a transition to the given state is valid
- `resetContext()`: Resets context to initial values

#### Getters
- `current`: Current state value (readonly)
- `context`: Current context object (readonly)
- `getStore()`: Returns the Valtio store for use with `useSnapshot`

#### Listeners
- `onTransition(listener)`: Registers a transition listener
- `whenIn(state, callback)`: Registers a callback for a specific state
- `onContextChange(listener)`: Registers a context change listener

#### History
- `getHistory()`: Returns the transition history
- `clearHistory()`: Clears the transition history
- `enableHistory(enable?)`: Enables or disables history tracking
- `setHistorySize(size)`: Sets the maximum history size

#### Dynamic Configuration
- `setTransitions(state, transitions)`: Sets allowed transitions for a state
- `addTransition(state, transition)`: Adds a single transition to a state
- `removeTransition(state, transition)`: Removes a transition from a state
- `setHandler(state, type, handler)`: Sets an onEnter or onExit handler

#### Event System
- `on(eventName, handler)`: Registers an event handler
- `once(eventName, handler)`: Registers a one-time event handler
- `off(eventName, handler?)`: Removes an event handler
- `fire(eventName, payload?)`: Fires an event

## Advanced Examples

### Context Management and Reactivity

```typescript
import { createMachine } from 'valtio-fsm';
import { snapshot } from 'valtio';

// Define a more complex context
type UserContext = {
  isAuthenticated: boolean;
  profile: {
    name: string;
    email: string;
    preferences: {
      theme: 'light' | 'dark';
      notifications: boolean;
    };
  };
  lastLogin: Date | null;
};

const authMachine = createMachine<'guest' | 'authenticated', UserContext>(
  'guest',
  {
    guest: { 
      transitions: ['authenticated'],
      onExit: (ctx, userData) => {
        // Update context when transitioning from guest to authenticated
        Object.assign(ctx.profile, userData);
        ctx.isAuthenticated = true;
        ctx.lastLogin = new Date();
      }
    },
    authenticated: { 
      transitions: ['guest'],
      onExit: (ctx) => {
        // Clear sensitive data when logging out
        ctx.isAuthenticated = false;
      }
    }
  },
  {
    isAuthenticated: false,
    profile: {
      name: '',
      email: '',
      preferences: {
        theme: 'light',
        notifications: true
      }
    },
    lastLogin: null
  }
);

// Track context changes
authMachine.onContextChange((context, changes) => {
  console.log('Context updated:', changes);
  
  // You could persist changes to localStorage here
  localStorage.setItem('userPreferences', JSON.stringify(context.profile.preferences));
});

// Login
authMachine.moveTo('authenticated', { 
  name: 'John Doe', 
  email: 'john@example.com' 
});

// Update preferences - this will trigger the context change listener
authMachine.getStore().context.profile.preferences.theme = 'dark';

// Get an immutable snapshot for comparison or debugging
const currentSnapshot = snapshot(authMachine.getStore());
console.log(currentSnapshot);

// Reset to initial state and context
authMachine.moveTo('guest').resetContext();
```

### Event System

```typescript
import { createMachine } from 'valtio-fsm';

type TodoState = 'idle' | 'loading' | 'error';
type TodoContext = {
  items: { id: number; text: string; completed: boolean }[];
  error: string | null;
  filter: 'all' | 'active' | 'completed';
};

const todoMachine = createMachine<TodoState, TodoContext>(
  'idle',
  {
    idle: { transitions: ['loading', 'error'] },
    loading: { transitions: ['idle', 'error'] },
    error: { transitions: ['idle'] }
  },
  {
    items: [],
    error: null,
    filter: 'all'
  }
);

// Register event handlers
todoMachine
  .on('add', (ctx, text) => {
    ctx.items.push({
      id: Date.now(),
      text: String(text),
      completed: false
    });
  })
  .on('toggle', (ctx, id) => {
    const item = ctx.items.find(item => item.id === id);
    if (item) {
      item.completed = !item.completed;
    }
  })
  .on('remove', (ctx, id) => {
    ctx.items = ctx.items.filter(item => item.id !== id);
  })
  .on('setFilter', (ctx, filter) => {
    ctx.filter = filter;
  })
  .on('clearCompleted', (ctx) => {
    ctx.items = ctx.items.filter(item => !item.completed);
  });

// Register one-time event handler
todoMachine.once('initialize', (ctx, initialItems) => {
  ctx.items = initialItems || [];
});

// Fire events
todoMachine.fire('add', 'Learn Valtio FSM');
todoMachine.fire('add', 'Build an awesome app');
todoMachine.fire('toggle', todoMachine.context.items[0].id);
todoMachine.fire('setFilter', 'active');
```

### Dynamic Machine Configuration

```typescript
import { createMachine } from 'valtio-fsm';

type EditorState = 'view' | 'edit' | 'preview' | 'locked';
type EditorContext = {
  content: string;
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
  };
  lastModified: Date | null;
};

// Create with minimal config, build it dynamically
const editorMachine = createMachine<EditorState, EditorContext>(
  'view',
  {
    view: { transitions: ['edit'] }
  },
  {
    content: '',
    permissions: {
      canEdit: false,
      canDelete: false
    },
    lastModified: null
  }
);

// Dynamically add states, transitions and handlers
editorMachine
  .addTransition('view', 'locked')
  .addTransition('edit', 'preview')
  .addTransition('edit', 'view')
  .addTransition('preview', 'edit')
  .addTransition('preview', 'view')
  .addTransition('locked', 'view')
  
  .setHandler('edit', 'onEnter', (ctx) => {
    // Save original content for undo
    ctx._originalContent = ctx.content;
  })
  
  .setHandler('edit', 'onExit', (ctx) => {
    // Update last modified timestamp
    ctx.lastModified = new Date();
  });

// Update transitions based on permissions
function updatePermissions(canEdit: boolean, canDelete: boolean) {
  editorMachine.getStore().context.permissions = { canEdit, canDelete };
  
  // If user can't edit, remove edit transition
  if (!canEdit) {
    editorMachine.removeTransition('view', 'edit');
  } else {
    editorMachine.addTransition('view', 'edit');
  }
}
```

### Integration with React

```tsx
import { createMachine } from 'valtio-fsm';
import { useSnapshot } from 'valtio';
import { useState, useEffect } from 'react';

type WizardState = 'step1' | 'step2' | 'step3' | 'complete';
type WizardContext = {
  formData: {
    name: string;
    email: string;
    plan: string;
    agreeToTerms: boolean;
  };
  validationErrors: Record<string, string>;
};

const wizardMachine = createMachine<WizardState, WizardContext>(
  'step1',
  {
    step1: { 
      transitions: ['step2'],
      onExit: (ctx) => validateStep1(ctx)
    },
    step2: { 
      transitions: ['step1', 'step3'],
      onExit: (ctx) => validateStep2(ctx)
    },
    step3: { 
      transitions: ['step2', 'complete'],
      onExit: (ctx) => validateStep3(ctx)
    },
    complete: { 
      transitions: [] 
    }
  },
  {
    formData: {
      name: '',
      email: '',
      plan: '',
      agreeToTerms: false
    },
    validationErrors: {}
  }
);

// Validation functions
function validateStep1(ctx) {
  const errors = {};
  if (!ctx.formData.name) errors.name = 'Name is required';
  if (!ctx.formData.email) errors.email = 'Email is required';
  ctx.validationErrors = errors;
  return Object.keys(errors).length === 0;
}

function validateStep2(ctx) {
  const errors = {};
  if (!ctx.formData.plan) errors.plan = 'Please select a plan';
  ctx.validationErrors = errors;
  return Object.keys(errors).length === 0;
}

function validateStep3(ctx) {
  const errors = {};
  if (!ctx.formData.agreeToTerms) {
    errors.agreeToTerms = 'You must agree to terms';
  }
  ctx.validationErrors = errors;
  return Object.keys(errors).length === 0;
}

// React wizard component
function Wizard() {
  const snap = useSnapshot(wizardMachine.getStore());
  
  function handleNext() {
    const currentState = wizardMachine.current;
    if (currentState === 'step1') wizardMachine.moveTo('step2');
    else if (currentState === 'step2') wizardMachine.moveTo('step3');
    else if (currentState === 'step3') wizardMachine.moveTo('complete');
  }
  
  function handleBack() {
    const currentState = wizardMachine.current;
    if (currentState === 'step2') wizardMachine.moveTo('step1');
    else if (currentState === 'step3') wizardMachine.moveTo('step2');
  }
  
  function updateFormData(field, value) {
    wizardMachine.getStore().context.formData[field] = value;
  }
  
  return (
    <div className="wizard">
      <div className="wizard-progress">
        {['step1', 'step2', 'step3', 'complete'].map(step => (
          <div 
            key={step} 
            className={`wizard-step ${snap.state === step ? 'active' : ''}`}
          />
        ))}
      </div>
      
      {snap.state === 'step1' && (
        <div className="wizard-page">
          <h2>Personal Information</h2>
          <input
            type="text"
            placeholder="Name"
            value={snap.context.formData.name}
            onChange={(e) => updateFormData('name', e.target.value)}
          />
          {snap.context.validationErrors.name && (
            <p className="error">{snap.context.validationErrors.name}</p>
          )}
          <input
            type="email"
            placeholder="Email"
            value={snap.context.formData.email}
            onChange={(e) => updateFormData('email', e.target.value)}
          />
          {snap.context.validationErrors.email && (
            <p className="error">{snap.context.validationErrors.email}</p>
          )}
        </div>
      )}
      
      {/* Step 2 and 3 components here */}
      
      {snap.state === 'complete' && (
        <div className="wizard-complete">
          <h2>Thank you!</h2>
          <p>Your registration is complete.</p>
        </div>
      )}
      
      <div className="wizard-controls">
        {snap.state !== 'step1' && snap.state !== 'complete' && (
          <button onClick={handleBack}>Back</button>
        )}
        {snap.state !== 'complete' && (
          <button onClick={handleNext}>
            {snap.state === 'step3' ? 'Complete' : 'Next'}
          </button>
        )}
      </div>
    </div>
  );
}
```

## Best Practices

### State Design

1. **Keep States Minimal**: Create states only for distinct UI/app conditions.
2. **Use Explicit Transitions**: Always define allowed transitions for better predictability.
3. **Avoid Too Many States**: Use context for variations within a state.

### Context Management

1. **Keep Context Serializable**: Avoid functions or complex objects in context when possible.
2. **Normalize Context Data**: Structure context data for easy access and updates.
3. **Use Event Handlers**: For complex context updates, use events rather than direct mutations.

### Handlers

1. **Keep Handlers Pure**: Avoid side effects in handlers when possible.
2. **Error Handling**: Wrap handler code in try/catch for resilience.
3. **Validation in Exit Handlers**: Use onExit handlers to validate before transitions.

### React Integration

1. **Use Snapshots**: Always use `useSnapshot(machine.getStore())` in React components.
2. **Subscribe Selectively**: When possible, subscribe to specific parts of the store for better performance.
3. **Reset on Unmount**: Consider resetting context when components unmount.

### Performance

1. **Limit History Size**: Set appropriate history size for your application needs.
2. **Clean Up Listeners**: Remove listeners when no longer needed.
3. **Batch Context Updates**: Group related context changes to reduce re-renders.

## Debugging

### Transition History

Use the history features to debug state transition issues:

```typescript
// Enable history if not already enabled
machine.enableHistory();

// Get all transitions
const history = machine.getHistory();
console.log('Transition history:', history);

// Listen to transitions
machine.onTransition((from, to, payload) => {
  console.log(`Transition: ${from} → ${to}`, payload);
});
```

### Context Changes

Track context changes to debug data flow issues:

```typescript
machine.onContextChange((context, changes) => {
  console.log('Context changes:', changes);
});
```

## License

MIT
import { defineConfig } from 'vitepress';
import * as sidebar from './typedoc-sidebar.json';

// Extract machine methods to create a custom sidebar section
const methodLinks = [
  // Core API
  { text: 'current (property)', link: '/api/interfaces/ChainableStateMachine.html#current' },
  { text: 'context (property)', link: '/api/interfaces/ChainableStateMachine.html#context' },
  { text: 'getStore()', link: '/api/interfaces/ChainableStateMachine.html#getstore' },
  { text: 'moveTo()', link: '/api/interfaces/ChainableStateMachine.html#moveto' },
  { text: 'resetContext()', link: '/api/interfaces/ChainableStateMachine.html#resetcontext' },
  { text: 'isIn()', link: '/api/interfaces/ChainableStateMachine.html#isin' },
  { text: 'canMoveTo()', link: '/api/interfaces/ChainableStateMachine.html#canmoveto' },
  
  // Events
  { text: 'on()', link: '/api/interfaces/ChainableStateMachine.html#on' },
  { text: 'once()', link: '/api/interfaces/ChainableStateMachine.html#once' },
  { text: 'off()', link: '/api/interfaces/ChainableStateMachine.html#off' },
  { text: 'fire()', link: '/api/interfaces/ChainableStateMachine.html#fire' },
  
  // Listeners
  { text: 'onTransition()', link: '/api/interfaces/ChainableStateMachine.html#ontransition' },
  { text: 'whenIn()', link: '/api/interfaces/ChainableStateMachine.html#whenin' },
  { text: 'onContextChange()', link: '/api/interfaces/ChainableStateMachine.html#oncontextchange' },
  
  // Configuration
  { text: 'setTransitions()', link: '/api/interfaces/ChainableStateMachine.html#settransitions' },
  { text: 'addTransition()', link: '/api/interfaces/ChainableStateMachine.html#addtransition' },
  { text: 'removeTransition()', link: '/api/interfaces/ChainableStateMachine.html#removetransition' },
  { text: 'setHandler()', link: '/api/interfaces/ChainableStateMachine.html#sethandler' },
  
  // History
  { text: 'getHistory()', link: '/api/interfaces/ChainableStateMachine.html#gethistory' },
  { text: 'clearHistory()', link: '/api/interfaces/ChainableStateMachine.html#clearhistory' },
  { text: 'enableHistory()', link: '/api/interfaces/ChainableStateMachine.html#enablehistory' },
  { text: 'setHistorySize()', link: '/api/interfaces/ChainableStateMachine.html#sethistorysize' }
];

// Create custom sidebar with machine methods
const customSidebar = [
  {
    text: 'Getting Started',
    items: [
      { text: 'Introduction', link: '' },
      { text: 'createMachine()', link: '/api/functions/createMachine.html' },
      { text: 'Full API', link: '/api/interfaces/ChainableStateMachine.html' }
    ]
  },
  {
    text: 'Machine Methods',
    collapsed: false,
    items: methodLinks
  },
  ...sidebar.default
];

export default defineConfig({
  title: 'Valtio FSM',
  description: 'A finite state machine library for Valtio',
  themeConfig: {
    nav: [
      { text: 'API', link: '/api' },
      { text: 'GitHub', link: 'https://github.com/valtiojs/valtio-fsm' }
    ],
    sidebar: {
      '/': customSidebar
    },
    search: {
      provider: 'local'
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/valtiojs/valtio-fsm' }
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025 Michael Sweeney'
    }
  }
});
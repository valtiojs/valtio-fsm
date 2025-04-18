import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  MarkerType,
  type OnConnect,
  type Node,
  type NodeMouseHandler,
  type OnEdgesDelete,
  type Edge,
  type OnNodesDelete,
  type OnSelectionChangeFunc,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeTypes } from '../nodes';
import { initialEdges, edgeTypes } from '../edges';
import { type DragEvent, useCallback, useRef, useState, useEffect } from 'react';
import { useDnD } from './DnDContext';
import FloatingConnectionLine from '@/components/FloatingConnectionLine';
import { codeStore, type StateNode } from '@/app/store';
import { subscribe, useSnapshot } from 'valtio';

let id = 0;
const getId = () => `${id++}`;

subscribe(codeStore, () => console.log(codeStore))

const FlowChart = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const storeNodes = useSnapshot(codeStore.nodes);
  
  // Create local nodes state that will sync with the store
  const [nodes, setNodes, onNodesChange] = useNodesState(
    storeNodes.map((n: StateNode) => n.flowNode)
  );
  
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  // Effect to update local nodes when store nodes change
  useEffect(() => {
    setNodes(storeNodes.map((n: StateNode) => n.flowNode));
  }, [storeNodes, setNodes]);
  
  const onConnect: OnConnect = useCallback(
    (params) => {
      const { source, target } = params
      const sourceNode = codeStore.nodes.find((n: StateNode) => n.flowNode.id === source)
      const targetNode = codeStore.nodes.find((n: StateNode) => n.flowNode.id === target)

      if (sourceNode && targetNode) sourceNode?.transitions.push(targetNode)

      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'floating',
            markerEnd: { type: MarkerType.Arrow },
          },
          eds,
        ),
      )
    },
    [setEdges],
  );
  
  const [colorMode, _setColorMode] = useState<'light' | 'dark' | 'system'>('dark');
  const [type] = useDnD();
  const { screenToFlowPosition } = useReactFlow();

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      // check if the dropped element is valid
      if (!type || !reactFlowWrapper.current) {
        return;
      }

       const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      
      // Calculate position relative to the React Flow container
      // and adjust for panning and zooming
      const position = screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNodeId = getId();
      
      const name = nodes.length === 0 ? 'idle' : `new_state${id - 1}`
      
      // Create the node with the correct type
      const newNode = {
        id: newNodeId,
        name,
        transitions: [],
        isInitial: codeStore.nodes.length === 0,
        flowNode: {
          id: newNodeId,
          type: 'state-node', // Make sure this matches your defined node type
          position: { x: position.x + 250, y: position.y - 40},
          data: { label: name },
        }
      };

      codeStore.nodes.push(newNode);
    },
    [screenToFlowPosition, type, nodes],
  );

  const onEdgesDelete: OnEdgesDelete = (edges: Edge[]) => {
    for(const edge of edges) {
      const sourceNode = codeStore.nodes.find((n: StateNode) => edge.source === n.flowNode.id)
      if (sourceNode) {
        sourceNode.transitions = sourceNode.transitions.filter((n: StateNode) => n.flowNode.id !== edge.target)
      }
    }
  }

  const onNodesDelete: OnNodesDelete = (nodes: Node[]) => {
    // Get array of IDs to delete
    const idsToDelete = nodes.map(node => node.id);
    
    // First, remove transitions that point to nodes being deleted
    for (const sourceNode of codeStore.nodes) {
      sourceNode.transitions = sourceNode.transitions.filter(
        (targetNode: StateNode) => !idsToDelete.includes(targetNode.flowNode.id)
      );
    }
    
    // Then, remove the nodes themselves
    codeStore.nodes = codeStore.nodes.filter((codeStoreNode: StateNode) => 
      !idsToDelete.includes(codeStoreNode.flowNode.id)
    );
  };

  const onSelectionChange:OnSelectionChangeFunc = ({ nodes }) => {
    console.log(nodes)
    if (nodes.length !== 1) {
      codeStore.selectedNode = -1
    }
    if (nodes.length === 1) {
      codeStore.selectedNode = Number(nodes[0].id)
    } else {
      codeStore.selectedNode = -1
    }
  }

  // Function to update node positions in the store - memoized
  const updateNodePosition = useCallback((nodeId: string, position: { x: number, y: number }) => {
    const nodeIndex = codeStore.nodes.findIndex((n: StateNode) => n.flowNode.id === nodeId);
    if (nodeIndex !== -1) {
      codeStore.nodes[nodeIndex].flowNode.position = position;
    }
  }, []);

  // Handle node drag - using the correct type from React Flow
  const onNodeDragStop: NodeMouseHandler = useCallback((_event, node) => {
    // Update position in store
    updateNodePosition(node.id, node.position);
  }, [updateNodePosition]);

  return (
    <div ref={reactFlowWrapper} style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        className='w-fit h-fit'
        nodes={nodes}
        nodeTypes={nodeTypes}
        edges={edges}
        edgeTypes={edgeTypes}
        connectionLineComponent={FloatingConnectionLine}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgesDelete={onEdgesDelete}
        onNodesDelete={onNodesDelete}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeDragStop={onNodeDragStop}
        onSelectionChange={onSelectionChange}
        colorMode={colorMode}
        fitView
      >
        <Background style={{ background: '#171717'}} />
        <MiniMap />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default FlowChart;
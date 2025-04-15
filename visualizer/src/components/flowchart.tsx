import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type OnConnect,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { initialNodes, nodeTypes } from '../nodes';
import { initialEdges, edgeTypes } from '../edges';
import { type DragEvent, useCallback, useRef, useState } from 'react';
import {useDnD } from './DnDContext';
import type { StateNode } from '@/nodes/types';

let id = 0;
const getId = () => `dndnode_${id++}`;

const FlowChart = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((edges) => addEdge(connection, edges)),
    [setEdges]
  );
  const [colorMode, _setColorMode] = useState<'light' | 'dark' | 'system'>('dark')
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

      // Get the bounds of the React Flow container
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      
      // Calculate position relative to the React Flow container
      const position = screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      // Create the node with the correct type
      const newNode = {
        id: getId(),
        type: 'state-node', // This should match one of your defined node types
        position,
        data: { label: `${type} node` },
      }; // Cast to your AppNode type

      setNodes((nds) => nds.concat(newNode as StateNode));
    },
    [screenToFlowPosition, type, setNodes],
  );

  return (
  <div ref={reactFlowWrapper} style={{ width: '100%', height: '100%' }}>
    <ReactFlow
      className='w-fit h-fit'
      nodes={nodes}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      edges={edges}
      edgeTypes={edgeTypes}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onDrop={onDrop}
      onDragOver={onDragOver}
      colorMode={colorMode}
      fitView
    >
      <Background style={{ background: '#171717'}} />
      <MiniMap />
      <Controls />
    </ReactFlow>
  </div>
  )

}
export default FlowChart
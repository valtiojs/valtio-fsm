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
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { initialNodes, nodeTypes } from '../nodes';
import { initialEdges, edgeTypes } from '../edges';
import { type DragEvent, useCallback, useRef, useState } from 'react';
import {useDnD } from './DnDContext';
import type { StateNode } from '@/nodes/types';
import FloatingConnectionLine from '@/components/FloatingConnectionLine'
import { codeStore } from '@/app/store'
import { useSnapshot } from 'valtio';


let id = 0;
const getId = () => `dndnode_${id++}`;

const FlowChart = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const nodes = useSnapshot(codeStore.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const onConnect: OnConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'floating',
            markerEnd: { type: MarkerType.Arrow },
          },
          eds,
        ),
      ),
    [setEdges],
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
        name: 'node',
        transitions: [],
        isInitial: nodes.length === 0,
        flowNode: {
          id: getId(),
          position,
          data: { label: 'node' },
        }
      }; // Cast to your AppNode type

      codeStore.nodes.push(newNode)
    },
    [screenToFlowPosition, type, nodes],
  );

  return (
  <div ref={reactFlowWrapper} style={{ width: '100%', height: '100%' }}>
    <ReactFlow
      className='w-fit h-fit'
      nodes={nodes.map(n => n.flowNode)}
      nodeTypes={nodeTypes}
      edges={edges}
      edgeTypes={edgeTypes}
      connectionLineComponent={FloatingConnectionLine}
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
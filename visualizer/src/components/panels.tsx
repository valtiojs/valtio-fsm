import { useCallback, useLayoutEffect, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type OnConnect,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { initialNodes, nodeTypes } from '../nodes';
import { initialEdges, edgeTypes } from '../edges';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './ui/resizable';
import Code from '@/components/code'

export default function App() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((edges) => addEdge(connection, edges)),
    [setEdges]
  );
  const [colorMode, setColorMode] = useState<'light' | 'dark' | 'system'>('dark')

  return (
    <div>
    <ResizablePanelGroup direction="horizontal" className="min-h-screen">
      <ResizablePanel defaultSize={50} className="h-dvh overflow-auto">
        <ReactFlow
          className='w-fit h-fit'
          nodes={nodes}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          edges={edges}
          edgeTypes={edgeTypes}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          colorMode={colorMode}
          fitView
        >
          <Background style={{ background: '#171717'}} />
          <MiniMap />
          <Controls />
        </ReactFlow>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel className="h-dvh overflow-auto">
        <Code />
      </ResizablePanel>
    </ResizablePanelGroup>
    </div>
  );
}

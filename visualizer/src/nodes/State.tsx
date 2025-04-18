import { Handle, Position, useConnection, type NodeProps } from '@xyflow/react';
import { Move } from "@mynaui/icons-react";
import { useSnapshot } from 'valtio'
import { codeStore, type StateNode } from '@/app/store'
 
export default function stateNode({ id }:NodeProps) {
  const storeNodes = useSnapshot(codeStore.nodes)

  const connection = useConnection();
 
  const isTarget = connection.inProgress && connection.fromNode.id !== id;

  const label = storeNodes.find((n: StateNode) => Number(n.flowNode.id) === Number(id))?.name || ''
 
  return (
    <div className="flex justify-between gap-5 customNode items-center">
      <span className='p-3'><Move  className="drag-handle__custom" /></span>
      <div
        className="customNodeBody p-3"
      >
        {!connection.inProgress && (
          <Handle
            className="customHandle"
            position={Position.Right}
            type="source"
          />
        )}
        {/* We want to disable the target handle, if the connection was started from this node */}
        {(!connection.inProgress || isTarget) && (
          <Handle className="customHandle" position={Position.Left} type="target" isConnectableStart={false} />
        )}
        {label as string}
        
      </div>
    </div>
  );
}
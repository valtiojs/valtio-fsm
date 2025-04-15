import { Handle, Position, type NodeProps } from '@xyflow/react';

import type { AppNode } from './types';

export function StateNode({
  data,
}: NodeProps<AppNode>) {

  return (
    <div className="react-flow__node-default">
      {data.label && <div>{data.label}</div>}
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

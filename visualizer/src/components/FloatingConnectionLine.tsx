import { getBezierPath, type InternalNode, type ConnectionLineComponentProps } from '@xyflow/react';
 
import { getEdgeParams } from '@/lib/utils';
 
function FloatingConnectionLine({
  toX,
  toY,
  fromPosition,
  toPosition,
  fromNode,
}:ConnectionLineComponentProps) {
  if (!fromNode) {
    return null;
  }
 
  // Create a mock target node at the cursor position
  const targetNode: InternalNode = {
    id: 'connection-target',
    position: {x:0, y:0},
    data:{},
    measured: {
      width: 1,
      height: 1,
    },
    internals: {
      positionAbsolute: { x: toX, y: toY },
      z: 1,
      userNode: fromNode
    },
  };
 
  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(
    fromNode,
    targetNode,
  );
 
  const [edgePath] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos || fromPosition,
    targetPosition: targetPos || toPosition,
    targetX: tx || toX,
    targetY: ty || toY,
  });
 
  return (
    <g>
      <path
        fill="none"
        stroke="#222"
        strokeWidth={1.5}
        className="animated"
        d={edgePath}
      />
      <circle
        cx={tx || toX}
        cy={ty || toY}
        fill="#fff"
        r={3}
        stroke="#222"
        strokeWidth={1.5}
      />
    </g>
  );
}
 
export default FloatingConnectionLine;
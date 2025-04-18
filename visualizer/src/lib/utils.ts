import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { XYPosition, InternalNode } from "@xyflow/react"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

import { Position, type MarkerType, type Node } from "@xyflow/react"

// this helper function returns the intersection point
// of the line between the center of the intersectionNode and the target node
export function getNodeIntersection(
	intersectionNode: InternalNode,
	targetNode: InternalNode,
): { x: number; y: number } {
	// https://math.stackexchange.com/questions/1724792/an-algorithm-for-finding-the-intersection-point-between-a-center-of-vision-and-a
	// const { width: intersectionNodeWidth, height: intersectionNodeHeight } =
	// 	intersectionNode.measured || { width: 0, height: 0 }

	const intersectionNodeWidth = intersectionNode.measured.width || 0
	const intersectionNodeHeight = intersectionNode.measured.height || 0

	const intersectionNodePosition = intersectionNode.internals
		?.positionAbsolute || { x: 0, y: 0 }
	const targetPosition = targetNode.internals?.positionAbsolute || {
		x: 0,
		y: 0,
	}

	const w = intersectionNodeWidth / 2
	const h = intersectionNodeHeight / 2

	const x2 = intersectionNodePosition.x + w
	const y2 = intersectionNodePosition.y + h
	const x1 = targetPosition.x + (targetNode.measured?.width || 0) / 2
	const y1 = targetPosition.y + (targetNode.measured?.height || 0) / 2

	const xx1 = (x1 - x2) / (2 * w) - (y1 - y2) / (2 * h)
	const yy1 = (x1 - x2) / (2 * w) + (y1 - y2) / (2 * h)
	const a = 1 / (Math.abs(xx1) + Math.abs(yy1))
	const xx3 = a * xx1
	const yy3 = a * yy1
	const x = w * (xx3 + yy3) + x2
	const y = h * (-xx3 + yy3) + y2

	return { x, y }
}

// returns the position (top,right,bottom or left) of passed node compared to the intersection point
export function getEdgePosition(
	node: InternalNode,
	intersectionPoint: XYPosition,
): Position {
	const nodePosition = node.internals?.positionAbsolute || { x: 0, y: 0 }
	const nx = Math.round(nodePosition.x)
	const ny = Math.round(nodePosition.y)
	const px = Math.round(intersectionPoint.x)
	const py = Math.round(intersectionPoint.y)
	const nodeWidth = node.measured?.width || 0
	const nodeHeight = node.measured?.height || 0

	if (px <= nx + 1) {
		return Position.Left
	}
	if (px >= nx + nodeWidth - 1) {
		return Position.Right
	}
	if (py <= ny + 1) {
		return Position.Top
	}
	if (py >= ny + nodeHeight - 1) {
		return Position.Bottom
	}

	return Position.Top
}

// returns the parameters (sx, sy, tx, ty, sourcePos, targetPos) you need to create an edge
export function getEdgeParams(
	source: InternalNode,
	target: InternalNode,
): {
	sx: number
	sy: number
	tx: number
	ty: number
	sourcePos: Position
	targetPos: Position
} {
	const sourceIntersectionPoint = getNodeIntersection(source, target)
	const targetIntersectionPoint = getNodeIntersection(target, source)

	const sourcePos = getEdgePosition(source, sourceIntersectionPoint)
	const targetPos = getEdgePosition(target, targetIntersectionPoint)

	return {
		sx: sourceIntersectionPoint.x,
		sy: sourceIntersectionPoint.y,
		tx: targetIntersectionPoint.x,
		ty: targetIntersectionPoint.y,
		sourcePos,
		targetPos,
	}
}

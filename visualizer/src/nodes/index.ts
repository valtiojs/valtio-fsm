import type { NodeTypes } from "@xyflow/react"

import stateNode from "./State"
import type { AppNode } from "./types"

export const initialNodes: AppNode[] = []

export const nodeTypes = {
	"state-node": stateNode,
	// Add any of your custom nodes here!
} satisfies NodeTypes

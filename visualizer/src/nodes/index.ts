import type { NodeTypes } from "@xyflow/react"

import { StateNode } from "./State"
import type { AppNode } from "./types"

export const initialNodes: AppNode[] = []

export const nodeTypes = {
	"state-node": StateNode,
	// Add any of your custom nodes here!
} satisfies NodeTypes

import type { Node, BuiltInNode } from "@xyflow/react"

export type StateNode = Node<{ label: string; type: "default" }, "state-node">
export type AppNode = BuiltInNode | StateNode

import type { Node, BuiltInNode } from "@xyflow/react"

declare module "valtio" {
	function useSnapshot<T extends object>(p: T): T
}

export type StateNode = Node<{ label: string; type: "default" }, "state-node">
export type AppNode = BuiltInNode | StateNode

export type CodeWrap<T> = {
	id: string
	name: string
	transitions: CodeWrap<T>[]
	isInitial: boolean
	flowNode: T
}

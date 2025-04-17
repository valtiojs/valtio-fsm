import type { XYPosition } from "@xyflow/react"
import { proxy, subscribe } from "valtio"
import { deepClone } from "valtio/utils"
export * as js from "@/lib/javascriptTemplates"
export * as ts from "@/lib/typescriptTemplates"

export interface StateNode {
	id: string
	name: string
	transitions: string[]
	isInitial: boolean
	flowNode: {
		id: string
		position: XYPosition
		data: {
			label: string
		}
	}
}

export interface CodeState {
	nodes: StateNode[]
	useEmptySymbol: boolean
	symbolName: string
	symbolDescription: string
	useMachineOptions: boolean
	stateVariableName: string
	stateTypeName: string
	includeStateDestructure: boolean
	stateConfigVariable: string
	contextTypeName: string
	configVariable: string
	enableHistory: string
	historySize: number
	machineVariable: string
	machineConfigVariable: string
	contextVariable: string
	initialStateVariable: string
	storeVariable: string
	language: "typescript" | "javascript"
	selectedNode: number
}

export const initialState: CodeState = {
	nodes: [],
	useEmptySymbol: true,
	symbolName: "EMPTY",
	symbolDescription: "Empty Value",
	useMachineOptions: true,
	stateVariableName: "STATE",
	stateTypeName: "State",
	includeStateDestructure: true,
	stateConfigVariable: "stateConfig",
	contextTypeName: "Context",
	configVariable: "machineConfig",
	enableHistory: "false",
	historySize: 0,
	machineVariable: "machine",
	machineConfigVariable: "machineConfig",
	contextVariable: "initialContext",
	initialStateVariable: "idle",
	storeVariable: "store",
	language: "typescript",
	selectedNode: -1,
}

export const codeStore = proxy(deepClone(initialState))

import type { XYPosition } from "@xyflow/react"
import { proxy } from "valtio"
import { deepClone } from "valtio/utils"
export * as js from "@/lib/javascriptTemplates"
export * as ts from "@/lib/typescriptTemplates"
import { nanoid } from "nanoid"

const initialStateNode: StateNode = {
	name: "idle",
	transitions: [],
	isInitial: true,
	flowNode: {
		id: nanoid(),
		position: { x: -200, y: 0 },
		data: {
			label: "idle",
		},
	},
}

export interface StateNode {
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
}

export const initialState: CodeState = {
	nodes: [initialStateNode],
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
	initialStateVariable: initialStateNode.name,
	storeVariable: "store",
	language: "typescript",
}

export const codeStore = proxy(deepClone(initialState))

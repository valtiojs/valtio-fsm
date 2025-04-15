import type { StateNode } from "@/app/store"

export const importMachine = ({
	useMachineOptions = true,
}: {
	useMachineOptions?: boolean
} = {}) =>
	`import { createMachine, type StateConfig ${useMachineOptions ? ", type MachineOptions " : ""}} from 'valtio-fsm'`

export const emptySymbol = ({
	symbolName = "EMPTY",
	symbolDescription = "Empty Value",
}: {
	symbolName: string
	symbolDescription: string
}) => `
// Symbol to use as default empty values
const ${symbolName} = Symbol('${symbolDescription}')
// Generic to intialize with empty values
export type Initial<T> = {
	[K in keyof T]: T[K] | typeof EMPTY
}`

export const stateDefinition = ({
	nodes,
	stateVariableName = "STATE",
	stateTypeName = "State",
	includeStateDestructure = true,
}: {
	nodes: string[]
	stateVariableName?: string
	stateTypeName?: string
	includeStateDestructure?: boolean
}) => {
	let template = `
/**
 * State Definition 
 */
export const ${stateVariableName} = {`
	for (const node of nodes) {
		template += `
  ${node}: '${node}',`
	}

	template = `${template.substring(0, template.length - 1)} ` // remove last comma and add space
	template += `
} as const

export type ${stateTypeName} = (typeof ${stateVariableName})[keyof typeof ${stateVariableName}]`

	if (includeStateDestructure) {
		const nodesStringLength = nodes.reduce((total, str) => {
			return total + str.length + 2
		}, 19) // 19 is the combined length of the characters we have so far
		console.log(nodesStringLength)

		if (nodesStringLength > 80) {
			template += `
export const {
`
			for (const node of nodes) {
				template += `  ${node},
`
			}
			template += `} = ${stateVariableName}`
		} else {
			template += `
export const {`
			for (const node of nodes) {
				template += ` ${node},`
			}

			template = `${template.substring(0, template.length - 1)} ` // remove last comma and add space

			template += `} = ${stateVariableName}`
		}
	}

	return template
}

export const contextDefinition = ({
	useEmptySymbol = true,
}: {
	useEmptySymbol?: boolean
} = {}) => {
	const template = `
/**
 * Context Definition
 */
// This is an example context definition - replace with your own
export interface Context {
	name: string,
	age: number
}

const initialContext: ${useEmptySymbol ? "Initial<Context>" : "Context"} = {
	name: ${useEmptySymbol ? "EMPTY" : "''"},
	age: ${useEmptySymbol ? "EMPTY" : "0"}
}`

	return template
}

export const stateConfig = ({
	nodes,
	useDestructured = true,
	stateConfigVariable = "stateConfig",
	contextTypeName = "Context",
	stateTypeName = "State",
}: {
	nodes: StateNode[]
	useDestructured?: boolean
	stateConfigVariable?: string
	contextTypeName?: string
	stateTypeName?: string
}) => {
	const getVarName = (str: string) => (useDestructured ? `${str}` : `'${str}'`)

	let template = `
/**
 * Transitions - Specify which state can trasition to which other states
 */
export const ${stateConfigVariable}: StateConfig<${stateTypeName}, ${contextTypeName}> = {`
	for (const node of nodes) {
		template += `
	${getVarName(node.name)}: {
		transitions: [ `
		for (const t of node.transitions) {
			template += ` ${getVarName(t)},`
		}
		template = `${template.substring(0, template.length - 1)} ` // remove last comma and add space

		template += `]
	},`
	}

	template = `${template.substring(0, template.length - 1)} ` // remove last comma and add space

	template += `
}`

	return template
}

export const machineConfig = ({
	configVariable = "machineConfig",
	stateTypeName = "State",
	enableHistory = "false",
	historySize = 0,
	onTransition = `(fromState, toState, payload) => {
		console.log(\`Transitioning from '\${fromState}' to '\${toState}'\`)
		console.dir(payload)
	}`,
}: {
	configVariable?: string
	stateTypeName?: string
	enableHistory?: string
	historySize?: number
	onTransition?: string
} = {}) => {
	const template = `
// This is an example machine config
const ${configVariable}: MachineOptions<${stateTypeName}> = {
	enableHistory: ${enableHistory},
	historySize: ${historySize},
	onTransition: ${onTransition}
}`

	return template
}

export const defineMachine = ({
	machineVariable = "machine",
	initialStateVarable = "idle",
	stateConfigVariable = "stateConfig",
	contextVariable = "initialContext",
	storeVariable = "store",
	machineConfigVariable = "machineConfig",
	useMachineConfig = false,
}: {
	machineVariable?: string
	initialStateVarable?: string
	stateConfigVariable?: string
	contextVariable?: string
	storeVariable?: string
	machineConfigVariable?: string
	useMachineConfig?: boolean
} = {}) => {
	const template = `export const ${machineVariable} = createMachine(${initialStateVarable}, ${stateConfigVariable}, ${contextVariable}${useMachineConfig ? `, ${machineConfigVariable}` : ""})
export const ${storeVariable} = ${machineVariable}.getStore()`
	return template
}

// console.log(
// 	`
// ${importMachine()}
// ${emptySymbol()}
// ${stateDefinition({
// 	nodes: ["idle", "state1", "state2"],
// })}
// ${contextDefinition({ useEmptySymbol: false })}
// ${stateConfig({
// 	nodes: [
// 		{
// 			name: "idle",
// 			transitions: ["state1", "state2"],
// 		},
// 		{
// 			name: "state1",
// 			transitions: ["state2"],
// 		},
// 		{
// 			name: "state2",
// 			transitions: ["state3"],
// 		},
// 	],
// })}
// ${machineConfig()}

// ${defineMachine()}
// `,
// )

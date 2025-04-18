import Panels from '@/components/panels'
import Layout from '@/app/layout'
import { ThemeProvider } from "@/components/theme-provider"
import { DnDProvider } from './components/DnDContext'
import { ReactFlowProvider } from '@xyflow/react'

const App = () => {
  return (
    <ReactFlowProvider>
      <DnDProvider>
        <ThemeProvider defaultTheme="dark" storageKey="valtio-fsm-visual">
          <Layout>
            <Panels />
          </Layout>
        </ThemeProvider>
      </DnDProvider>
    </ReactFlowProvider>
  )
}

export default App
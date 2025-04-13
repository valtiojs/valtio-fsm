import Panels from '@/components/panels'
import Layout from '@/app/layout'
import { ThemeProvider } from "@/components/theme-provider"

const App = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="valtio-fsm-visual">
      <Layout>
        <Panels />
      </Layout>
    </ThemeProvider>
  )
}

export default App
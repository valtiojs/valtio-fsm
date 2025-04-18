import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './ui/resizable';
import Code from '@/components/code'
import Flow from '@/components/flowchart'

export default function App() {
    return (
    <div>
    <ResizablePanelGroup direction="horizontal" className="min-h-screen">
      <ResizablePanel defaultSize={50} className="h-dvh overflow-auto">
        <Flow />
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel className="h-dvh overflow-auto">
        <Code />
      </ResizablePanel>
    </ResizablePanelGroup>
    </div>
  );
}

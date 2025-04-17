import { useState, useEffect } from 'react'
import { useSnapshot } from 'valtio';
import { codeStore as store} from '@/app/store';
import { Label } from './ui/label';
import { Input } from './ui/input';

export default function StateMachineForm() {
  const snap = useSnapshot(store);
  const [name, setName] = useState('');
  
  // Update local state when selected node changes
  useEffect(() => {
    const selectedId = snap.selectedNode;
    // Find the node with the matching ID
    const selectedNode = snap.nodes.find(n => Number(n.flowNode.id) === selectedId);
    
    // Update the name state with the selected node's name
    if (selectedNode) {
      setName(selectedNode.name);
    } else {
      setName('');
    }
  }, [snap.selectedNode, snap.nodes]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    
    // Update the store directly
    const nodeIndex = store.nodes.findIndex(n => Number(n.flowNode.id) === store.selectedNode);
    if (nodeIndex !== -1) {
      store.nodes[nodeIndex].name = newName;
    }
  }

  // Only render the form if a node is selected
  if (snap.selectedNode === -1) {
    return null;
  }

  return (
    <div className="space-y-6 p-4 w-full">
      <div className="space-y-2 mt-5">
        <Label className="text-sm text-muted-foreground">State Name</Label>
        <Input 
          value={name}
          onChange={handleChange}
          className="h-8 font-mono"
        />
      </div>
    </div>
  );
}
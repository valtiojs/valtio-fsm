import { useState, useEffect } from 'react'
import { useSnapshot } from 'valtio';
import { codeStore as store} from '@/app/store';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { subscribe } from 'valtio';

export default function StateMachineForm() {
  const [id, setId] = useState(-1)
  const [name, setName] = useState('')

  useEffect(() => {
    subscribe(store, () => {
      const selectedId = store.selectedNode
      const storeNode = store.nodes.find(n => Number(n.id) === id)
      const name = storeNode ? storeNode.name : ''

      if (id !== selectedId) {
        setId(store.selectedNode)
        setName(name)
      }
    })
  }, [id])
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName((_prev) => {
      const storeNode = store.nodes.find(n => id === Number(n.flowNode.id))
      if (storeNode) {
        storeNode.name = e.target.value
      }
      return e.target.value
    })
  }

  if (id === -1) {
    return ''
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

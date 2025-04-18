import { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import { codeStore as store, type CodeState } from '@/app/store';
import { proxy } from 'valtio';

// Import shadcn components - only using the basic components, not the Form components
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";



export function StateMachineForm() {
  const snap = useSnapshot(store);
  
  // Handlers for updating various parts of the state
  const handleStringChange = (key: keyof CodeState, value: string) => {
    if (typeof store[key] === 'string') {
      (store[key] as string) = value;
    }
  };
  
  const handleBooleanChange = (key: keyof CodeState, value: boolean) => {
    if (typeof store[key] === 'boolean') {
      (store[key] as boolean) = value;
    } else if (key === 'enableHistory') {
      // Special case for enableHistory which is a string
      store.enableHistory = value ? 'true' : 'false';
    }
  };
  
  const handleNumberChange = (key: keyof CodeState, value: number) => {
    if (typeof store[key] === 'number') {
      (store[key] as number) = value;
    }
  };

  return (
    <div className="space-y-6 p-4 w-full">
      <Accordion type="single" collapsible defaultValue="" className="w-full">
        {/* General Options Section */}
        <AccordionItem value="general">
          <AccordionTrigger className="text-sm font-medium text-muted-foreground">General Options</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Machine Variable Name</Label>
              <Input 
                value={snap.machineVariable} 
                onChange={(e) => handleStringChange('machineVariable', e.target.value)}
                className="h-8 font-mono"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Machine Config Variable</Label>
              <Input 
                value={snap.machineConfigVariable} 
                onChange={(e) => handleStringChange('machineConfigVariable', e.target.value)}
                className="h-8 font-mono"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Initial Context Variable</Label>
              <Input 
                value={snap.contextVariable} 
                onChange={(e) => handleStringChange('contextVariable', e.target.value)}
                className="h-8 font-mono"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Initial State Variable</Label>
              <Input 
                value={snap.initialStateVariable} 
                onChange={(e) => handleStringChange('initialStateVariable', e.target.value)}
                className="h-8 font-mono"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Store Variable</Label>
              <Input 
                value={snap.storeVariable} 
                onChange={(e) => handleStringChange('storeVariable', e.target.value)}
                className="h-8 font-mono"
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label className="text-sm text-muted-foreground">Use Machine Options</Label>
              <Switch 
                checked={snap.useMachineOptions}
                onCheckedChange={(checked) => handleBooleanChange('useMachineOptions', checked)}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
        
        {/* Symbol Options Section */}
        <AccordionItem value="symbols">
          <AccordionTrigger className="text-sm font-medium text-muted-foreground">Symbol Options</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label className="text-sm text-muted-foreground">Use Empty Symbol</Label>
              <Switch 
                checked={snap.useEmptySymbol}
                onCheckedChange={(checked) => handleBooleanChange('useEmptySymbol', checked)}
              />
            </div>
            
            {snap.useEmptySymbol && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Symbol Name</Label>
                  <Input 
                    value={snap.symbolName} 
                    onChange={(e) => handleStringChange('symbolName', e.target.value)}
                    className="h-8 font-mono"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Symbol Description</Label>
                  <Input 
                    value={snap.symbolDescription} 
                    onChange={(e) => handleStringChange('symbolDescription', e.target.value)}
                    className="h-8 font-mono"
                  />
                </div>
              </>
            )}
          </AccordionContent>
        </AccordionItem>
        
        {/* State Options Section */}
        <AccordionItem value="states">
          <AccordionTrigger className="text-sm font-medium text-muted-foreground">State Options</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">State Variable Name</Label>
              <Input 
                value={snap.stateVariableName} 
                onChange={(e) => handleStringChange('stateVariableName', e.target.value)}
                className="h-8 font-mono"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">State Type Name</Label>
              <Input 
                value={snap.stateTypeName} 
                onChange={(e) => handleStringChange('stateTypeName', e.target.value)}
                className="h-8 font-mono"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">State Config Variable</Label>
              <Input 
                value={snap.stateConfigVariable} 
                onChange={(e) => handleStringChange('stateConfigVariable', e.target.value)}
                className="h-8 font-mono"
              />
            </div>
            
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label className="text-sm text-muted-foreground">Include State Destructure</Label>
              <Switch 
                checked={snap.includeStateDestructure}
                onCheckedChange={(checked) => handleBooleanChange('includeStateDestructure', checked)}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
        
        {/* Context Options Section */}
        <AccordionItem value="context">
          <AccordionTrigger className="text-sm font-medium text-muted-foreground">Context Options</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Context Type Name</Label>
              <Input 
                value={snap.contextTypeName} 
                onChange={(e) => handleStringChange('contextTypeName', e.target.value)}
                className="h-8 font-mono"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Config Variable</Label>
              <Input 
                value={snap.configVariable} 
                onChange={(e) => handleStringChange('configVariable', e.target.value)}
                className="h-8 font-mono"
              />
            </div>
          </AccordionContent>
        </AccordionItem>
        
        {/* History Options Section */}
        <AccordionItem value="history">
          <AccordionTrigger className="text-sm font-medium text-muted-foreground">History Options</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label className="text-sm text-muted-foreground">Enable History</Label>
              <Switch 
                checked={snap.enableHistory === 'true'}
                onCheckedChange={(checked) => handleBooleanChange('enableHistory', checked)}
              />
            </div>
            
            {snap.enableHistory === 'true' && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">History Size: {snap.historySize}</Label>
                <Slider
                  min={0}
                  max={50}
                  step={1}
                  value={[snap.historySize]}
                  onValueChange={(value) => handleNumberChange('historySize', value[0])}
                  className="w-full"
                />
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
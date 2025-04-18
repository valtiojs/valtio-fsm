import { useState } from "react";
import { ChevronRight, PlusSquare, Code, Move } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenuButton,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { useDnD } from './DnDContext';
import type { DragEvent } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@radix-ui/react-collapsible";
import { StateMachineForm } from "./EditorPropertiesForm";
import StatePropertiesForm from "./StatePropertiesForm";

export function AppSidebar() {
  const [_, setType] = useDnD();
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
 
  const onDragStart = (event: DragEvent, nodeType: string) => {
    setType(nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Sidebar collapsible="icon" className="w-80">
      <SidebarContent>
        {/* Title changes from valtio-fsm to vsm when collapsed */}
        <div className="font-mono p-4">
          <span className="group-data-[collapsible=icon]:hidden">valtio-fsm</span>
          <div className='flex-col justify-center align-middle'>
            <span className="hidden group-data-[collapsible=icon]:block leading-4">vf</span>
            <span className="hidden group-data-[collapsible=icon]:block leading-4">sm</span>
          </div>
        </div>
        
        {/* Add State Node section */}

        <SidebarGroup>
          <SidebarGroupLabel>
            <PlusSquare className="h-4 w-4 mr-2" />
            <span className="group-data-[collapsible=icon]:hidden">Add State Node</span>
          </SidebarGroupLabel>
          <SidebarGroupContent className="flex flex-col items-center py-4 group-data-[collapsible=icon]:hidden">
            <div 
              className="bg-stone-800 w-48 text-center flex justify-evenly p-2.5 gap-5 text-base" 
              onDragStart={(event) => onDragStart(event, 'default')} 
              draggable
            >
              <Move /> Drag me
            </div>
            <StatePropertiesForm />
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator className='group-data-[collapsible=icon]:hidden' />
        {/* Code Editor Options section */}
        <Collapsible 
          open={isOptionsOpen} 
          onOpenChange={setIsOptionsOpen}
        >
          <SidebarGroup>
            <SidebarGroupLabel>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton>
                  <Code className="h-4 w-4 mr-2" />
                  <span className="group-data-[collapsible=icon]:hidden">Code Editor Options</span>
                  <ChevronRight 
                    className={`ml-auto transition-transform duration-300 ease-in-out group-data-[collapsible=icon]:hidden ${
                      isOptionsOpen ? "rotate-90" : ""
                    }`}
                  />
                </SidebarMenuButton>
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent className="flex flex-col items-center group-data-[collapsible=icon]:hidden">
                <StateMachineForm />
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>
    </Sidebar>
  )
}
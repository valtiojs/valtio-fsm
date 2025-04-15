import { useRef, useState, useEffect } from "react";
import Editor, { type Monaco } from '@monaco-editor/react';
import { js, ts, codeStore } from '@/app/store'
import { useSnapshot } from "valtio";

const TEMPLATE = {
  importMachine: 'importMachine',
  emptySymbol: 'emptySymbol',
  stateDefinition: 'stateDefinition',
  contextDefinition: 'contextDefinition',
  stateConfig: 'stateConfig',
  machineConfig: 'machineConfig',
  defineMachine: 'defineMachine'
} as const

const Code = () => {
  const [language, setLanguage] = useState<string>("typescript");
  const [showDropdown, setShowDropdown] = useState<boolean>(true);
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const editorRef = useRef<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<number | null>(null);
  const topRightAreaRef = useRef<HTMLDivElement>(null);
  const [template, setTemplate] = useState('')
  const snap = useSnapshot(codeStore)

  useEffect(() => {
    const lang = language === 'typescript' ? ts : js

    setTemplate(`${lang[TEMPLATE.importMachine]({
      useMachineOptions: snap.useMachineOptions
    })}${snap.useEmptySymbol ? `${lang[TEMPLATE.emptySymbol]({
      symbolName: snap.symbolName,
      symbolDescription: snap.symbolDescription
    })}` : ''}
${lang[TEMPLATE.stateDefinition]({
	nodes: snap.nodes.map(node => node.name),
  stateVariableName: snap.stateVariableName,
  stateTypeName: snap.stateTypeName,
  includeStateDestructure: snap.includeStateDestructure
})}
${lang[TEMPLATE.contextDefinition]({ 
  useEmptySymbol: snap.useEmptySymbol
})}
${lang[TEMPLATE.stateConfig]({
	nodes: codeStore.nodes,
  useDestructured: snap.includeStateDestructure,
  stateConfigVariable: snap.stateConfigVariable,
  contextTypeName: snap.contextTypeName,
  stateTypeName: snap.stateTypeName
})}
${lang[TEMPLATE.machineConfig]({
  configVariable: snap.configVariable,
  stateTypeName: snap.stateTypeName,
  enableHistory: snap.enableHistory,
  historySize: snap.historySize,
})}

${lang[TEMPLATE.defineMachine]({
  machineVariable: snap.machineVariable,
  initialStateVarable: snap.initialStateVariable,
  stateConfigVariable: snap.stateConfigVariable,
  contextVariable: snap.contextVariable,
  storeVariable: snap.storeVariable,
  machineConfigVariable: snap.machineConfigVariable,
  useMachineConfig: snap.useMachineOptions
})}
`)
  }, [language, snap])

  // Hide dropdown after 3 seconds initially
  useEffect(() => {
    hideTimeoutRef.current = window.setTimeout(() => {
      setShowDropdown(false);
    }, 3000);

    return () => {
      if (hideTimeoutRef.current !== null) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  // Handle mouse movement to detect top right corner
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Check if mouse is in the top right area (within 100px of the top right corner)
      if (e.clientY < 100 && e.clientX > window.innerWidth - 150) {
        setShowDropdown(true);
        
        // Reset the hide timeout when showing the dropdown
        if (hideTimeoutRef.current !== null) {
          clearTimeout(hideTimeoutRef.current);
        }
        
        // Set a new timeout to hide the dropdown after 3 seconds
        hideTimeoutRef.current = window.setTimeout(() => {
          // Only hide if the mouse isn't hovering over the dropdown
          if (dropdownRef.current && !dropdownRef.current.contains(document.activeElement)) {
            setShowDropdown(false);
          }
        }, 3000);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Keep dropdown visible while it has focus
  const handleDropdownFocus = () => {
    if (hideTimeoutRef.current !== null) {
      clearTimeout(hideTimeoutRef.current);
    }
    setShowDropdown(true);
  };

  const handleDropdownBlur = () => {
    hideTimeoutRef.current = window.setTimeout(() => {
      setShowDropdown(false);
    }, 3000);
  };

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    
    // Optional: Configure Monaco settings here
    monaco.editor.defineTheme('myCustomTheme', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#1e1e1e',
      }
    });
    monaco.editor.setTheme('myCustomTheme');
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setTemplate(value);
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Invisible area to detect mouse in top right */}
      <div 
        ref={topRightAreaRef}
        className="fixed top-0 right-0 w-[150px] h-[100px] z-0"
        style={{ pointerEvents: 'none' }}
      />
      
      {/* Simple red triangle in top right corner */}
      <div 
        className="fixed top-0 right-0 z-40 cursor-pointer"
        style={{
          width: '0',
          height: '0',
          borderStyle: 'solid',
          borderWidth: '0 30px 30px 0',
          borderColor: 'transparent var(--color-amber-600) transparent transparent',
          opacity: showDropdown ? '0' : '0.8',
          transition: 'opacity 300ms ease-in-out',
          filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.3))'
        }}
        onMouseEnter={() => setShowDropdown(true)}
      />
      
      {/* Language Selector Dropdown */}
      <div 
        ref={dropdownRef}
        className={`transition-opacity duration-300 fixed top-4 right-4 z-50 ${
          showDropdown ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onFocus={handleDropdownFocus}
        onBlur={handleDropdownBlur}
      >
        <select 
          className="border rounded bg-slate-600 p-1"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="typescript">TypeScript</option>
          <option value="javascript">JavaScript</option>
        </select>
      </div>


      
      {/* Monaco Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={language}
          value={template}
          theme="vs-dark"
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={{
            
            minimap: { enabled: true },
            fontSize: 14,
            wordWrap: 'on',
            automaticLayout: true,
            scrollBeyondLastLine: false,
            fixedOverflowWidgets: true
          }}
        />
      </div>
    </div>
  );
};

export default Code;

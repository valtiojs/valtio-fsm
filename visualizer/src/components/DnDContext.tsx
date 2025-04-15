import { createContext, useContext, useState, type Dispatch, type SetStateAction } from 'react'

// Define the context type with proper typing
type DnDContextType = [string, Dispatch<SetStateAction<string>>];

// Create context with proper initial value typing
const DnDContext = createContext<DnDContextType>(['', () => {}]);

interface DnDProviderProps extends React.PropsWithChildren {}

export const DnDProvider = ({ children }: DnDProviderProps) => {
  // Use the NodeType type here
  const [type, setType] = useState<string>('');
 
  return (
    <DnDContext.Provider value={[type, setType]}>
      {children}
    </DnDContext.Provider>
  );
}
 
export default DnDContext;
 
export const useDnD = () => {
  return useContext(DnDContext);
}
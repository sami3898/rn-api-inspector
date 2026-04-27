import { FloatingButton } from './FloatingButton';
import { InspectorPanel } from './InspectorPanel';

export const InspectorProvider = ({ children }: any) => {
  return (
    <>
      {children}
      <FloatingButton />
      <InspectorPanel />
    </>
  );
};

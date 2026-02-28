import { ReactFlowProvider } from 'reactflow';
import CanvasBoard from './components/CanvasBoard';
import SidePanel from './components/SidePanel';
import TopBar from './components/TopBar';
import ExportPage from './components/ExportPage';

function App() {
  return (
    <ReactFlowProvider>
      <div className="flex h-screen w-screen flex-col overflow-hidden bg-gray-50">
        <TopBar />
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 relative">
            <CanvasBoard />
          </div>
          <SidePanel />
        </div>
        <ExportPage />
      </div>
    </ReactFlowProvider>
  );
}

export default App;

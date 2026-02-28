import { useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  ReactFlowProvider,
  Panel
} from 'reactflow';
import type { Node } from 'reactflow';
import 'reactflow/dist/style.css';
import { useStore } from '../store';
import CardNode from './CardNode';

const nodeTypes = {
  customCard: CardNode,
};

const CanvasContent = () => {
  const nodes = useStore((state) => state.nodes);
  const edges = useStore((state) => state.edges);
  const onNodesChange = useStore((state) => state.onNodesChange);
  const onEdgesChange = useStore((state) => state.onEdgesChange);
  const onConnect = useStore((state) => state.onConnect);
  const addNode = useStore((state) => state.addNode);
  const selectNode = useStore((state) => state.selectNode);
  const mergeNodes = useStore((state) => state.mergeNodes);

  const { project, getIntersectingNodes } = useReactFlow();

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');

      // check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      // 获取当前视口坐标（屏幕坐标）并转换为 React Flow 内部坐标
      // event.clientX/Y 是相对于视口的
      // 我们需要减去 Canvas 容器的偏移量
      // 但 project() 方法通常处理的是相对于视口的坐标转换
      // 简单起见，这里假设 Canvas 占满全屏或大部分
      
      const position = project({
        x: event.clientX - 250, // 减去左侧边栏宽度(假设有)
        y: event.clientY - 60, // 减去顶部栏高度
      });

      addNode(type as any, position);
    },
    [project, addNode]
  );
  
  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    selectNode(node.id);
  };

  const onPaneClick = () => {
    selectNode(null);
  };

  const onNodeDragStop = useCallback(
    (_: any, node: Node) => {
      const intersections = getIntersectingNodes(node);
      const target = intersections.find(
        (n) => n.id !== node.id && (n.data.type === 'plot' || n.data.type === 'chapter')
      );

      if (target && node.data.type === 'plot') {
        mergeNodes(node.id, target.id);
      }
    },
    [getIntersectingNodes, mergeNodes]
  );

  return (
    <div className="h-full w-full bg-[#f7f5f0]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onNodeDragStop={onNodeDragStop}
        fitView
      >
        <Background gap={20} size={1} />
        <Controls />
        <MiniMap zoomable pannable />
        
        {/* 操作提示 */}
        <Panel position="bottom-center" className="mb-4">
           <div className="flex items-center gap-4 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 shadow-sm text-xs text-gray-500 font-medium">
             <div className="flex items-center gap-1">
               <span className="w-2 h-2 rounded-full bg-blue-500"></span>
               <span>选中编辑</span>
             </div>
             <div className="flex items-center gap-1">
               <span className="w-2 h-2 rounded-full bg-green-500"></span>
               <span>拖拽叠放 (合并为章节)</span>
             </div>
             <div className="flex items-center gap-1">
               <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
               <span>导出/拆分章节</span>
             </div>
           </div>
        </Panel>
        
        {/* 时间参考线 - 视觉引导 */}
        <Panel position="top-center" className="pointer-events-none mt-10">
           <div className="flex items-center gap-4 opacity-30 text-gray-500">
             <span className="text-xl font-bold">← 过去</span>
             <div className="h-0.5 w-96 border-t-2 border-dashed border-gray-400"></div>
             <span className="text-xl font-bold">未来 →</span>
           </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default CanvasContent;

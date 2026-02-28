import { useState } from 'react';
import { useStore } from '../store';
import { Plus, LayoutTemplate, RotateCcw } from 'lucide-react';
import type { CardType } from '../types/card';

export default function TopBar() {
  const addNode = useStore((state) => state.addNode);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleAddCard = (type: CardType) => {
    // 简单随机位置，避免重叠
    const x = 100 + Math.random() * 200;
    const y = 100 + Math.random() * 200;
    addNode(type, { x, y });
    setIsMenuOpen(false);
  };

  return (
    <div className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm z-10 relative">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <LayoutTemplate className="text-purple-600" />
          WordForge Demo
        </h1>
        
        <div className="relative group">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} /> 新建卡片
          </button>

          {/* 简单的下拉菜单逻辑 */}
          {isMenuOpen && (
            <div className="absolute top-full left-0 mt-2 w-32 rounded-md border border-gray-200 bg-white py-1 shadow-lg z-50">
              <button 
                onClick={() => handleAddCard('role')} 
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
              >
                角色卡
              </button>
              <button 
                onClick={() => handleAddCard('event')} 
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
              >
                事件卡
              </button>
              <button 
                onClick={() => handleAddCard('setting')} 
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
              >
                设定卡
              </button>
              <button 
                onClick={() => handleAddCard('chapter')} 
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 border-t border-gray-100 font-bold text-indigo-600"
              >
                章节卡
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={() => window.location.reload()}
          className="flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          <RotateCcw size={14} /> 重置演示
        </button>
      </div>
    </div>
  );
}

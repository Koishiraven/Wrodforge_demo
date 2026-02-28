import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { NodeData, CardType } from '../types/card';
import { useStore } from '../store';
import { Plus, Check, FileText, Share2, Library, Ungroup } from 'lucide-react';

const CardNode = ({ id, data, selected }: NodeProps<NodeData>) => {
  const basketNodeIds = useStore((state) => state.basketNodeIds);
  const toggleBasket = useStore((state) => state.toggleBasket);
  const setExportNode = useStore((state) => state.setExportNode);
  const splitChapter = useStore((state) => state.splitChapter);
  
  const isInBasket = basketNodeIds.includes(id);

  const typeColors: Record<CardType, string> = {
    role: 'border-blue-500 bg-blue-50',
    event: 'border-yellow-500 bg-yellow-50',
    setting: 'border-purple-500 bg-purple-50',
    plot: 'border-green-500 bg-green-50',
    chapter: 'border-indigo-500 bg-white',
  };

  const typeLabels: Record<CardType, string> = {
    role: '角色',
    event: '事件',
    setting: '设定',
    plot: '情节',
    chapter: '章节',
  };

  const typeLabelColors: Record<CardType, string> = {
    role: 'bg-blue-500',
    event: 'bg-yellow-500',
    setting: 'bg-purple-500',
    plot: 'bg-green-500',
    chapter: 'bg-indigo-500',
  };

  const isChapter = data.type === 'chapter';

  return (
    <div
      className={`relative w-64 rounded-lg border-2 shadow-md transition-all ${
        selected ? 'ring-2 ring-blue-400 ring-offset-2' : ''
      } ${typeColors[data.type]} ${isChapter ? 'min-h-[120px]' : ''}`}
    >
      {/* 章节卡片的叠放装饰效果 */}
      {isChapter && (
        <>
          <div className="absolute -right-1 -top-1 -z-10 h-full w-full rounded-lg border-2 border-indigo-200 bg-white shadow-sm transition-all group-hover:-right-2 group-hover:-top-2"></div>
          <div className="absolute -right-2 -top-2 -z-20 h-full w-full rounded-lg border-2 border-indigo-100 bg-white shadow-sm transition-all group-hover:-right-4 group-hover:-top-4"></div>
        </>
      )}

      <div className="flex items-center justify-between border-b border-gray-200 px-3 py-2">
        <div className="flex items-center gap-2">
          <span className={`rounded px-1.5 py-0.5 text-xs font-bold text-white ${typeLabelColors[data.type]}`}>
            {isChapter ? <Library size={12} className="inline mr-1" /> : null}
            {typeLabels[data.type]}
          </span>
          <span className="font-bold text-gray-800 line-clamp-1">{data.title || '未命名'}</span>
        </div>
        
        <div className="flex items-center gap-1">
          {isChapter ? (
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  splitChapter(id);
                }}
                className="rounded-full p-1 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                title="拆分章节"
              >
                <Ungroup size={14} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setExportNode(id);
                }}
                className="rounded-full p-1 bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors"
                title="导出章节"
              >
                <Share2 size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleBasket(id);
              }}
              className={`rounded-full p-1 transition-colors ${
                isInBasket ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
              }`}
              title={isInBasket ? '从篮子移除' : '加入篮子'}
            >
              {isInBasket ? <Check size={14} /> : <Plus size={14} />}
            </button>
          )}
        </div>
      </div>
      <div className="p-3">
        <p className={`line-clamp-3 text-sm text-gray-600 ${isChapter ? 'font-medium italic' : ''}`}>
          {data.content || (isChapter ? '整理属于你的章节内容...' : '暂无内容...')}
        </p>
        
        {data.type === 'plot' && (
           <div className="mt-2 text-xs text-gray-400">
             (AI 生成)
           </div>
        )}

        {isChapter && data.plotIds && (
          <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">包含情节</span>
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-600">
              {data.plotIds.length} 张
            </span>
          </div>
        )}
      </div>
      
      {/* 隐藏的 Handle，用于保持 React Flow 结构但不可连线 */}
      <Handle type="target" position={Position.Top} className="!bg-transparent !border-none" />
      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-none" />
    </div>
  );
};

export default memo(CardNode);

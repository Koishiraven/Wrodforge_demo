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
    role: 'border-[#cbd5e1] bg-[#eef2f5]',
    event: 'border-[#e2dcb8] bg-[#f9f7e8]',
    setting: 'border-[#dcd6e5] bg-[#f2eff5]',
    plot: 'border-[#cce0cc] bg-[#eff5ef]',
    chapter: 'border-[#8c3b3b] bg-white',
  };

  const typeLabels: Record<CardType, string> = {
    role: '角色',
    event: '事件',
    setting: '设定',
    plot: '情节',
    chapter: '章节',
  };

  const typeLabelColors: Record<CardType, string> = {
    role: 'bg-[#7c92a9] text-white',
    event: 'bg-[#b8ae7e] text-white',
    setting: 'bg-[#9a8c9e] text-white',
    plot: 'bg-[#7a9e7e] text-white',
    chapter: 'bg-[#8c3b3b] text-white',
  };

  const isChapter = data.type === 'chapter';

  return (
    <div
      className={`relative w-64 rounded-sm border shadow-sm transition-all ${
        selected ? 'ring-2 ring-[#8c3b3b] ring-offset-1' : ''
      } ${typeColors[data.type]} ${isChapter ? 'min-h-[120px]' : ''}`}
      style={{ boxShadow: '2px 2px 4px rgba(0,0,0,0.05)' }}
    >
      {/* 章节卡片的叠放装饰效果 */}
      {isChapter && (
        <>
          <div className="absolute -right-1 -top-1 -z-10 h-full w-full rounded-sm border border-[#8c3b3b] bg-white opacity-60 transition-all group-hover:-right-2 group-hover:-top-2"></div>
          <div className="absolute -right-2 -top-2 -z-20 h-full w-full rounded-sm border border-[#8c3b3b] bg-white opacity-30 transition-all group-hover:-right-4 group-hover:-top-4"></div>
        </>
      )}

      <div className="flex items-center justify-between border-b border-black/5 px-3 py-2">
        <div className="flex items-center gap-2">
          <span className={`rounded px-1.5 py-0.5 text-xs font-serif ${typeLabelColors[data.type]}`}>
            {isChapter ? <Library size={12} className="inline mr-1" /> : null}
            {typeLabels[data.type]}
          </span>
          <span className="font-bold text-[#2c2c2c] line-clamp-1 font-serif">{data.title || '未命名'}</span>
        </div>
        
        <div className="flex items-center gap-1">
          {isChapter ? (
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  splitChapter(id);
                }}
                className="rounded-full p-1 bg-[#f5eff0] text-[#8c3b3b] hover:bg-[#eadddd] transition-colors"
                title="拆分章节"
              >
                <Ungroup size={14} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setExportNode(id);
                }}
                className="rounded-full p-1 bg-[#eef2f5] text-[#5d6b7c] hover:bg-[#dce3e9] transition-colors"
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
                isInBasket ? 'bg-[#eff5ef] text-[#4a5d4a]' : 'bg-[#f7f5f0] text-[#d1cec5] hover:bg-[#e0ded5]'
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
          <div className="mt-3 flex items-center justify-between border-t border-[#d1cec5] pt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#d1cec5]">包含情节</span>
            <span className="rounded-full bg-[#eef2f5] px-2 py-0.5 text-[10px] font-bold text-[#5d6b7c]">
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

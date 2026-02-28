import { useState, useMemo } from 'react';
import { useStore } from '../store';
import { X, Trash2, RefreshCw, Send, Check, Loader2, AlertCircle } from 'lucide-react';
import { useReactFlow } from 'reactflow';
import { generatePlot } from '../services/aiService';

export default function SidePanel() {
  const nodes = useStore((state) => state.nodes);
  const selectedNodeId = useStore((state) => state.selectedNodeId);
  const basketNodeIds = useStore((state) => state.basketNodeIds);
  const updateNodeData = useStore((state) => state.updateNodeData);
  const toggleBasket = useStore((state) => state.toggleBasket);
  const clearBasket = useStore((state) => state.clearBasket);
  const addNode = useStore((state) => state.addNode);
  
  const { getViewport } = useReactFlow();

  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generatedResult, setGeneratedResult] = useState<{
    title: string;
    content: string;
    timeHint?: string;
    placeHint?: string;
  } | null>(null);

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId),
    [nodes, selectedNodeId]
  );

  const basketCards = useMemo(
    () => nodes.filter((n) => basketNodeIds.includes(n.id)),
    [nodes, basketNodeIds]
  );

  // 真实 AI 生成
  const handleGenerate = async () => {
    if (basketCards.length === 0) return;
    setIsGenerating(true);
    setGeneratedResult(null);
    setErrorMessage(null);

    try {
      const result = await generatePlot(basketCards, prompt);
      setGeneratedResult(result);
    } catch (error: any) {
      console.error('Generation failed:', error);
      setErrorMessage(error.message || '生成失败，请检查网络或 API Key');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAdopt = () => {
    if (!generatedResult) return;
    
    // 计算屏幕中心位置 (简单估算)
    const { x, y, zoom } = getViewport();
    // 假设容器宽 800 高 600，中心点大概是... 
    // 更严谨的做法是获取容器尺寸，这里简化处理，直接放在视图中心附近
    const centerPos = {
        x: (-x + 400) / zoom, 
        y: (-y + 300) / zoom
    };

    addNode('plot', centerPos, {
      title: generatedResult.title,
      content: generatedResult.content,
      fields: {
        timeHint: generatedResult.timeHint || '',
        placeHint: generatedResult.placeHint || '',
      }
    });
    
    setGeneratedResult(null);
    setPrompt('');
    setErrorMessage(null);
  };

  return (
    <div className="flex h-full w-80 flex-col border-l border-[#d1cec5] bg-[#fffef9] shadow-xl">
      {/* 顶部 Tab / 标题 */}
      <div className="bg-[#f7f5f0] px-4 py-3 border-b border-[#d1cec5]">
        <h2 className="font-bold text-[#2c2c2c]">
          {selectedNode ? '编辑卡片' : '创作面板'}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {selectedNode ? (
          // --- 编辑模式 ---
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500">标题</label>
              <input
                type="text"
                value={selectedNode.data.title}
                onChange={(e) => updateNodeData(selectedNode.id, { title: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-500">内容摘要 / 正文</label>
              <textarea
                rows={6}
                value={selectedNode.data.content}
                onChange={(e) => updateNodeData(selectedNode.id, { content: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* 动态字段编辑 (简化版) */}
            <div className="space-y-2">
               <label className="block text-xs font-medium text-gray-500">属性 (JSON 预览)</label>
               <div className="rounded bg-gray-100 p-2 text-xs font-mono text-gray-600">
                 {JSON.stringify(selectedNode.data.fields, null, 2)}
               </div>
               <p className="text-xs text-gray-400">* 属性编辑功能 Demo 版暂未开放 UI，请直接修改上方的正文</p>
            </div>
            
            <div className="pt-4 border-t border-gray-100">
                <button 
                  onClick={() => toggleBasket(selectedNode.id)}
                  className={`w-full flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors ${
                    basketNodeIds.includes(selectedNode.id)
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  }`}
                >
                  {basketNodeIds.includes(selectedNode.id) ? (
                    <>
                      <X size={16} /> 移出篮子
                    </>
                  ) : (
                    <>
                      <Check size={16} /> 加入篮子
                    </>
                  )}
                </button>
            </div>
          </div>
        ) : (
          // --- 生成模式 ---
          <div className="space-y-6">
            {/* 篮子区域 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-gray-700">创意篮子 ({basketCards.length}/5)</h3>
                {basketCards.length > 0 && (
                  <button onClick={clearBasket} className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1">
                    <Trash2 size={12} /> 清空
                  </button>
                )}
              </div>
              
              {basketCards.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed border-gray-200 p-4 text-center text-xs text-gray-400">
                  点击卡片上的 + 号，将它们加入篮子进行组合
                </div>
              ) : (
                <div className="space-y-2">
                  {basketCards.map((card) => (
                    <div key={card.id} className="flex items-center justify-between rounded bg-gray-50 px-3 py-2 text-sm">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className={`h-2 w-2 rounded-full flex-shrink-0 ${
                            card.data.type === 'role' ? 'bg-blue-500' : 
                            card.data.type === 'event' ? 'bg-yellow-500' : 
                            card.data.type === 'setting' ? 'bg-purple-500' : 'bg-green-500'
                        }`} />
                        <span className="truncate font-medium text-gray-700">{card.data.title}</span>
                      </div>
                      <button onClick={() => toggleBasket(card.id)} className="text-gray-400 hover:text-red-500">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 微调输入 */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">微调指令 (可选)</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="例如：让相遇更尴尬一点..."
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                rows={3}
              />
            </div>

            {/* 生成按钮 */}
            <button
              onClick={handleGenerate}
              disabled={basketCards.length === 0 || isGenerating}
              className={`flex w-full items-center justify-center gap-2 rounded-lg py-2.5 font-bold text-white shadow-sm transition-all ${
                basketCards.length === 0 || isGenerating
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-[#2c2c2c] hover:bg-black hover:shadow-md'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  AI 正在构思...
                </>
              ) : (
                <>
                  <Send size={18} />
                  开始生成情节
                </>
              )}
            </button>

            {/* 错误提示 */}
            {errorMessage && (
              <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-xs text-red-600 border border-red-100 animate-in fade-in duration-300">
                <AlertCircle size={14} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
            
            {/* 生成结果预览 */}
            {generatedResult && (
                <div className="rounded-lg border border-[#cce0cc] bg-[#eff5ef] p-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-[#2c2c2c]">{generatedResult.title}</h4>
                        <span className="text-xs bg-white/50 px-1.5 py-0.5 rounded text-[#5d5d5d]">预览</span>
                    </div>
                    <p className="text-sm text-[#2c2c2c] mb-3 leading-relaxed font-serif">
                        {generatedResult.content}
                    </p>
                    <div className="flex gap-2">
                        <button 
                            onClick={handleAdopt}
                            className="flex-1 bg-[#2c2c2c] text-white text-xs py-1.5 rounded hover:bg-black font-medium"
                        >
                            采纳并放入画布
                        </button>
                        <button 
                            onClick={handleGenerate}
                            className="px-3 bg-white border border-[#d1cec5] text-[#5d5d5d] text-xs py-1.5 rounded hover:bg-[#f7f5f0]"
                        >
                            重试
                        </button>
                    </div>
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import { useMemo, useState, useEffect } from 'react';
import { useStore } from '../store';
import { X, FileText, Download, FileJson, FileCode, Save } from 'lucide-react';

export default function ExportPage() {
  const nodes = useStore((state) => state.nodes);
  const exportNodeId = useStore((state) => state.exportNodeId);
  const setExportNode = useStore((state) => state.setExportNode);
  const updateNodeData = useStore((state) => state.updateNodeData);

  const exportNode = useMemo(
    () => nodes.find((n) => n.id === exportNodeId),
    [nodes, exportNodeId]
  );

  const plots = useMemo(() => {
    if (!exportNode || exportNode.data.type !== 'chapter') return [];
    const plotIds = exportNode.data.plotIds || [];
    return nodes.filter((n) => plotIds.includes(n.id) && n.data.type === 'plot');
  }, [nodes, exportNode]);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (exportNode) {
      setTitle(exportNode.data.title);
      // 自动合并情节内容作为初始内容，移除标题，使其看起来像小说段落
      const combinedContent = exportNode.data.content || plots.map(p => p.data.content).join('\n\n');
      setContent(combinedContent);
    }
  }, [exportNode, plots]);

  if (!exportNodeId || !exportNode) return null;

  const handleSave = () => {
    updateNodeData(exportNodeId, { title, content });
    setExportNode(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-white animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-gray-200 bg-gray-50 px-8">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-indigo-600 p-2 text-white shadow-md">
            <FileText size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">章节导出与编辑</h2>
            <p className="text-xs text-gray-500">正在整理：{exportNode.data.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setExportNode(null)}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Editor */}
        <div className="flex flex-1 flex-col p-8 overflow-y-auto">
          <div className="mx-auto w-full max-w-3xl space-y-6">
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="章节标题"
                className="w-full border-b-2 border-transparent py-2 text-3xl font-bold text-gray-900 focus:border-indigo-500 focus:outline-none transition-colors"
              />
            </div>
            <div className="relative min-h-[500px]">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="在此编辑章节内容..."
                className="h-full min-h-[500px] w-full resize-none bg-transparent py-4 text-lg leading-relaxed text-gray-700 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="w-80 border-l border-gray-200 bg-gray-50 p-6 space-y-8">
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-400">导出选项</h3>
            <div className="space-y-3">
              <button className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-indigo-300 hover:bg-indigo-50 active:scale-95">
                <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                  <FileCode size={20} />
                </div>
                <span>导出为 DOCX</span>
              </button>
              <button className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-indigo-300 hover:bg-indigo-50 active:scale-95">
                <div className="rounded-lg bg-gray-100 p-2 text-gray-600">
                  <FileText size={20} />
                </div>
                <span>导出为 TXT</span>
              </button>
              <button className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-indigo-300 hover:bg-indigo-50 active:scale-95">
                <div className="rounded-lg bg-red-100 p-2 text-red-600">
                  <Download size={20} />
                </div>
                <span>导出为 PDF</span>
              </button>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-400">操作</h3>
            <button 
              onClick={handleSave}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 font-bold text-white shadow-lg transition-all hover:bg-indigo-700 active:scale-95"
            >
              <Save size={20} /> 保存并返回
            </button>
          </div>

          <div className="rounded-xl bg-indigo-50 p-4 border border-indigo-100">
            <h4 className="text-xs font-bold text-indigo-700 mb-2">章节统计</h4>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-indigo-600">
                <span>包含情节数</span>
                <span className="font-bold">{plots.length}</span>
              </div>
              <div className="flex justify-between text-xs text-indigo-600">
                <span>总字数</span>
                <span className="font-bold">{content.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

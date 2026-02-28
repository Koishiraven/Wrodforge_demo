import { create } from 'zustand';
import { addEdge, applyNodeChanges, applyEdgeChanges } from 'reactflow';
import type { Node, Edge, Connection, OnNodesChange, OnEdgesChange } from 'reactflow';
import type { CardType, NodeData } from '../types/card';

interface AppState {
  nodes: Node<NodeData>[];
  allPlots: Node<NodeData>[]; // 存储所有情节卡，即使它们被放入了章节
  edges: Edge[];
  selectedNodeId: string | null;
  exportNodeId: string | null;
  basketNodeIds: string[];
  basketLimit: number;

  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  
  addNode: (type: CardType, position: { x: number, y: number }, data?: Partial<NodeData>) => void;
  updateNodeData: (id: string, data: Partial<NodeData>) => void;
  selectNode: (id: string | null) => void;
  setExportNode: (id: string | null) => void;
  
  toggleBasket: (id: string) => void;
  clearBasket: () => void;
  
  // 章节合并/拆分逻辑
  mergeNodes: (sourceId: string, targetId: string) => void;
  splitChapter: (chapterId: string) => void;
}

const initialNodes: Node<NodeData>[] = [
  {
    id: 'chapter-1',
    type: 'customCard',
    position: { x: 600, y: 300 },
    data: {
      id: 'chapter-1',
      type: 'chapter',
      title: '第一章：初露锋芒',
      content: '李风和小瑶的冒险开始了...',
      fields: {},
      plotIds: ['plot-initial-1', 'plot-initial-2']
    },
  },
  {
    id: 'role-1',
    type: 'customCard',
    position: { x: 100, y: 100 },
    data: {
      id: 'role-1',
      type: 'role',
      title: '李风',
      content: '15岁孤儿，倔强',
      fields: { age: '15', traits: '倔强, 勇敢', goal: '寻找身世', secret: '随身玉佩' }
    },
  },
  {
    id: 'role-2',
    type: 'customCard',
    position: { x: 350, y: 100 },
    data: {
      id: 'role-2',
      type: 'role',
      title: '小瑶',
      content: '灵动活泼的神秘少女',
      fields: { age: '14', traits: '活泼, 机智', goal: '逃离束缚', secret: '神秘笛子' }
    },
  },
  {
    id: 'scene-1',
    type: 'customCard',
    position: { x: 100, y: 300 },
    data: {
      id: 'scene-1',
      type: 'scene',
      title: '幽风谷',
      content: '常年被迷雾笼罩的幽深山谷',
      fields: { weather: '阴冷', atmosphere: '神秘', keyItems: '古老石刻' }
    },
  },
  {
    id: 'plot-3',
    type: 'customCard',
    position: { x: 100, y: 550 },
    data: {
      id: 'plot-3',
      type: 'plot',
      title: '突遇伏击',
      content: '李风和小瑶在谷口遭遇了一群不明身份的黑衣人。',
      fields: {},
    },
  },
  {
    id: 'plot-4',
    type: 'customCard',
    position: { x: 350, y: 550 },
    data: {
      id: 'plot-4',
      type: 'plot',
      title: '逃出生天',
      content: '在混乱中，两人跳下了悬崖，落入了湍急的河流。',
      fields: {},
    },
  },
  {
    id: 'plot-5',
    type: 'customCard',
    position: { x: 600, y: 550 },
    data: {
      id: 'plot-5',
      type: 'plot',
      title: '河边的苏醒',
      content: '李风在一片沙滩上醒来，发现小瑶就在不远处，但神志不清。',
      fields: {},
    },
  },
];

// 初始化一些情节数据，即使初始时它们可能在章节里
const initialPlots: Node<NodeData>[] = [
  {
    id: 'plot-initial-1',
    type: 'customCard',
    position: { x: 100, y: 400 },
    data: {
      id: 'plot-initial-1',
      type: 'plot',
      title: '意外的发现',
      content: '李风在后山发现了一个发光的洞穴。',
      fields: {},
    },
  },
  {
    id: 'plot-initial-2',
    type: 'customCard',
    position: { x: 300, y: 400 },
    data: {
      id: 'plot-initial-2',
      type: 'plot',
      title: '小瑶的加入',
      content: '小瑶偷偷跟着李风来到了洞穴。',
      fields: {},
    },
  },
  {
    id: 'plot-3',
    type: 'customCard',
    position: { x: 100, y: 550 },
    data: {
      id: 'plot-3',
      type: 'plot',
      title: '突遇伏击',
      content: '李风和小瑶在谷口遭遇了一群不明身份的黑衣人。',
      fields: {},
    },
  },
  {
    id: 'plot-4',
    type: 'customCard',
    position: { x: 350, y: 550 },
    data: {
      id: 'plot-4',
      type: 'plot',
      title: '逃出生天',
      content: '在混乱中，两人跳下了悬崖，落入了湍急的河流。',
      fields: {},
    },
  },
  {
    id: 'plot-5',
    type: 'customCard',
    position: { x: 600, y: 550 },
    data: {
      id: 'plot-5',
      type: 'plot',
      title: '河边的苏醒',
      content: '李风在一片沙滩上醒来，发现小瑶就在不远处，但神志不清。',
      fields: {},
    },
  },
];

export const useStore = create<AppState>((set, get) => ({
  nodes: initialNodes,
  allPlots: initialPlots,
  edges: [],
  selectedNodeId: null,
  exportNodeId: null,
  basketNodeIds: [],
  basketLimit: 5,

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },

  addNode: (type, position, data) => {
    const id = Date.now().toString();
    const newNode: Node<NodeData> = {
      id,
      type: 'customCard',
      position,
      data: {
        id,
        type,
        title: type === 'plot' ? '新情节' : type === 'chapter' ? '新章节' : '新卡片',
        content: '',
        fields: {},
        plotIds: type === 'chapter' ? [] : undefined,
        ...data,
      },
    };
    
    if (type === 'plot') {
      set({ allPlots: [...get().allPlots, newNode] });
    }
    
    set({ nodes: [...get().nodes, newNode], selectedNodeId: id });
  },

  updateNodeData: (id, data) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, ...data } };
        }
        return node;
      }),
      allPlots: get().allPlots.map((plot) => {
        if (plot.id === id) {
          return { ...plot, data: { ...plot.data, ...data } };
        }
        return plot;
      }),
    });
  },

  selectNode: (id) => {
    set({ selectedNodeId: id });
  },

  setExportNode: (id) => {
    set({ exportNodeId: id });
  },

  toggleBasket: (id) => {
    const { basketNodeIds, basketLimit } = get();
    if (basketNodeIds.includes(id)) {
      set({ basketNodeIds: basketNodeIds.filter((bid) => bid !== id) });
    } else {
      if (basketNodeIds.length < basketLimit) {
        set({ basketNodeIds: [...basketNodeIds, id] });
      } else {
        alert(`篮子最多只能放 ${basketLimit} 张卡片`);
      }
    }
  },

  clearBasket: () => {
    set({ basketNodeIds: [] });
  },

  mergeNodes: (sourceId, targetId) => {
    const { nodes, allPlots } = get();
    const sourceNode = nodes.find(n => n.id === sourceId);
    const targetNode = nodes.find(n => n.id === targetId);

    if (!sourceNode || !targetNode) return;
    if (sourceNode.data.type !== 'plot') return;

    // 场景 1: 情节卡 + 情节卡 = 新章节
    if (targetNode.data.type === 'plot') {
      const chapterId = `chapter-${Date.now()}`;
      const newChapter: Node<NodeData> = {
        id: chapterId,
        type: 'customCard',
        position: targetNode.position,
        data: {
          id: chapterId,
          type: 'chapter',
          title: '新章节',
          content: `${sourceNode.data.title} & ${targetNode.data.title}`,
          fields: {},
          plotIds: [sourceId, targetId]
        }
      };
      
      set({
        nodes: nodes
          .filter(n => n.id !== sourceId && n.id !== targetId)
          .concat(newChapter),
        selectedNodeId: chapterId
      });
    } 
    // 场景 2: 情节卡 + 章节卡 = 加入章节
    else if (targetNode.data.type === 'chapter') {
      set({
        nodes: nodes
          .filter(n => n.id !== sourceId)
          .map(n => {
            if (n.id === targetId) {
              const plotIds = n.data.plotIds || [];
              return {
                ...n,
                data: {
                  ...n.data,
                  plotIds: [...plotIds, sourceId]
                }
              };
            }
            return n;
          }),
        selectedNodeId: targetId
      });
    }
  },

  splitChapter: (chapterId) => {
    const { nodes, allPlots } = get();
    const chapterNode = nodes.find(n => n.id === chapterId);
    if (!chapterNode || chapterNode.data.type !== 'chapter') return;

    const plotIds = chapterNode.data.plotIds || [];
    const plotsToRestore = allPlots.filter(p => plotIds.includes(p.id)).map((p, index) => ({
      ...p,
      position: {
        x: chapterNode.position.x + (index + 1) * 50,
        y: chapterNode.position.y + (index + 1) * 50
      }
    }));

    set({
      nodes: nodes
        .filter(n => n.id !== chapterId)
        .concat(plotsToRestore),
      selectedNodeId: null
    });
  }
}));

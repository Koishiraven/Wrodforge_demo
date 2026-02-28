export type CardType = 'role' | 'event' | 'setting' | 'plot' | 'chapter';

export interface CardData {
  id: string;
  type: CardType;
  title: string;
  content: string; // 摘要展示或生成内容
  fields: Record<string, string>; // 灵活字段存储
  sourceCardIds?: string[]; // 仅 plot 类型有，记录来源
  plotIds?: string[]; // 仅 chapter 类型有，记录包含的情节卡 ID
}

export interface NodeData extends CardData {
  onAddBasket?: (id: string) => void;
  isInBasket?: boolean;
}

import React from "react";

// 历史会话mock数据
const historyList = [
  {
    id: 1,
    title: "📖 生成报告",
    desc: "根据近期纳斯达克的变化，制作报告"
  },
  {
    id: 2,
    title: "💡 生成报告",
    desc: "线索转化和人力资源的人员分布，生成分析报告"
  },
  {
    id: 3,
    title: "🍃 生成报告",
    desc: "线索转化和人力资源的人员分布，生成分析报告"
  }
];

export const HistorySidebar: React.FC = () => {
  return (
    <aside className="h-full w-[300px] bg-gradient-to-b from-[#DFE5FD] via-[#E2E7F0] to-[#DFE4F2] shadow-[0_6px_32px_8px_rgba(9,30,64,0.04),0_6px_16px_-1px_rgba(9,30,64,0.06),0_0_4px_0_rgba(9,30,64,0.05)] rounded-r-[20px] flex flex-col z-50 border-r border-[#C0CEED]">
      {/* 顶部新建对话按钮区 */}
      <div className="flex items-center justify-between px-6 pt-8 pb-4">
        <span className="text-[18px] font-bold text-[#0A1833]">历史对话</span>
        <button className="flex items-center gap-2 bg-white/80 border border-[#C0CEED] rounded-[10px] px-4 py-2 text-[#0A1833] text-[15px] font-semibold shadow hover:bg-[#F7F8FF] transition">
          <span>新建对话</span>
        </button>
      </div>
      {/* 历史会话列表 */}
      <div className="flex-1 px-4 pb-6 overflow-y-auto">
        {historyList.map(item => (
          <div key={item.id} className="bg-white rounded-[8px] px-4 py-3 mb-4 shadow-sm cursor-pointer hover:bg-[#F7F8FF] transition">
            <div className="text-[15px] font-semibold text-[#0A1833] mb-1">{item.title}</div>
          </div>
        ))}
      </div>
    </aside>
  );
}; 
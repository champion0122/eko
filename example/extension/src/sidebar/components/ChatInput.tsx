import React from "react";

interface ChatInputProps {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  disabled?: boolean;
}

const quickActions = [
  {
    icon: "/assets/input_icon1.svg",
    label: "截图",
    prompt: "截图"
  },
  {
    icon: "/assets/input_icon2.svg",
    label: "连接",
    prompt: "连接"
  },
  {
    icon: "/assets/input_icon3.svg",
    label: "阅读",
    prompt: "阅读"
  }
];

const SUBJECTS = [
  {
    id: 1,
    title: "📖 预约会议室",
    desc: "根据近期纳斯达克的变化，制作报告"
  },
  {
    id: 2,
    title: "💡 生成报告",
    desc: "线索转化和人力资源的人员分布，生成分析报告"
  },
  {
    id: 3,
    title: "🍃 资产检索",
    desc: "线索转化和人力资源的人员分布，生成分析报告"
  }
]

export const ChatInput: React.FC<ChatInputProps> = ({ value, onChange, onSend, disabled }) => {
  // 处理快捷按钮点击
  const handleQuickAction = (prompt: string) => {
    // onChange(prompt);
  };

  return (
    <>
      <div className="flex gap-[8px] justify-start mx-[20px] w-[calc(100%-40px)]">
        {SUBJECTS.map(item => (
          <div key={item.id} className="cursor-pointer flex w-[100px] h-[32px] p-[6px] justify-center items-center bg-[#ABB5CE38] rounded-[6px]">
            <div className="text-[#0A1833] text-[13px] leading-[20px] font-[400]">{item.title}</div>
          </div>
        ))}
      </div>
    <div className="transition-all bg-white rounded-[12px] border-[1px] border-[#DCE4FA] focus:border-[#8C8CFF] shadow-[0_6px_20px_0_rgba(171,181,206,0.2)] p-[8px] my-[16px] mx-[20px] w-[calc(100%-40px)]">
      {/* 输入区 */}
      <textarea
          className="w-full resize-none text-base outline-none bg-transparent text-[#0A1833] placeholder:text-[#A0AEC0] min-h-[44px] max-h-[120px] font-['PingFang SC','Inter','sans-serif'] whitespace-break-spaces break-words"
          rows={1}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="能帮你做什么"
          disabled={disabled}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
        />
      {/* 快捷操作按钮区（输入框下方） */}
      <div className="flex justify-between w-full pt-3">
        <div className="flex gap-[2px]">
          {quickActions.map((item, idx) => (
            <button
              key={item.label}
              className="flex flex-col items-center justify-center bg-transparent rounded-[20px] w-[32px] h-[32px] transition focus:outline-none p-0 border-none"
              onClick={() => handleQuickAction(item.prompt)}
              disabled={disabled}
              type="button"
            >
              <img src={item.icon} alt={item.label} className="w-[32px] h-[32px] mb-0.5 opacity-85" />
            </button>
          ))}
        </div>
        <button
          className="flex items-center justify-center w-[32px] h-[32px] ml-[12px] bg-gradient-to-r from-[#4482F7] to-[#735EFF] rounded-[20px] shadow hover:from-[#5a8fff] hover:to-[#8a7bff] transition-all disabled:opacity-60 disabled:cursor-not-allowed border-none p-0"
          onClick={onSend}
          disabled={disabled || !value.trim()}
          aria-label="发送"
          type="button"
        >
          <img src="/assets/input_send.svg" alt="发送" className="w-[18px] h-[18px]" />
        </button>
      </div>
    </div>
    </>
  );
};
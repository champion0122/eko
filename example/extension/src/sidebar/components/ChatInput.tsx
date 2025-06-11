import { Button } from "antd";
import React from "react";

interface ChatInputProps {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ value, onChange, onSend, disabled }) => {
  return (
    <div className="flex items-end bg-white px-4 py-3 border-t border-[#ececec]">
      <textarea
        className="flex-1 resize-none rounded-2xl border border-[#ececec] px-4 py-2 text-base focus:outline-none focus:border-blue-400 transition-all"
        rows={1}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="发送消息"
        disabled={disabled}
        onKeyDown={e => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
          }
        }}
      />
      <Button
        className="flex items-center justify-center w-10 h-10 ml-2 text-white transition-all bg-blue-500 rounded-full hover:bg-blue-600"
        onClick={onSend}
        disabled={disabled || !value.trim()}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Button>
    </div>
  );
};
import React from "react";
import { Card } from "antd";

interface ExecutingCardProps {
  title: string;
  steps: string[];
  currentStep: number;
}

const ExecutingCard: React.FC<ExecutingCardProps> = ({ title, steps, currentStep }) => {
  return (
    <Card
      className="rounded-xl shadow-lg border-none bg-[#EBEFFA] px-6 py-4"
      bodyStyle={{ padding: 0 }}
    >
      <div className="flex items-center mb-3">
        <div className="w-8 h-8 rounded-full bg-[#626FF6] flex items-center justify-center mr-3">
          <span className="text-lg text-white">💡</span>
        </div>
        <span className="text-base font-semibold text-[#222] opacity-85">
          {title}
        </span>
      </div>
      <div className="pl-4">
        {steps.map((desc, idx) => (
          <div key={idx} className="flex items-start mb-2">
            <span
              className={`inline-block w-2 h-2 rounded-full mt-2 mr-2 ${
                idx === currentStep
                  ? 'bg-[#626FF6]'
                  : 'bg-[#626FF6] opacity-40'
              }`}
            />
            <span
              className={`text-[13px] leading-6 ${
                idx === currentStep
                  ? 'text-[#222] opacity-85'
                  : 'text-[#222] opacity-45'
              }`}
            >
              {desc}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ExecutingCard; 
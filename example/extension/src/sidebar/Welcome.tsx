import React from "react";
import "../styles/welcome.css";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 11) return "早上好";
  if (hour < 13) return "中午好";
  if (hour < 18) return "下午好";
  return "晚上好";
}

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

export const Welcome: React.FC<{ onSend: (prompt: string) => void }> = ({ onSend }) => {
  const greeting = getGreeting();

  return (
    <div className="flex flex-col items-center flex-1 w-full h-full">
      {/* 顶部大标题 */}
      <div className="leading-[60px] text-center text-[32px] font-bold tracking-wider mt-[145px]">
        <div className="font-bold text-left text-[32px] leading-[60px]">{greeting}</div>
        <span className="text-[#0A1833]">我是你的</span>
        <span
          className="bg-gradient-to-r from-[#4CA6FF] to-[#6D6AFF] bg-clip-text text-transparent mx-1"
          style={{ fontFamily: 'inherit' }}
        >
          FINE
        </span>
        <span
          className="bg-gradient-to-r from-[#6D6AFF] to-[#A259D9] bg-clip-text text-transparent"
          style={{ fontFamily: 'inherit' }}
        >
          同事
        </span>
      </div>
      {/* banner图片 */}
      {/* <div className="container w-[395px] h-[56px]">
        <div className="overlay"></div>
      </div> */}
      <img
        src="/assets/banner.png"
        alt="banner"
        className="w-[395px] h-[56px] object-cover mt-[32px] bg-blend-multiply bg-transparent"
      />
      {/* 能帮你做什么 */}
      <div className="m-[20px] mt-[60px] w-[calc(100%-40px)] rounded-[20px] bg-gradient-to-b flex flex-col items-start from-[#E7E4FF] to-[#E8EDFF]">
        {/* 三个功能按钮区 */}
        <div className="w-full flex flex-col gap-[12px] py-[20px] px-[18px]">
          <div
          className="bg-[#FFFFFF] leading-[24px] rounded-[6px] px-4 py-2 text-[#0A1833] text-[12px] font-normal gap-2 hover:bg-[rgba(171,181,206,0.32)] transition"
          onClick={() => { }}
          >
            <span className="text-[#081633] text-[16px] font-bold">📖 生成报告</span>
            <br/>
            <span className="text-[#08163373]">
              根据近期纳斯达克的变化，制作报告
            </span>
          </div>
          <div
            className=" bg-[#FFFFFF] rounded-[6px] px-4 py-2 text-[#0A1833] text-[12px] font-normal gap-2 hover:bg-[rgba(171,181,206,0.32)] transition"
            onClick={() => { }}
          >
            <span className="text-[#081633] text-[16px] font-bold">💡 生成报告</span>
            <br/>
            <span className="text-[#08163373]">
              线索转化和人力资源的人员分布，生成分析报告
            </span>
          </div>
          <div
            className=" bg-[#FFFFFF] rounded-[6px] px-4 py-2 text-[#0A1833] text-[12px] font-normal gap-2 hover:bg-[rgba(171,181,206,0.32)] transition"
            onClick={() => { }}
          >
            <span className="text-[#081633] text-[16px] font-bold">🍃 生成报告</span>
            <br/>
            <span className="text-[#08163373]">
              线索转化和人力资源的人员分布，生成分析报告
            </span>
          </div>
        </div>
      </div>
      <div className="flex-1"></div>
      <div className="flex gap-[8px] self-end justify-start mx-[20px] w-[calc(100%-40px)]">
        {SUBJECTS.map(item => (
          <div key={item.id} className="cursor-pointer flex w-[100px] h-[32px] p-[6px] justify-center items-center bg-[#ABB5CE38] rounded-[6px]">
            <div className="text-[#0A1833] text-[13px] leading-[20px] font-[400]">{item.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
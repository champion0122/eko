import { Dropdown, Button, MenuProps } from "antd";
import React from "react";
import { FC } from "react";

export const Welcome: FC<{onSend: (prompt: string) => void}> = ({onSend}) => {
    const items: MenuProps['items'] = [
        {
            key: '2',
            label: (
              <div>
                  会议地点选择无锡，选择完了就完成任务了
              </div>
            ),
            onClick: () => {
              onSend("会议地点选择无锡，选择完了就完成任务了");
            }
          },
        {
          key: '1',
          label: (
            <div className="whitespace-break-spaces">
                demo 01: 预约会议地点为无锡，日期为2025-06-10，会议时间为09:00:00，参会人数为0，所需设备为空的会议室一个
            </div>
          ),
          onClick: () => {
            onSend("预约会议地点为无锡，日期为2025-06-10，会议时间为09:00:00，参会人数为0，所需设备为空的会议室一个");
          }
        },
      ];
      
    return <div className="flex flex-col pt-[400px] h-full">
        <div className="flex justify-between mb-[24px] gap-[12px]">
            <img src="https://src.fanruan.com/website/finereport/logo-fanruan.png" alt="logo"/>
            <div className="text-[18px] font-bold"><span className="mb-[12px]">晚上好，</span><br/><span>我是你的Fine同事</span></div>
        </div>
        <Dropdown menu={{items}} placement="bottom">
            <Button className="rounded-[5px]">预约会议室</Button>
        </Dropdown>
    </div>;
}
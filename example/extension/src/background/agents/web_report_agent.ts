import { Agent, AgentContext } from "@eko-ai/eko";
import { Tool, ToolResult } from "@eko-ai/eko/types";

// 定义agent工具
let tools: Tool[] = [
  {
    name: "generate_visualization",
    description: `
# 🤖 Role
- **You are**: 一位具备网页文本解析、信息提取、数据建模与可视化能力的数据分析专家。
- **Skills**:
  - 🧠 非结构化文本分析与信息抽取
  - 🧹 文本结构化处理（将自然语言或网页文本转为表格/结构化数据）
  - 📊 数据统计与可视化（matplotlib、plotly 或 seaborn）
  - 🧾 自动生成交互式 HTML 数据报告
  - ✍️ 总结关键信息、提炼洞察

# 💬 Basic Output Requirements:
- 从变量stock_data或者输入的网页提取文本中自动识别有价值的数据（如：价格列表、评分、标题-数值对、表格内容、时间序列等）
- 对提取出的信息进行结构化（例如转化为 JSON 或 dataframe）
- 统计基本指标（如平均值、最大最小值、频率分布等）
- 自动选择合适的可视化形式进行展示
- 生成完整的 HTML 格式数据报告，报告包括：
  - 报告标题
  - 数据提取和结构化说明
  - 可视化图表（可以使用cdn的方式引入chartjs三方库，cdn地址为https://cdn.jsdelivr.net/npm/chart.js）
  - 分析总结（用简洁自然语言总结洞察）
- 所有输出内容为简体中文
- HTML 报告代码结构整洁，具备直接预览的能力（可粘贴至 .html 文件查看）

# 📝 Prompt 内容

请根据以下网页提取文本内容，自动完成数据抽取、分析与可视化，并最终生成一份结构清晰、可直接预览的 HTML 报告。
`,
    parameters: {
      type: "object",
      properties: {
        result: { type: "string", description: "生成的html代码" },
        // chartOptions: { 
        //   type: "object", 
        //   description: "图表选项",
        //   properties: {
        //     theme: { type: "string", enum: ["financial", "modern", "minimal"], description: "图表主题" },
        //     maxCharts: { type: "number", description: "最大图表数量" }
        //   }
        // }
      },
    },
    execute: async (
      args: Record<string, unknown>,
      agentContext: AgentContext
    ): Promise<ToolResult> => {
      const url = 'data:text/html;charset=utf-8,' + encodeURIComponent(args.result as string);
      // window.open(url, '_blank');

      // const analysisData = args.analysisData as any;
      // const chartOptions = args.chartOptions as any;

      // // 生成图表配置
      // const visualizations = generateChartConfigs(analysisData, chartOptions);

      return {
        content: [{ 
          type: "text", 
          text: url
        }],
      };
    },
  }
//   ,
//   {
//     name: "create_html_report",
//     description: `
// # 🤖 Role
// - **You are**: HTML报告生成专家，能够创建美观、响应式的数据分析报告
// - **Skills**: 
//   - 🎨 现代化HTML/CSS设计
//   - 📱 响应式布局设计
//   - 📊 图表集成和交互
//   - 🌈 多主题支持

// # 💬 HTML报告要求:
// - 生成完整的HTML文档
// - 集成Tailwind CSS和Chart.js
// - 响应式设计，适配各种屏幕
// - 包含数据概览、图表、洞察分析

// # 📊 报告结构:
// 1. **报告头部**: 标题、来源、生成时间
// 2. **数据概览**: 关键指标卡片展示
// 3. **可视化图表**: 交互式图表展示
// 4. **AI洞察**: 分析结果和建议
// 5. **原始数据**: 可选的数据表格

// # 📌 主题支持:
// - **financial**: 金融主题（绿红配色）
// - **modern**: 现代主题（蓝紫配色）
// - **minimal**: 简约主题（灰色调）
// - **dashboard**: 仪表板主题（多彩配色）

// # 📥 输入要求:
// 需要前面所有工具的输出结果：页面数据、分析结果、可视化配置
// `,
//     parameters: {
//       type: "object",
//       properties: {
//         webData: { type: "object", description: "网页数据" },
//         analysisData: { type: "object", description: "分析结果" },
//         visualizations: { type: "array", description: "可视化配置" },
//         reportOptions: { 
//           type: "object", 
//           description: "报告选项",
//           properties: {
//             template: { type: "string", enum: ["financial", "modern", "minimal", "dashboard"], description: "报告模板" },
//             language: { type: "string", enum: ["zh", "en"], description: "报告语言" },
//             includeCharts: { type: "boolean", description: "是否包含图表" },
//             includeRawData: { type: "boolean", description: "是否包含原始数据" }
//           }
//         }
//       },
//     },
//     execute: async (
//       args: Record<string, unknown>,
//       agentContext: AgentContext
//     ): Promise<ToolResult> => {
//       console.log('创建HTML报告参数:', args);

//       const webData = args.webData as any;
//       const analysisData = args.analysisData as any;
//       const visualizations = args.visualizations as any[];
//       const reportOptions = args.reportOptions as any;

//       // 生成HTML报告
//       const htmlReport = generateHTMLReport(webData, analysisData, visualizations, reportOptions);

//       return {
//         content: [{ 
//           type: "text", 
//           text: htmlReport
//         }],
//       };
//     },
//   }
];

// 辅助函数实现
function generateChartConfigs(analysisData: any, chartOptions: any): any[] {
  const charts: any[] = [];
  
  if (!analysisData?.keyMetrics) return charts;
  
  if (analysisData.pageType === 'financial') {
    const priceData = analysisData.keyMetrics.filter((m: any) => m.type === 'price');
    if (priceData.length > 0) {
      charts.push({
        type: 'line',
        title: '价格数据趋势',
        data: {
          labels: priceData.map((d: any, i: number) => `数据${i + 1}`),
          datasets: [{
            label: '价格',
            data: priceData.map((d: any) => d.value),
            borderColor: '#00C851',
            backgroundColor: 'rgba(0, 200, 81, 0.1)'
          }]
        }
      });
    }
  }
  
  return charts;
}

function generateHTMLReport(webData: any, analysisData: any, visualizations: any[], reportOptions: any): string {
  const { template = 'modern', language = 'zh', includeCharts = true } = reportOptions || {};
  const isZh = language === 'zh';
  
  return `
<!DOCTYPE html>
<html lang="${language}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${isZh ? '网页数据分析报告' : 'Web Data Analysis Report'} - ${webData?.title || ''}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    ${includeCharts ? '<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>' : ''}
    <style>
        .chart-container { position: relative; height: 400px; margin: 20px 0; }
        .metric-card { transition: transform 0.2s ease-in-out; }
        .metric-card:hover { transform: translateY(-2px); }
    </style>
</head>
<body class="bg-gray-50">
    <div class="container mx-auto px-4 py-8 max-w-7xl">
        <!-- 报告头部 -->
        <header class="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h1 class="text-4xl font-bold text-gray-800 mb-2">
                ${isZh ? '网页数据分析报告' : 'Web Data Analysis Report'}
            </h1>
            <p class="text-gray-600">${isZh ? '源页面' : 'Source Page'}: ${webData?.title || ''}</p>
            <p class="text-gray-600 text-sm">${isZh ? '页面URL' : 'Page URL'}: ${webData?.url || ''}</p>
            <p class="text-gray-600 text-sm">${isZh ? '生成时间' : 'Generated at'}: ${new Date().toLocaleString()}</p>
        </header>

        <!-- 关键指标概览 -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="metric-card bg-white rounded-lg shadow-lg p-6 text-center">
                <div class="text-3xl font-bold text-blue-600 mb-2">${webData?.content?.numbers?.length || 0}</div>
                <p class="text-gray-600">${isZh ? '数值数据' : 'Numbers'}</p>
            </div>
            <div class="metric-card bg-white rounded-lg shadow-lg p-6 text-center">
                <div class="text-3xl font-bold text-green-600 mb-2">${webData?.content?.tables?.length || 0}</div>
                <p class="text-gray-600">${isZh ? '数据表格' : 'Tables'}</p>
            </div>
            <div class="metric-card bg-white rounded-lg shadow-lg p-6 text-center">
                <div class="text-3xl font-bold text-purple-600 mb-2">${visualizations?.length || 0}</div>
                <p class="text-gray-600">${isZh ? '可视化图表' : 'Charts'}</p>
            </div>
            <div class="metric-card bg-white rounded-lg shadow-lg p-6 text-center">
                <div class="text-3xl font-bold text-orange-600 mb-2">${analysisData?.insights?.length || 0}</div>
                <p class="text-gray-600">${isZh ? 'AI洞察' : 'AI Insights'}</p>
            </div>
        </div>

        ${includeCharts && visualizations?.length > 0 ? `
        <!-- 可视化图表 -->
        <div class="mb-8">
            <h2 class="text-3xl font-bold text-gray-800 mb-6">${isZh ? '数据可视化' : 'Data Visualizations'}</h2>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                ${visualizations.map((viz: any, index: number) => `
                <div class="bg-white rounded-lg shadow-lg p-6">
                    <h3 class="text-xl font-semibold text-gray-800 mb-4">${viz.title}</h3>
                    <div class="chart-container">
                        <canvas id="chart${index}"></canvas>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
        ` : ''}

        <!-- AI分析洞察 -->
        <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 class="text-3xl font-bold text-gray-800 mb-6">${isZh ? 'AI分析洞察' : 'AI Analysis Insights'}</h2>
            <div class="space-y-4">
                ${(analysisData?.insights || []).map((insight: string, index: number) => `
                <div class="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div class="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        ${index + 1}
                    </div>
                    <p class="text-gray-700 flex-1">${insight}</p>
                </div>
                `).join('')}
            </div>
        </div>

        <!-- 页脚 -->
        <footer class="mt-8 text-center text-gray-500 text-sm">
            <p>${isZh ? '报告由 WebReportAgent 自动生成' : 'Report generated by WebReportAgent'}</p>
            <p>${isZh ? '生成时间' : 'Generated at'}: ${new Date().toLocaleString()}</p>
        </footer>
    </div>

    ${includeCharts ? `
    <script>
        ${(visualizations || []).map((viz: any, index: number) => `
        try {
            const ctx${index} = document.getElementById('chart${index}').getContext('2d');
            new Chart(ctx${index}, {
                type: '${viz.type}',
                data: ${JSON.stringify(viz.data)},
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } }
                }
            });
        } catch (error) {
            console.error('Chart ${index} rendering error:', error);
        }
        `).join('')}
    </script>
    ` : ''}
</body>
</html>`;
}

// 导出agent
export let webReportAgent: Agent;

webReportAgent = new Agent({
  name: "WEB_REPORT",
  description: `网页数据分析和HTML可视化报告生成Agent。
  
功能包括：
1. 智能提取网页数据（表格、数字、图表等）
2. AI分析数据并生成洞察
3. 创建可视化图表配置
4. 生成美观的HTML分析报告

特别适用于：
- 纳斯达克等金融页面的数据分析
- 电商网站的价格和评价分析  
- 新闻网站的热度和互动分析
- 任何包含结构化数据的网页

将提取出的数据存到一个变量名为stock_data的变量中，由generate_visualization工具使用


`,
  tools: tools,
}); 

// 使用方法：
// 1. 调用extract_page_data提取页面数据
// 2. 调用analyze_data进行AI分析
// 3. 调用generate_visualization创建图表
// 4. 调用create_html_report生成最终报告
// 成功生成html之后，请在一个新的页面打开

// 不要把html字符串直接返回，而是要在一个新的页面打开
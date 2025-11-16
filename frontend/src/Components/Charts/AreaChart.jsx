import ReactECharts from "echarts-for-react";

export default function AreaChart() {
  const option = {
    title: {
      text: "Score Over Time",
      left: "center",
    },

    tooltip: {
      trigger: "axis",
    },

    xAxis: {
      type: "category",
      data: ["1 min", "2 min", "3 min", "4 min", "5 min"], // TIME (right)
      boundaryGap: false,
    },

    yAxis: {
      type: "value",
      name: "Score", // SCORE (top/left)
    },

    series: [
      {
        name: "Score",
        type: "line",
        data: [10, 40, 80, 65, 120],
        smooth: true,
        areaStyle: {
          opacity: 0.4,
        },
        lineStyle: {
          width: 3,
        },
        symbol: "circle",
        symbolSize: 8,
      },
    ],
  };

  return (
    <ReactECharts option={option} style={{ height: 400, width: "100%" }} />
  );
}

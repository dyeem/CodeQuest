import React from "react";
import ReactECharts from "echarts-for-react";

export default function LineChart() {
  const option = {
    title: {
      text: "Section Stats Over Months",
      left: "center",
      textStyle: { fontSize: 18, fontWeight: 500 },
    },
    tooltip: {
      trigger: "axis",
    },
    legend: {
      top: 30,
      data: ["Section A", "Section B", "Section C"],
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        name: "Section A",
        type: "line",
        stack: "Total",
        data: [120, 132, 101, 134, 90, 230],
        smooth: true,
      },
      {
        name: "Section B",
        type: "line",
        stack: "Total",
        data: [220, 182, 191, 234, 290, 330],
        smooth: true,
      },
      {
        name: "Section C",
        type: "line",
        stack: "Total",
        data: [150, 232, 201, 154, 190, 330],
        smooth: true,
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: 400, width: "100%" }} />;
}

import React from "react";
import ReactECharts from "echarts-for-react";

export default function LineChart({ data = { xAxis: [], series: [] } }) {
  const option = {
    backgroundColor: 'transparent',
    color: ['#d4af37', '#a855f7', '#2dd4bf'],
    title: {
      text: "Progress Trends",
      left: "center",
      textStyle: { fontSize: 18, fontWeight: 500, color: '#e7e5e4', fontFamily: 'serif' },
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: '#1c1917',
      borderColor: '#44403c',
      textStyle: { color: '#e7e5e4' }
    },
    legend: {
      top: 30,
      textStyle: { color: '#a8a29e' }
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
      borderColor: '#44403c'
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: data.xAxis.length > 0 ? data.xAxis : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      axisLabel: { color: '#a8a29e' },
      axisLine: { lineStyle: { color: '#44403c' } }
    },
    yAxis: {
      type: "value",
      axisLabel: { color: '#a8a29e' },
      splitLine: { lineStyle: { color: '#292524' } }
    },
    series: data.series.length > 0 ? data.series : [
      {
        name: "Average Score",
        type: "line",
        data: [0, 0, 0, 0, 0, 0],
        smooth: true,
      }
    ],
  };

  return <ReactECharts option={option} style={{ height: 400, width: "100%" }} />;
}

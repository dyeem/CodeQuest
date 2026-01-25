import ReactECharts from "echarts-for-react";

export default function AreaChart({ data = { labels: [], values: [] } }) {
  const option = {
    backgroundColor: 'transparent',
    title: {
      text: "Activity Over Time",
      left: "center",
      textStyle: {
        color: '#e7e5e4',
        fontFamily: 'serif'
      }
    },

    tooltip: {
      trigger: "axis",
      backgroundColor: '#1c1917',
      borderColor: '#44403c',
      textStyle: {
        color: '#e7e5e4'
      }
    },

    xAxis: {
      type: "category",
      data: data.labels.length > 0 ? data.labels : ["Mon", "Tue", "Wed", "Thu", "Fri"], // Dynamic labels
      boundaryGap: false,
      axisLabel: { color: '#a8a29e' },
      axisLine: { lineStyle: { color: '#44403c' } }
    },

    yAxis: {
      type: "value",
      name: "Score/XP",
      nameTextStyle: { color: '#a8a29e' },
      axisLabel: { color: '#a8a29e' },
      splitLine: { lineStyle: { color: '#292524' } }
    },

    series: [
      {
        name: "Activity",
        type: "line",
        data: data.values.length > 0 ? data.values : [0, 0, 0, 0, 0], // Dynamic values
        smooth: true,
        areaStyle: {
          opacity: 0.2,
          color: '#d4af37'
        },
        lineStyle: {
          width: 3,
          color: '#d4af37'
        },
        itemStyle: {
          color: '#d4af37'
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

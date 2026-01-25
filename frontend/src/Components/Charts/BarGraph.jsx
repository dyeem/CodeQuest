import ReactECharts from "echarts-for-react";

export default function BarGraph({ data = { labels: [], values: [] } }) {
  const option = {
    backgroundColor: 'transparent',
    title: {
      text: "Student Progress",
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
      textStyle: { color: '#e7e5e4' }
    },

    xAxis: {
      type: "category",
      data: data.labels.length > 0 ? data.labels : ["No Data"], // Dynamic labels
      name: "Categories",
      nameLocation: "middle",
      nameGap: 30,
      nameTextStyle: { color: '#a8a29e' },
      axisLabel: { color: '#a8a29e', interval: 0, rotate: 30 },
      axisLine: { lineStyle: { color: '#44403c' } }
    },

    yAxis: {
      type: "value",
      name: "Completion",
      nameLocation: "middle",
      nameGap: 40,
      nameTextStyle: { color: '#a8a29e' },
      axisLabel: { color: '#a8a29e' },
      splitLine: { lineStyle: { color: '#292524' } }
    },

    series: [
      {
        name: "Progress",
        type: "bar",
        data: data.values.length > 0 ? data.values : [0], // Dynamic values
        itemStyle: {
          borderRadius: 4,
          opacity: 0.9,
          color: '#2dd4bf' // Teal/Magic color
        },
      },
    ],
  };

  return (
    <ReactECharts option={option} style={{ height: 400, width: "100%" }} />
  );
}

import ReactECharts from "echarts-for-react";

export default function PieChart({ data = [] }) {
  const option = {
    backgroundColor: 'transparent',
    color: ['#d4af37', '#57534e', '#2dd4bf', '#a855f7'],
    title: [
      {
        text: "Student Status",
        left: "left",
        top: 0,
        textStyle: {
          fontSize: 18,
          fontWeight: "bold",
          color: '#e7e5e4',
          fontFamily: 'serif'
        },
      },
      {
        text: "Distribution by activity",
        left: "left",
        top: 28,
        textStyle: {
          fontSize: 13,
          color: "#a8a29e",
        },
      },
    ],

    tooltip: {
      trigger: "item",
      formatter: "{b}: {c} ({d}%)",
      backgroundColor: '#1c1917',
      borderColor: '#44403c',
      textStyle: { color: '#e7e5e4' }
    },

    legend: {
      orient: "vertical",
      right: 0,
      bottom: 0,
      textStyle: { color: '#a8a29e' }
    },

    series: [
      {
        name: "Students",
        type: "pie",
        radius: "60%",
        data: data.length > 0 ? data : [
            { value: 0, name: "No Data" }
        ],
        label: { color: '#a8a29e' },
        emphasis: {
          itemStyle: {
            shadowBlur: 12,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
        itemStyle: {
           borderColor: '#1c1917',
           borderWidth: 2
        }
      },
    ],
  };

  return (
    <ReactECharts option={option} style={{ height: 400, width: "100%" }} />
  );
}

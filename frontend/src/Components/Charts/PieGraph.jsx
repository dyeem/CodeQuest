import ReactECharts from "echarts-for-react";

export default function PieChart() {
  const option = {
    title: [
      {
        text: "Student Progress Distribution",
        left: "left",
        top: 0,
        textStyle: {
          fontSize: 18,
          fontWeight: "bold",
        },
      },
      {
        text: "Overview of current student status",
        left: "left",
        top: 28,
        textStyle: {
          fontSize: 13,
          color: "#666",
        },
      },
    ],

    tooltip: {
      trigger: "item",
      formatter: "{b}: {c} ({d}%)",
    },

    legend: {
      orient: "vertical",
      right: 0,
      bottom: 0,
    },

    series: [
      {
        name: "Students",
        type: "pie",
        radius: "60%",
        data: [
          { value: 40, name: "Active" },
          { value: 25, name: "Inactive" },
          { value: 20, name: "New" },
          { value: 15, name: "Returning" },
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 12,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.3)",
          },
        },
      },
    ],
  };

  return (
    <ReactECharts option={option} style={{ height: 400, width: "100%" }} />
  );
}

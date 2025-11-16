import ReactECharts from "echarts-for-react";

export default function BarGraph() {
  const option = {
    title: {
      text: "Student Progress",
      left: "center",
    },

    tooltip: {
      trigger: "axis",
    },

    xAxis: {
      type: "category",
      data: ["Student A", "Student B", "Student C", "Student D"], // students
      name: "Students",
      nameLocation: "middle",
      nameGap: 30,
    },

    yAxis: {
      type: "value",
      name: "Progress",
      nameLocation: "middle",
      nameGap: 40,
    },

    series: [
      {
        name: "Progress",
        type: "bar",
        data: [70, 85, 60, 95], // sample progress values
        itemStyle: {
          borderRadius: 8,
          opacity: 0.9,
        },
      },
    ],
  };

  return (
    <ReactECharts option={option} style={{ height: 400, width: "100%" }} />
  );
}

import ReactECharts from "echarts-for-react";

export default function PieChart({ data = [] }) {
  const option = {
    backgroundColor: 'transparent',
    color: ['#d4af37', '#2dd4bf', '#a855f7', '#fbbf24', '#f43f5e'],
    tooltip: {
      trigger: "item",
      formatter: "{b}: <br/>{c} levels ({d}%)",
      backgroundColor: '#1c1917',
      borderColor: '#d4af37',
      borderWidth: 1,
      textStyle: { 
        color: '#e7e5e4',
        fontFamily: 'serif'
      }
    },

    legend: {
      orient: "horizontal",
      left: 'center',
      bottom: 0,
      textStyle: { color: '#a8a29e', fontSize: 10 },
      itemWidth: 10,
      itemHeight: 10
    },

    series: [
      {
        name: "Themes",
        type: "pie",
        radius: ['45%', '75%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#1c1917',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
            color: '#d4af37',
            formatter: '{b}'
          },
          itemStyle: {
            shadowBlur: 15,
            shadowOffsetX: 0,
            shadowColor: "rgba(212, 171, 55, 0.4)",
          },
        },
        labelLine: {
          show: false
        },
        data: data.length > 0 ? data : [
            { value: 0, name: "No Data" }
        ],
        roseType: 'radius'
      },
    ],
  };

  return (
    <ReactECharts option={option} style={{ height: 350, width: "100%" }} />
  );
}

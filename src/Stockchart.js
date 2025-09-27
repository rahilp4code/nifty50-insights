import { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";

export default function CandleChart({ query }) {
  const chartRef = useRef(null);
  const [ohlc, setOhlc] = useState([]);

  // Fetch OHLC from FastAPI
  useEffect(() => {
    if (!query) return;

    async function fetchData() {
      try {
        const res = await fetch(`http://127.0.0.1:8000/ticker/${query}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        // Convert to array format for ECharts: [date, open, close, low, high, volume]
        const rawData = json.ohlc.map(d => [d.date, d.open, d.close, d.low, d.high, d.volume]);
        setOhlc(rawData);
      } catch (err) {
        console.error(err);
      }
    }

    fetchData();
  }, [query]);

  // Render chart
  useEffect(() => {
    if (!chartRef.current || ohlc.length === 0) return;

    const myChart = echarts.init(chartRef.current);

    const upColor = '#00da3c';
    const downColor = '#ec0000';

    // Split data for ECharts
    const categoryData = ohlc.map(d => d[0]);
    const values = ohlc.map(d => [d[1], d[2], d[3], d[4]]); // [open, close, low, high]
    const volumes = ohlc.map((d, i) => [i, d[5], d[1] > d[2] ? 1 : -1]);

    // Moving average function
    const calculateMA = (dayCount) => {
      return values.map((v, i) => {
        if (i < dayCount) return '-';
        let sum = 0;
        for (let j = 0; j < dayCount; j++) {
          sum += values[i - j][1]; // close price
        }
        return +(sum / dayCount).toFixed(3);
      });
    };

    const option = {
      animation: false,
      legend: { bottom: 10, left: 'center', data: ['Candles', 'MA5', 'MA10', 'MA20', 'MA30'] },
      tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
      xAxis: [
        { type: 'category', data: categoryData, scale: true, boundaryGap: false },
        { type: 'category', gridIndex: 1, data: categoryData, scale: true, boundaryGap: false, axisLabel: { show: false } }
      ],
      yAxis: [
        { scale: true, splitArea: { show: true } },
        { scale: true, gridIndex: 1, splitNumber: 2, axisLabel: { show: false }, axisLine: { show: false }, axisTick: { show: false }, splitLine: { show: false } }
      ],
      grid: [
        { left: '10%', right: '8%', height: '50%' },
        { left: '10%', right: '8%', top: '63%', height: '16%' }
      ],
      dataZoom: [
        { type: 'inside', xAxisIndex: [0, 1], start: 80, end: 100 },
        { show: true, type: 'slider', xAxisIndex: [0, 1], top: '85%', start: 80, end: 100 }
      ],
      series: [
        { name: 'Candles', type: 'candlestick', data: values, itemStyle: { color: upColor, color0: downColor } },
        { name: 'MA5', type: 'line', data: calculateMA(5), smooth: true, lineStyle: { opacity: 0.5 } },
        { name: 'MA10', type: 'line', data: calculateMA(10), smooth: true, lineStyle: { opacity: 0.5 } },
        { name: 'MA20', type: 'line', data: calculateMA(20), smooth: true, lineStyle: { opacity: 0.5 } },
        { name: 'MA30', type: 'line', data: calculateMA(30), smooth: true, lineStyle: { opacity: 0.5 } },
        { name: 'Volume', type: 'bar', xAxisIndex: 1, yAxisIndex: 1, data: volumes }
      ]
    };

    myChart.setOption(option);
    window.addEventListener('resize', myChart.resize); // responsive
    return () => window.removeEventListener('resize', myChart.resize);
  }, [ohlc]);

  return <div ref={chartRef} style={{ width: '100%', height: '500px' }} />;
}

import { useEffect, useRef, useState } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

export default function AmCandleChart({ query }) {
  const chartRef = useRef(null);
  const [ohlc, setOhlc] = useState([]);

  // 🔹 Fetch OHLC from FastAPI
  useEffect(() => {
    if (!query) return;

    async function fetchData() {
      try {
        const res = await fetch(`http://127.0.0.1:8000/ticker/${query}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();

        // Format data for amCharts
        const chartData = json.ohlc.map((d) => ({
          date: new Date(d.date).getTime(),
          value: d.close,
          open: d.open,
          low: d.low,
          high: d.high,
        }));

        setOhlc(chartData);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    }

    fetchData();
  }, [query]);

  // 🔹 Initialize chart
  useEffect(() => {
    if (!chartRef.current || ohlc.length === 0) return;

    const root = am5.Root.new(chartRef.current);

    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        focusable: true,
        panX: true,
        panY: true,
        wheelX: "panX",
        wheelY: "zoomX",
      })
    );

    // X Axis (Date)
    const xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        baseInterval: { timeUnit: "day", count: 1 },
        renderer: am5xy.AxisRendererX.new(root, { minorGridEnabled: true }),
        tooltip: am5.Tooltip.new(root, {}),
      })
    );

    // Y Axis (Price)
    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, { pan: "zoom" }),
      })
    );

    // Candlestick Series
    const series = chart.series.push(
      am5xy.CandlestickSeries.new(root, {
        name: query,
        xAxis,
        yAxis,
        valueYField: "value",
        openValueYField: "open",
        lowValueYField: "low",
        highValueYField: "high",
        valueXField: "date",
        tooltip: am5.Tooltip.new(root, {
          pointerOrientation: "horizontal",
          labelText:
            "open: {openValueY}\nlow: {lowValueY}\nhigh: {highValueY}\nclose: {valueY}",
        }),
      })
    );

    // Add Cursor
    chart.set(
      "cursor",
      am5xy.XYCursor.new(root, {
        xAxis,
      })
    );

    // Add Scrollbar (mini line chart below)
    const scrollbar = am5xy.XYChartScrollbar.new(root, { orientation: "horizontal", height: 50 });
    chart.set("scrollbarX", scrollbar);

    const sbxAxis = scrollbar.chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        baseInterval: { timeUnit: "day", count: 1 },
        renderer: am5xy.AxisRendererX.new(root, {}),
      })
    );
    const sbyAxis = scrollbar.chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
      })
    );
    const sbseries = scrollbar.chart.series.push(
      am5xy.LineSeries.new(root, {
        xAxis: sbxAxis,
        yAxis: sbyAxis,
        valueYField: "value",
        valueXField: "date",
      })
    );

    // Set Data
    series.data.setAll(ohlc);
    sbseries.data.setAll(ohlc);

    series.appear(1000);
    chart.appear(1000, 100);

    // Cleanup
    return () => {
      root.dispose();
    };
  }, [ohlc, query]);

  return <div ref={chartRef} style={{ width: "195%", height: "500px" }} />;
}


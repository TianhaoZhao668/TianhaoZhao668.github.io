const methodSeries = [
  {
    name: "Ours",
    faces: [265, 2702, 5262, 9803, 14809],
    times: [5.47, 5.031, 5.298, 4.857, 9.873292],
    color: "#e31a1c",
    marker: "hexagon"
  },
  {
    name: "MeshAnythingV2",
    faces: [623, 1404, 1995, 3190, 4029],
    times: [36.85, 81.25, 109.4, 164.2, 251.8],
    color: "#6a3d9a",
    marker: "triangle"
  },
  {
    name: "MeshSilkSong",
    faces: [460, 661, 1211, 1612, 2001],
    times: [13.65, 22.87, 39.84, 50.31, 70.86],
    color: "#1b9e77",
    marker: "diamond"
  },
  {
    name: "BPT",
    faces: [638, 1807, 2896, 3558, 4283],
    times: [42.23, 117, 180.3, 219.2, 299.9],
    color: "#f28e2b",
    marker: "square"
  },
  {
    name: "DeepMesh",
    faces: [3526, 5355, 9242, 12084, 13737],
    times: [147.5, 241.2, 415.8, 484, 565.7],
    color: "#1f2a6d",
    marker: "star"
  }
];

const sizeLabels = ["S", "M", "L", "X", "XL", "XXL"];
const methodOrder = new Map(methodSeries.map((series, index) => [series.name, index]));
const allPoints = methodSeries.flatMap((series) =>
  series.faces.map((faces, index) => ({
    method: series.name,
    faces,
    time: series.times[index],
    color: series.color,
    marker: series.marker,
    size: sizeLabels[index] || String(index + 1)
  }))
);

function formatSeconds(value) {
  return Number(value).toFixed(2);
}

function formatInteger(value) {
  return Number(value).toLocaleString("en-US");
}

function createSvgElement(tag, attrs = {}) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
  return el;
}

function polygonPoints(cx, cy, count, radius, rotation = -Math.PI / 2) {
  return Array.from({ length: count }, (_, index) => {
    const angle = rotation + (index / count) * Math.PI * 2;
    return `${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`;
  }).join(" ");
}

function starPoints(cx, cy, radius) {
  return Array.from({ length: 10 }, (_, index) => {
    const angle = -Math.PI / 2 + (index / 10) * Math.PI * 2;
    const r = index % 2 === 0 ? radius : radius * 0.45;
    return `${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`;
  }).join(" ");
}

function createMarker(point, x, y, highlight) {
  const r = highlight ? 8 : 6.5;
  const attrs = {
    class: "inference-chart__marker",
    fill: point.color,
    stroke: "#ffffff",
    "stroke-width": highlight ? 1.8 : 1.3,
    tabindex: "0"
  };

  if (point.marker === "square") {
    return createSvgElement("rect", { ...attrs, x: x - r, y: y - r, width: r * 2, height: r * 2, rx: 2 });
  }
  if (point.marker === "triangle") {
    return createSvgElement("polygon", { ...attrs, points: polygonPoints(x, y + 1, 3, r + 1, Math.PI / 2) });
  }
  if (point.marker === "diamond") {
    return createSvgElement("polygon", { ...attrs, points: polygonPoints(x, y, 4, r + 1, 0) });
  }
  if (point.marker === "star") {
    return createSvgElement("polygon", { ...attrs, points: starPoints(x, y, r + 3) });
  }
  return createSvgElement("polygon", { ...attrs, points: polygonPoints(x, y, 6, r + 1) });
}

function visibleSeries(state) {
  return methodSeries.filter((series) => state.enabled[series.name]);
}

function visiblePoints(state) {
  return allPoints.filter((point) => state.enabled[point.method]);
}

function niceLinearTicks(maxValue) {
  if (maxValue <= 12) return { top: 12, ticks: [0, 2, 4, 6, 8, 10, 12] };
  const top = Math.ceil(maxValue / 100) * 100;
  const ticks = [];
  for (let value = 0; value <= top; value += 100) ticks.push(value);
  return { top, ticks };
}

function getScales(points, state, chart) {
  const maxX = Math.max(15000, ...points.map((point) => point.faces));
  const maxY = Math.max(...points.map((point) => point.time));
  const xScale = (value) => chart.left + (value / maxX) * (chart.right - chart.left);

  if (state.scale === "log") {
    const minY = 1;
    const top = Math.max(600, Math.ceil(maxY / 100) * 100);
    const logMin = Math.log10(minY);
    const logMax = Math.log10(top);
    const yScale = (value) => chart.bottom - ((Math.log10(Math.max(value, minY)) - logMin) / (logMax - logMin)) * (chart.bottom - chart.top);
    return { maxX, top, yTicks: [1, 3, 10, 30, 100, 300, 600].filter((value) => value <= top), xScale, yScale };
  }

  const { top, ticks } = niceLinearTicks(maxY * 1.08);
  const yScale = (value) => chart.bottom - (value / top) * (chart.bottom - chart.top);
  return { maxX, top, yTicks: ticks, xScale, yScale };
}

function tooltipHandlers(root, text) {
  const tip = root.querySelector(".inference-plot__tooltip");
  const move = (event) => {
    const box = root.querySelector(".inference-plot__chart").getBoundingClientRect();
    tip.style.left = `${event.clientX - box.left + 14}px`;
    tip.style.top = `${event.clientY - box.top + 14}px`;
  };
  return {
    mouseenter(event) {
      tip.textContent = text;
      tip.hidden = false;
      move(event);
    },
    mousemove: move,
    mouseleave() {
      tip.hidden = true;
    }
  };
}

function renderMetrics(root) {
  const ours = methodSeries.find((series) => series.name === "Ours");
  const baselinePoints = allPoints.filter((point) => point.method !== "Ours");
  const oursMaxFaces = Math.max(...ours.faces);
  const oursMin = Math.min(...ours.times);
  const baselineMin = Math.min(...baselinePoints.map((point) => point.time));
  const baselineMax = Math.max(...baselinePoints.map((point) => point.time));

  root.querySelector(".inference-plot__metrics").innerHTML = `
    <div><span>Ours</span><strong>${formatSeconds(oursMin)}s</strong></div>
    <div><span>Max faces</span><strong>${formatInteger(oursMaxFaces)}</strong></div>
    <div><span>Best baseline</span><strong>${formatSeconds(baselineMin)}s</strong></div>
    <div><span>Slowest</span><strong>${formatSeconds(baselineMax)}s</strong></div>
  `;
}

function renderChart(root, state) {
  const svg = root.querySelector("svg");
  svg.replaceChildren();

  const width = 940;
  const height = 530;
  const chart = { left: 82, right: width - 34, top: 32, bottom: height - 84 };
  const points = visiblePoints(state);
  const { maxX, yTicks, xScale, yScale } = getScales(points, state, chart);
  const xTicks = [0, 2500, 5000, 7500, 10000, 12500, 15000].filter((value) => value <= maxX);
  if (!xTicks.includes(maxX) && maxX > 15000) xTicks.push(maxX);

  const grid = createSvgElement("g", { class: "inference-chart__grid" });
  yTicks.forEach((tick) => {
    const y = yScale(tick);
    grid.appendChild(createSvgElement("line", { x1: chart.left, y1: y, x2: chart.right, y2: y }));
    const text = createSvgElement("text", { x: chart.left - 12, y: y + 4, "text-anchor": "end" });
    text.textContent = tick;
    grid.appendChild(text);
  });
  xTicks.forEach((tick) => {
    const x = xScale(tick);
    grid.appendChild(createSvgElement("line", { x1: x, y1: chart.top, x2: x, y2: chart.bottom }));
    const text = createSvgElement("text", { x, y: chart.bottom + 28, "text-anchor": "middle" });
    text.textContent = formatInteger(tick);
    grid.appendChild(text);
  });
  svg.appendChild(grid);

  svg.appendChild(createSvgElement("line", { class: "inference-chart__axis", x1: chart.left, y1: chart.bottom, x2: chart.right, y2: chart.bottom }));
  svg.appendChild(createSvgElement("line", { class: "inference-chart__axis", x1: chart.left, y1: chart.top, x2: chart.left, y2: chart.bottom }));

  const thresholdY = yScale(10);
  if (thresholdY >= chart.top && thresholdY <= chart.bottom) {
    svg.appendChild(createSvgElement("line", { class: "inference-chart__threshold", x1: chart.left, y1: thresholdY, x2: chart.right, y2: thresholdY }));
    const label = createSvgElement("text", { class: "inference-chart__threshold-label", x: chart.right - 6, y: thresholdY - 8, "text-anchor": "end" });
    label.textContent = "10s";
    svg.appendChild(label);
  }

  const yLabel = createSvgElement("text", { class: "inference-chart__label", x: 24, y: (chart.top + chart.bottom) / 2, transform: `rotate(-90 24 ${(chart.top + chart.bottom) / 2})`, "text-anchor": "middle" });
  yLabel.textContent = "Inference Time (s)";
  svg.appendChild(yLabel);

  const xLabel = createSvgElement("text", { class: "inference-chart__label", x: (chart.left + chart.right) / 2, y: chart.bottom + 58, "text-anchor": "middle" });
  xLabel.textContent = "Face Numbers";
  svg.appendChild(xLabel);

  visibleSeries(state).forEach((series) => {
    const seriesPoints = series.faces.map((faces, index) => ({
      method: series.name,
      faces,
      time: series.times[index],
      color: series.color,
      marker: series.marker,
      size: sizeLabels[index] || String(index + 1)
    })).sort((a, b) => a.faces - b.faces);

    const path = seriesPoints.map((point, index) => {
      const x = xScale(point.faces);
      const y = yScale(point.time);
      return `${index === 0 ? "M" : "L"}${x},${y}`;
    }).join(" ");

    svg.appendChild(createSvgElement("path", {
      class: series.name === "Ours" ? "inference-chart__line inference-chart__line--ours" : "inference-chart__line",
      d: path,
      stroke: series.color
    }));

    seriesPoints.forEach((point) => {
      const x = xScale(point.faces);
      const y = yScale(point.time);
      const marker = createMarker(point, x, y, point.method === "Ours");
      const handlers = tooltipHandlers(root, `${point.method} ${point.size}: ${formatInteger(point.faces)} faces, ${formatSeconds(point.time)}s`);
      marker.addEventListener("mouseenter", handlers.mouseenter);
      marker.addEventListener("mousemove", handlers.mousemove);
      marker.addEventListener("mouseleave", handlers.mouseleave);
      marker.addEventListener("focus", handlers.mouseenter);
      marker.addEventListener("blur", handlers.mouseleave);
      svg.appendChild(marker);
    });
  });
}

function markerIcon(series) {
  return `<i style="--series-color:${series.color}" aria-hidden="true"></i>`;
}

function renderLegend(root, state) {
  root.querySelector(".inference-plot__legend").innerHTML = methodSeries.map((series) => `
    <button type="button" data-method="${series.name}" class="${state.enabled[series.name] ? "is-active" : ""}">
      ${markerIcon(series)}${series.name}
    </button>
  `).join("");
}

function render(root, state) {
  root.querySelector("[data-control='scale']").value = state.scale;
  renderMetrics(root);
  renderChart(root, state);
  renderLegend(root, state);
}

function initInferenceTable() {
  const root = document.getElementById("inference-table");
  if (!root) return;

  root.innerHTML = `
    <div class="inference-plot__topbar">
      <div class="inference-plot__metrics"></div>
      <div class="inference-plot__controls">
        <label><span>Scale</span><select data-control="scale"><option value="linear">Linear</option><option value="log">Log</option></select></label>
      </div>
    </div>
    <div class="inference-plot__chart">
      <svg viewBox="0 0 940 530" role="img" aria-label="Interactive inference time comparison chart"></svg>
      <div class="inference-plot__tooltip" hidden></div>
    </div>
    <div class="inference-plot__legend" aria-label="Method toggles"></div>
  `;

  const state = {
    enabled: Object.fromEntries(methodSeries.map((series) => [series.name, true])),
    scale: "linear",
    sortKey: "method",
  };

  root.addEventListener("change", (event) => {
    const control = event.target.closest("[data-control='scale']");
    if (!control) return;
    state.scale = control.value;
    render(root, state);
  });

  root.addEventListener("click", (event) => {
    const methodButton = event.target.closest("[data-method]");
    if (methodButton) {
      const method = methodButton.dataset.method;
      const activeCount = Object.values(state.enabled).filter(Boolean).length;
      if (state.enabled[method] && activeCount === 1) return;
      state.enabled[method] = !state.enabled[method];
      render(root, state);
      return;
    }
  });

  render(root, state);
}

window.addEventListener("DOMContentLoaded", initInferenceTable, { once: true });






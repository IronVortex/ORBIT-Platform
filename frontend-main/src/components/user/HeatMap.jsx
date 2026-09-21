import React from "react";
import { useMemo, useState } from "react";

// Deterministic pseudo-random generator so the demo grid looks stable
// across re-renders instead of flickering with Math.random().
const seededRandom = (seed) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];
const WEEKS = 52;
const DAYS = 7;

// Swap this out for real contribution data later —
// shape: [{ date: "2026-01-01", count: 4 }, ...]
const generateDemoData = () => {
  const cells = [];
  const today = new Date();
  for (let w = 0; w < WEEKS; w++) {
    for (let d = 0; d < DAYS; d++) {
      const dayIndex = w * DAYS + d;
      const date = new Date(today);
      date.setDate(date.getDate() - (WEEKS * DAYS - dayIndex));
      const rand = seededRandom(dayIndex * 17.31);
      let level = 0;
      if (rand > 0.85) level = 4;
      else if (rand > 0.7) level = 3;
      else if (rand > 0.5) level = 2;
      else if (rand > 0.3) level = 1;
      cells.push({ date, level, count: level === 0 ? 0 : Math.round(level * (1 + rand * 2)) });
    }
  }
  return cells;
};

const HeatMapProfile = ({ data }) => {
  const [hovered, setHovered] = useState(null);
  const cells = useMemo(() => data && data.length ? data : generateDemoData(), [data]);

  const totalContributions = useMemo(
    () => cells.reduce((sum, c) => sum + (c.count || 0), 0),
    [cells]
  );

  const weeks = useMemo(() => {
    const result = [];
    for (let w = 0; w < WEEKS; w++) {
      result.push(cells.slice(w * DAYS, w * DAYS + DAYS));
    }
    return result;
  }, [cells]);

  const monthMarkers = useMemo(() => {
    const markers = [];
    let lastMonth = -1;
    weeks.forEach((week, i) => {
      const first = week[0];
      if (!first) return;
      const month = first.date.getMonth();
      if (month !== lastMonth) {
        markers.push({ index: i, label: MONTH_LABELS[month] });
        lastMonth = month;
      }
    });
    return markers;
  }, [weeks]);

  const isEmpty = totalContributions === 0;

  return (
    <div className="orbit-heatmap">
      <div className="orbit-heatmap-header">
        <span className="orbit-heatmap-count">
          {isEmpty ? "No contributions yet" : `${totalContributions} contributions in the last year`}
        </span>
        <div className="orbit-heatmap-legend">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((lvl) => (
            <span key={lvl} className="orbit-heat-cell" data-level={lvl} />
          ))}
          <span>More</span>
        </div>
      </div>

      <div className="orbit-heatmap-scroll">
        <div className="orbit-heatmap-body">
          <div className="orbit-heatmap-months">
            {monthMarkers.map((m) => (
              <span
                key={`${m.label}-${m.index}`}
                className="orbit-heatmap-month-label"
                style={{ gridColumnStart: m.index + 1 }}
              >
                {m.label}
              </span>
            ))}
          </div>

          <div className="orbit-heatmap-main-row">
            <div className="orbit-heatmap-day-labels">
              {DAY_LABELS.map((label, i) => (
                <span key={i}>{label}</span>
              ))}
            </div>

            <div className="orbit-heatmap-grid">
              {weeks.map((week, wIndex) => (
                <div className="orbit-heatmap-col" key={wIndex}>
                  {week.map((cell, dIndex) => (
                    <div
                      key={dIndex}
                      className="orbit-heat-cell"
                      data-level={cell.level}
                      onMouseEnter={() => setHovered(cell)}
                      onMouseLeave={() => setHovered(null)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="orbit-heatmap-tooltip-slot">
        {hovered ? (
          <span>
            <strong>{hovered.count}</strong> contribution{hovered.count === 1 ? "" : "s"} on{" "}
            {hovered.date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
          </span>
        ) : (
          <span className="orbit-text-muted">Hover a square to see activity for that day.</span>
        )}
      </div>
    </div>
  );
};

export default HeatMapProfile;
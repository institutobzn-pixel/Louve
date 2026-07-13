"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { EmptyState } from "@/components/shared/empty-state";
import { BarChart3 } from "lucide-react";

export interface MostPlayedDatum {
  name: string;
  count: number;
  level: "VERDE" | "AMARELO" | "VERMELHO";
}

/**
 * Músicas mais cantadas — barras horizontais (magnitude, série única).
 * Cor: violeta primária do Design System; recede em tom quando a música
 * está saturada (o semáforo é o canal de estado, com rótulo próprio).
 */
export function MostPlayedChart({ data }: { data: MostPlayedDatum[] }) {
  const [colors, setColors] = React.useState({
    bar: "#853aee",
    grid: "#2c2c2a",
    text: "#898781",
  });

  React.useEffect(() => {
    const styles = getComputedStyle(document.documentElement);
    const read = (name: string) => `hsl(${styles.getPropertyValue(name).trim()})`;
    setColors({
      bar: read("--primary"),
      grid: read("--border"),
      text: read("--muted-foreground"),
    });
  }, []);

  if (data.length === 0) {
    return (
      <EmptyState
        icon={BarChart3}
        title="Sem execuções na janela"
        description="Conclua cultos com setlist para alimentar os relatórios."
      />
    );
  }

  const height = Math.max(160, data.length * 40);

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 32, bottom: 4, left: 8 }}
          barCategoryGap={8}
        >
          <XAxis
            type="number"
            allowDecimals={false}
            tick={{ fill: colors.text, fontSize: 12 }}
            axisLine={{ stroke: colors.grid }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={150}
            tick={{ fill: colors.text, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: colors.grid, opacity: 0.25 }}
            contentStyle={{
              background: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 12,
              color: "hsl(var(--popover-foreground))",
              fontSize: 12,
            }}
            formatter={(value) => [`${value} execuções`, "Total"]}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} label={{ position: "right", fill: colors.text, fontSize: 12 }}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={colors.bar}
                fillOpacity={entry.level === "VERMELHO" ? 1 : 0.75}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

"use client";

import type { FiringScheduleStep } from "@/types";
import { cn } from "@/lib/utils";

function celsiusToFahrenheit(c: number): number {
  return Math.round(c * 9 / 5 + 32);
}

interface FiringScheduleTableProps {
  schedule: FiringScheduleStep[];
  className?: string;
}

export function FiringScheduleTable({ schedule, className }: FiringScheduleTableProps) {
  if (schedule.length === 0) {
    return (
      <p className="text-xs text-earth-400 italic py-2">
        No firing schedule available for this clay body.
      </p>
    );
  }

  return (
    <div className={cn("overflow-x-auto rounded-lg border border-earth-200", className)}>
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-earth-100 text-earth-600 text-left">
            <th className="px-3 py-2 font-semibold w-8 text-center">#</th>
            <th className="px-3 py-2 font-semibold">Phase</th>
            <th className="px-3 py-2 font-semibold text-right whitespace-nowrap">
              Target °C
            </th>
            <th className="px-3 py-2 font-semibold text-right whitespace-nowrap">
              Target °F
            </th>
            <th className="px-3 py-2 font-semibold text-right whitespace-nowrap">
              Rate °C/h
            </th>
            <th className="px-3 py-2 font-semibold text-right whitespace-nowrap">
              Hold (min)
            </th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((step, i) => {
            const isOdd = i % 2 === 1;
            const isHold = step.holdTime > 0;
            return (
              <tr
                key={i}
                className={cn(
                  "border-t border-earth-100 transition-colors",
                  isOdd ? "bg-clay-50" : "bg-white",
                  isHold && "font-medium"
                )}
              >
                <td className="px-3 py-2 text-earth-400 text-center">{i + 1}</td>
                <td className="px-3 py-2 text-earth-800">
                  <span className="flex items-center gap-1.5">
                    {isHold && (
                      <span
                        className="inline-block w-1.5 h-1.5 rounded-full bg-kiln-500 flex-shrink-0"
                        title="Hold phase"
                      />
                    )}
                    {step.phase}
                  </span>
                </td>
                <td className="px-3 py-2 text-right text-earth-800 font-mono">
                  {step.targetTemp > 0 ? `${step.targetTemp}°` : "—"}
                </td>
                <td className="px-3 py-2 text-right text-earth-500 font-mono">
                  {step.targetTemp > 0 ? `${celsiusToFahrenheit(step.targetTemp)}°` : "—"}
                </td>
                <td className="px-3 py-2 text-right text-earth-800 font-mono">
                  {step.rate > 0 ? `${step.rate}` : "—"}
                </td>
                <td className="px-3 py-2 text-right">
                  {isHold ? (
                    <span className="inline-block px-1.5 py-0.5 bg-kiln-100 text-kiln-700 rounded text-[10px] font-semibold">
                      {step.holdTime} min
                    </span>
                  ) : (
                    <span className="text-earth-400">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="bg-earth-50 border-t-2 border-earth-200">
            <td colSpan={5} className="px-3 py-1.5 text-[10px] text-earth-400">
              Orange dot = hold phase. Rates are in °C per hour.
            </td>
            <td className="px-3 py-1.5 text-right text-[10px] text-earth-400 font-mono">
              {schedule.reduce((sum, s) => sum + s.holdTime, 0)} min total holds
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

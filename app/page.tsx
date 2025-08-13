"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { useHabitStore, getLastNDates, toDateKey } from "@/lib/store";

export default function Home() {
  const { habits, addHabit, deleteHabit, renameHabit, toggleHabitForDate } = useHabitStore();
  const [newHabit, setNewHabit] = useState("");
  const [days, setDays] = useState(7);
  const [toast, setToast] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const daysRange = useMemo(() => getLastNDates(days), [days]);
  const todayKey = useMemo(() => toDateKey(new Date()), []);
  const displayHabits = useMemo(
    () =>
      habits.filter((h) =>
        h.name.toLowerCase().includes(query.trim().toLowerCase())
      ),
    [habits, query]
  );

  function handleAddHabit() {
    const name = newHabit.trim();
    if (!name) return;
    addHabit(name);
    setNewHabit("");
  }

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <div className="min-h-dvh bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.04),transparent_40%),radial-gradient(circle_at_80%_0,rgba(255,255,255,0.04),transparent_35%)] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-8xl">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Habit Tracker</h1>
            <p className="text-sm text-gray-400">Local, private, fast.</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-gray-700 bg-gray-900/60 p-1 backdrop-blur supports-[backdrop-filter]:bg-gray-900/40">
            {[7, 14, 21, 28].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`rounded-full px-3 py-1 text-sm transition ${
                  days === d ? "bg-white text-black" : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </header>

        <div className="mb-6 flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search habits"
            className="w-48 rounded-lg border border-gray-700 bg-gray-900/60 px-3 py-2 text-gray-100 placeholder-gray-400 outline-none backdrop-blur supports-[backdrop-filter]:bg-gray-900/40"
          />
          <input
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddHabit();
            }}
            placeholder="Add a habit (e.g. Read 10 pages)"
            className="flex-1 rounded-lg border border-gray-700 bg-gray-900/60 px-3 py-2 text-gray-100 placeholder-gray-400 outline-none backdrop-blur supports-[backdrop-filter]:bg-gray-900/40"
          />
          <button
            onClick={handleAddHabit}
            className="rounded-lg bg-white px-4 py-2 text-black shadow-sm hover:bg-gray-200 disabled:opacity-40"
            disabled={!newHabit.trim()}
          >
            Add
          </button>
        </div>

        <div className="mb-3 flex justify-end">
          <TodayActions onToast={setToast} />
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-800 shadow-sm">
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur supports-[backdrop-filter]:bg-gray-900/60">
              <tr>
                <th className="sticky left-0 z-20 w-64 border-b border-r border-gray-800 bg-gray-900/80 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400 backdrop-blur supports-[backdrop-filter]:bg-gray-900/60">Habit</th>
                {daysRange.map(({ key, date }, idx) => (
                  <th
                    key={key}
                    className={`border-b border-gray-800 px-2 py-3 text-gray-400 ${idx % 7 === 0 ? "border-l border-gray-800" : ""} ${
                      key === todayKey ? "bg-gray-800 font-semibold" : ""
                    }`}
                  >
                    <div className="text-[10px] uppercase tracking-wide opacity-70">
                      {date.toLocaleDateString(undefined, { weekday: "short" })}
                    </div>
                    <div>{date.getDate()}</div>
                  </th>
                ))}
                <th className="border-b px-2 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {displayHabits.length === 0 ? (
                <tr>
                  <td colSpan={daysRange.length + 2} className="px-3 py-14 text-center text-gray-400">
                    {habits.length === 0 ? "No habits yet. Add one above." : "No results match your search."}
                  </td>
                </tr>
              ) : (
                displayHabits.map((habit) => (
                  <tr key={habit.id} className="border-t border-gray-800 hover:bg-gray-800/40">
                    <td className="sticky left-0 z-10 border-r border-gray-800 bg-gray-900 px-4 py-3 align-middle">
                      <InlineEditable
                        value={habit.name}
                        onChange={(val) => renameHabit(habit.id, val)}
                      />
                      <div className="mt-1 flex items-center gap-2">
                        <ProgressRow habitId={habit.id} dateKeys={daysRange.map((d) => d.key)} />
                        <StreakBadge habitId={habit.id} />
                      </div>
                    </td>
                    {daysRange.map(({ key }, idx) => {
                      const checked = !!habit.log[key];
                      return (
                        <td
                          key={key}
                          className={`px-2 py-2 text-center ${idx % 7 === 0 ? "border-l border-gray-800" : ""} ${
                            key === todayKey ? "bg-gray-800/60" : ""
                          }`}
                        >
                          <button
                            aria-label={checked ? "Mark as missed" : "Mark as done"}
                            aria-pressed={checked}
                            onClick={() => toggleHabitForDate(habit.id, key)}
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-md border transition ${
                              checked
                                ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                                : "border-gray-700 hover:bg-gray-800"
                            }`}
                          >
                            {checked ? "✓" : ""}
                          </button>
                        </td>
                      );
                    })}
                    <td className="px-2 py-2 text-center">
                      <button
                        onClick={() => {
                          if (window.confirm("Delete this habit?")) deleteHabit(habit.id);
                        }}
                        className="rounded-md border border-gray-700 px-2 py-1 text-xs text-gray-300 shadow-sm hover:bg-gray-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {habits.length > 0 && (
          <div className="mt-6 flex flex-col-reverse items-start justify-between gap-3 sm:flex-row sm:items-center">
            <Stats habitsCount={displayHabits.length} days={days} />
            <ExportImport onToast={setToast} />
          </div>
        )}
      </div>
      {toast && (
        <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center">
          <div className="rounded-lg bg-white px-3 py-2 text-sm text-black shadow-lg">{toast}</div>
        </div>
      )}
    </div>
  );
}

function InlineEditable({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);
  return (
    <div className="flex items-center gap-2">
      {editing ? (
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={() => {
            onChange(val.trim() || value);
            setEditing(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onChange(val.trim() || value);
              setEditing(false);
            }
            if (e.key === "Escape") {
              setVal(value);
              setEditing(false);
            }
          }}
          className="w-full rounded-md border border-gray-300 bg-white/70 px-2 py-1 backdrop-blur supports-[backdrop-filter]:bg-white/50"
          autoFocus
        />
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="truncate text-left hover:underline"
          title="Rename"
        >
          {value}
        </button>
      )}
    </div>
  );
}

function Stats({ habitsCount, days }: { habitsCount: number; days: number }) {
  return (
    <div className="text-xs text-gray-400">
      {habitsCount} habit{habitsCount === 1 ? "" : "s"} over last {days} days
    </div>
  );
}

type ImportShape = { habits: Array<{ name?: unknown }> };

function isImportShape(value: unknown): value is ImportShape {
  if (typeof value !== "object" || value === null) return false;
  const maybe = value as Record<string, unknown>;
  if (!Array.isArray(maybe.habits)) return false;
  return true;
}

function ExportImport({ onToast }: { onToast?: (msg: string) => void }) {
  const { habits, clearAll, replaceHabits } = useHabitStore();

  function handleExport() {
    const blob = new Blob([JSON.stringify({ habits }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `habits-${toDateKey(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onToast?.("Exported JSON");
  }

  function handleImport(evt: ChangeEvent<HTMLInputElement>) {
    const file = evt.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as unknown;
        if (isImportShape(parsed)) {
          const now = Date.now();
          const incoming = parsed.habits
            .map((h, idx) => {
              const name = typeof h.name === "string" ? h.name.trim() : "";
              if (!name) return null;
              return {
                id: `${now}-${idx}`,
                name,
                createdAt: now,
                log: {},
              };
            })
            .filter(Boolean) as typeof habits;
          clearAll();
          replaceHabits(incoming);
          onToast?.("Imported habits");
        }
      } catch (e) {
        console.error("Invalid file", e);
        onToast?.("Invalid file");
      }
    };
    reader.readAsText(file);
    evt.currentTarget.value = "";
  }

  return (
    <div className="flex items-center gap-2 text-xs text-gray-200">
      <button onClick={handleExport} className="rounded border border-gray-700 px-2 py-1 hover:bg-gray-800">
        Export
      </button>
      <label className="cursor-pointer rounded border border-gray-700 px-2 py-1 hover:bg-gray-800">
        Import
        <input type="file" accept="application/json" className="hidden" onChange={handleImport} />
      </label>
    </div>
  );
}

function TodayActions({ onToast }: { onToast?: (msg: string) => void }) {
  const { habits, setAllForDate } = useHabitStore();
  const today = toDateKey(new Date());
  const allDone = habits.length > 0 && habits.every((h) => h.log[today]);
  return (
    <div className="flex items-center gap-2 text-xs">
      <button
        onClick={() => {
          setAllForDate(today, true);
          onToast?.("Marked all done today");
        }}
        className="rounded-md border border-gray-700 px-2 py-1 shadow-sm hover:bg-gray-800"
      >
        Complete all today
      </button>
      <button
        onClick={() => {
          setAllForDate(today, false);
          onToast?.("Cleared all for today");
        }}
        className="rounded-md border border-gray-700 px-2 py-1 shadow-sm hover:bg-gray-800"
        disabled={habits.length === 0 || !allDone}
      >
        Clear all today
      </button>
    </div>
  );
}

function ProgressRow({ habitId, dateKeys }: { habitId: string; dateKeys: string[] }) {
  const habit = useHabitStore((s) => s.habits.find((h) => h.id === habitId));
  const completedWindow = habit ? dateKeys.filter((k) => habit.log[k]).length : 0;
  const pct = dateKeys.length > 0 ? (completedWindow / dateKeys.length) * 100 : 0;
  return (
    <div className="mt-1 h-1.5 w-40 rounded-full bg-gray-800">
      <div className="h-full rounded-full bg-white" style={{ width: `${pct}%` }} />
    </div>
  );
}

function StreakBadge({ habitId }: { habitId: string }) {
  const habit = useHabitStore((s) => s.habits.find((h) => h.id === habitId));
  if (!habit) return null;
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i += 1) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const key = toDateKey(d);
    if (habit.log[key]) streak += 1;
    else break;
  }
  if (streak === 0) return null;
  return (
    <span className="inline-flex items-center rounded-full border border-gray-700 bg-gray-900/70 px-2 py-0.5 text-[10px] text-gray-200 shadow-sm">
      {streak} day{streak === 1 ? "" : "s"} streak
    </span>
  );
}

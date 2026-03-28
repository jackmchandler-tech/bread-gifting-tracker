import React, { useEffect, useState } from "react";
import SectionCard                    from "./ui/SectionCard";
import Badge                          from "./ui/Badge";
import AppButton                      from "./ui/AppButton";

export default function SetupScreen({
  settings,
  onSave,
  savedPulse,
  data,
  onRestore,
}) {
  const [form, setForm] = useState({
    title: settings.title || "Bread Tracker",
    itemSingular: settings.itemSingular || "loaf",
    itemPlural: settings.itemPlural || "loaves",
    enableRatings: settings.enableRatings ?? true,
    enableFeedback: settings.enableFeedback ?? true,
  });

  useEffect(() => {
    setForm({
      title: settings.title || "Bread Tracker",
      itemSingular: settings.itemSingular || "loaf",
      itemPlural: settings.itemPlural || "loaves",
      enableRatings: settings.enableRatings ?? true,
      enableFeedback: settings.enableFeedback ?? true,
    });
  }, [settings]);

  return (
    <div className="space-y-4">
      <SectionCard
        title="Setup"
        action={
          <Badge tone={savedPulse ? "green" : "gray"}>
            {savedPulse ? "Saved" : "Ready"}
          </Badge>
        }
      >
        <div className="space-y-3">
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="App title"
            className="w-full rounded-2xl border px-3 py-3 outline-none"
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              value={form.itemSingular}
              onChange={(e) =>
                setForm((f) => ({ ...f, itemSingular: e.target.value }))
              }
              placeholder="Singular item"
              className="w-full rounded-2xl border px-3 py-3 outline-none"
            />
            <input
              value={form.itemPlural}
              onChange={(e) =>
                setForm((f) => ({ ...f, itemPlural: e.target.value }))
              }
              placeholder="Plural item"
              className="w-full rounded-2xl border px-3 py-3 outline-none"
            />
          </div>

          <label className="flex items-center justify-between rounded-2xl border px-3 py-3">
            <span className="text-sm font-medium">Enable ratings</span>
            <input
              type="checkbox"
              checked={form.enableRatings}
              onChange={(e) =>
                setForm((f) => ({ ...f, enableRatings: e.target.checked }))
              }
            />
          </label>

          <label className="flex items-center justify-between rounded-2xl border px-3 py-3">
            <span className="text-sm font-medium">Enable feedback</span>
            <input
              type="checkbox"
              checked={form.enableFeedback}
              onChange={(e) =>
                setForm((f) => ({ ...f, enableFeedback: e.target.checked }))
              }
            />
          </label>

          <div className="flex justify-end">
            <AppButton
              onClick={() =>
                onSave({
                  title: form.title.trim() || "Bread Tracker",
                  itemSingular: form.itemSingular.trim() || "loaf",
                  itemPlural: form.itemPlural.trim() || "loaves",
                  enableRatings: !!form.enableRatings,
                  enableFeedback: !!form.enableFeedback,
                })
              }
            >
              Save Setup
            </AppButton>
          </div>

          <div className="text-xs text-gray-500">
            These toggles affect visibility only. Existing ratings and feedback are preserved.
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Preview">
        <div className="text-sm text-gray-600 space-y-1">
          <div><span className="font-medium">Title:</span> {form.title || "Bread Tracker"}</div>
          <div><span className="font-medium">Single item:</span> {form.itemSingular || "loaf"}</div>
          <div><span className="font-medium">Plural item:</span> {form.itemPlural || "loaves"}</div>
          <div><span className="font-medium">Ratings:</span> {form.enableRatings ? "On" : "Hidden"}</div>
          <div><span className="font-medium">Feedback:</span> {form.enableFeedback ? "On" : "Hidden"}</div>
        </div>
      </SectionCard>

      <SectionCard title="Inactive People">
        <div className="space-y-2">
          {data.people.filter((p) => p.active === false).map((p) => (
            <div key={p.id} className="flex justify-between items-center border rounded-xl px-3 py-2">
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-xs text-gray-500">{p.associatedName || ""}</div>
              </div>
              <AppButton onClick={() => onRestore(p.id)}>
                Restore
              </AppButton>
            </div>
          ))}

          {!data.people.some((p) => p.active === false) && (
            <div className="text-sm text-gray-500">No inactive people.</div>
          )}
        </div>
      </SectionCard>
    </div>
  );
} // end of SetupScreen()

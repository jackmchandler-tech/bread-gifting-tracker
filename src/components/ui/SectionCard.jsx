import React from "react";

export default function SectionCard({ title, action, children }) {
  return (
    <div className="rounded-3xl bg-white shadow-sm border p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
} // end of SectionCard()

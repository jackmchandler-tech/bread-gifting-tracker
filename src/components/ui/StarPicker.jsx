import React from "react";
import { Star } from "./Icons";

export default function StarPicker({ value, onChange }) {
  return (
    <div className="flex gap-1 items-center">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} className="text-xl leading-none">
          <Star
            className={`w-6 h-6 ${n <= value ? "text-yellow-600" : "text-gray-400"}`}
            filled={n <= value}
          />
        </button>
      ))}
      {value ? (
        <button type="button" onClick={() => onChange(0)} className="text-xs text-gray-500 ml-2">
          Clear
        </button>
      ) : null}
    </div>
  );
} // end of StarPicker()

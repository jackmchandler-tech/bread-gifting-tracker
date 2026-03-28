import React from "react";
import { X } from "./Icons";

export default function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-3">
      <div className="bg-white rounded-[28px] w-full max-w-lg max-h-[90vh] overflow-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between rounded-t-[28px]">
          <div className="font-semibold">{title}</div>
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
} // end of Modal()

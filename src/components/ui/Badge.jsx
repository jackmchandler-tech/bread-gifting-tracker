import React from "react";

export default function Badge({ children, tone = "gray" }) {
  const styles = {
    gray: "bg-gray-100 text-gray-700",
    orange: "bg-orange-100 text-orange-800",
    blue: "bg-blue-100 text-blue-800",
    green: "bg-green-100 text-green-800",
    yellow: "bg-yellow-100 text-yellow-800",
    red: "bg-red-100 text-red-800",
  };

  return (
    <span className={`text-[11px] px-2 py-1 rounded-full font-medium ${styles[tone]}`}>
      {children}
    </span>
  );
} // end of Badge()

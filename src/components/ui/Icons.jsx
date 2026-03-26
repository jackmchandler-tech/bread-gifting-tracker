import React from "react";

function Icon({ children, className = "w-5 h-5", title }) {
  return (
    <span
      title={title}
      className={`${className} inline-flex items-center justify-center leading-none`}
    >
      {children}
    </span>
  );
} // end of Icon()

export function Search({ className = "w-5 h-5 text-gray-400" }) {
  return <Icon className={className}>🔎</Icon>;
} // end of Search()

export function Plus({ className = "w-5 h-5" }) {
  return <Icon className={className}>＋</Icon>;
} // end of Plus()

export function RotateCcw({ className = "w-5 h-5" }) {
  return <Icon className={className}>↺</Icon>;
} // end of RotateCcw()

export function Bread({ className = "w-5 h-5" }) {
  return <Icon className={className}>🍞</Icon>;
} // end of Bread()

export function Users({ className = "w-5 h-5" }) {
  return <Icon className={className}>👥</Icon>;
} // end of Users()

export function ListChecks({ className = "w-5 h-5" }) {
  return <Icon className={className}>☰</Icon>;
} // end of ListChecks()

export function Home({ className = "w-5 h-5" }) {
  return <Icon className={className}>⌂</Icon>;
} // end of Home()

export function Star({ className = "w-5 h-5", filled = false }) {
  return <Icon className={className}>{filled ? "★" : "☆"}</Icon>;
} // end of Star()

export function Phone({ className = "w-5 h-5" }) {
  return <Icon className={className}>☎</Icon>;
} // end of Phone()

export function CheckSquare({ className = "w-5 h-5" }) {
  return <Icon className={className}>☑</Icon>;
} // end of CheckSquare()

export function Square({ className = "w-5 h-5" }) {
  return <Icon className={className}>☐</Icon>;
} // end of Square()

export function UserPlus({ className = "w-5 h-5" }) {
  return <Icon className={className}>🧑+</Icon>;
} // end of UserPlus()

export function Trash2({ className = "w-5 h-5" }) {
  return <Icon className={className}>🗑</Icon>;
} // end of Trash2()

export function X({ className = "w-5 h-5" }) {
  return <Icon className={className}>✕</Icon>;
} // end of X()

export function SettingsIcon({ className = "w-5 h-5" }) {
  return <Icon className={className}>⚙</Icon>;
} // end of SettingsIcon()

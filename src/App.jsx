import React, { useEffect, useMemo, useRef, useState } from "react";
import { STORAGE_KEY, APP_VERSION, DEFAULT_APP_SETTINGS } from "./constants";
import { todayInputValue, formatDate } from "./utils/dates";
import { parseCsv, buildCsv } from "./utils/csv";
import { normalizeData, defaultData, loadData } from "./utils/storage";
import { downloadTextFile } from "./utils/file";

function Icon({ children, className = "w-5 h-5", title }) {
  return (
    <span title={title} className={`${className} inline-flex items-center justify-center leading-none`}>
      {children}
    </span>
  );
}

const Search = ({ className = "w-5 h-5 text-gray-400" }) => <Icon className={className}>🔎</Icon>;
const Plus = ({ className = "w-5 h-5" }) => <Icon className={className}>＋</Icon>;
const RotateCcw = ({ className = "w-5 h-5" }) => <Icon className={className}>↺</Icon>;
const Bread = ({ className = "w-5 h-5" }) => <Icon className={className}>🍞</Icon>;
const Users = ({ className = "w-5 h-5" }) => <Icon className={className}>👥</Icon>;
const ListChecks = ({ className = "w-5 h-5" }) => <Icon className={className}>☰</Icon>;
const Home = ({ className = "w-5 h-5" }) => <Icon className={className}>⌂</Icon>;
const Star = ({ className = "w-5 h-5", filled = false }) => <Icon className={className}>{filled ? "★" : "☆"}</Icon>;
const Phone = ({ className = "w-5 h-5" }) => <Icon className={className}>☎</Icon>;
const CheckSquare = ({ className = "w-5 h-5" }) => <Icon className={className}>☑</Icon>;
const Square = ({ className = "w-5 h-5" }) => <Icon className={className}>☐</Icon>;
const UserPlus = ({ className = "w-5 h-5" }) => <Icon className={className}>🧑+</Icon>;
const Trash2 = ({ className = "w-5 h-5" }) => <Icon className={className}>🗑</Icon>;
const X = ({ className = "w-5 h-5" }) => <Icon className={className}>✕</Icon>;
const SettingsIcon = ({ className = "w-5 h-5" }) => <Icon className={className}>⚙</Icon>;



function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function SectionCard({ title, action, children }) {
  return (
    <div className="rounded-3xl bg-white shadow-sm border p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

function Badge({ children, tone = "gray" }) {
  const styles = {
    gray: "bg-gray-100 text-gray-700",
    orange: "bg-orange-100 text-orange-800",
    blue: "bg-blue-100 text-blue-800",
    green: "bg-green-100 text-green-800",
    yellow: "bg-yellow-100 text-yellow-800",
    red: "bg-red-100 text-red-800",
  };
  return <span className={`text-[11px] px-2 py-1 rounded-full font-medium ${styles[tone]}`}>{children}</span>;
}

function AppButton({ children, onClick, variant = "primary", className = "", disabled = false, type = "button" }) {
  const styles = variant === "primary"
    ? "bg-black text-white hover:bg-gray-800"
    : variant === "danger"
      ? "bg-red-600 text-white hover:bg-red-700"
      : "bg-white border hover:bg-gray-50";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-2xl px-4 py-2.5 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${styles} ${className}`}
    >
      {children}
    </button>
  );
}

function PersonRow({ row, mode, itemSingular, itemPlural, onGift, onOpen, onToggleGiftDateEdit }) {
  const totalCount = row.totalGifts || 0;
  const totalLabel = totalCount === 1 ? `1 ${itemSingular}` : `${totalCount} ${itemPlural}`;

  return (
    <div className="rounded-2xl border p-3 bg-white">
      <div className="flex items-start gap-3">
        {mode === "list" && (
          <button onClick={onGift} className="mt-0.5">
            {row.checked ? <CheckSquare className="w-6 h-6" /> : <Square className="w-6 h-6 text-gray-400" />}
          </button>
        )}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <div className="font-medium leading-tight flex items-center gap-2 flex-wrap">
              <span>{row.person.name}</span>
              {mode === "all" && <Badge tone="gray">{totalLabel}</Badge>}
            </div>
            <div className="flex gap-1 flex-wrap justify-end">
              {row.isNewToList && mode === "list" && <Badge tone="blue">NEW TO GROUP</Badge>}
              {row.neverGifted && mode === "all" && <Badge tone="yellow">NEVER GIFTED</Badge>}
            </div>
          </div>
          {!!row.person.associatedName && <div className="text-sm text-gray-600">Assoc: {row.person.associatedName}</div>}
          {!row.person.associatedName && !!row.person.note && <div className="text-sm text-gray-600">{row.person.note}</div>}
          {mode === "list" ? (
            row.checked ? (
              <button onClick={onToggleGiftDateEdit} className="text-xs text-gray-500 hover:text-gray-800 text-left">
                Gifted {formatDate(row.lastOnList?.date)} · {row.lastOnList?.breadTypeName}
              </button>
            ) : (
              <div className="text-xs text-gray-500">Last anywhere: {formatDate(row.lastAnywhere?.date)}</div>
            )
          ) : (
            <button onClick={onToggleGiftDateEdit} className="text-xs text-gray-500 hover:text-gray-800 text-left">
              {row.lastAnywhere ? `Last anywhere: ${formatDate(row.lastAnywhere.date)} · ${row.lastAnywhere.breadTypeName}` : `Never received ${itemSingular}`}
            </button>
          )}
        </div>
        <button onClick={onOpen} className="text-xs text-gray-500 hover:text-black">Details</button>
      </div>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-3">
      <div className="bg-white rounded-[28px] w-full max-w-lg max-h-[90vh] overflow-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between rounded-t-[28px]">
          <div className="font-semibold">{title}</div>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

function StarPicker({ value, onChange }) {
  return (
    <div className="flex gap-1 items-center">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} className="text-xl leading-none">
          <Star className={`w-6 h-6 ${n <= value ? "text-yellow-600" : "text-gray-400"}`} filled={n <= value} />
        </button>
      ))}
      {value ? <button type="button" onClick={() => onChange(0)} className="text-xs text-gray-500 ml-2">Clear</button> : null}
    </div>
  );
}

function ListsScreen({ data, setActiveListId, setLastOpenedListId, setSearch, setTab, addList, onRename }) {
  const [newListName, setNewListName] = useState("");
  return (
    <div className="space-y-4">
      <SectionCard title="Groups">
        <div className="space-y-3">
          {data.lists.map((list) => {
            const remaining = data.memberships.filter((m) => m.listId === list.id && !m.giftedThisCycle).length;
            return (
              <div key={list.id} className="rounded-2xl border p-4 bg-white">
                <button
                  onClick={() => { setActiveListId(list.id); setLastOpenedListId(list.id); setSearch(""); setTab("listDetail"); }}
                  className="w-full text-left hover:bg-stone-50"
                >
                  <div className="font-medium">{list.name}</div>
                  <div className="text-sm text-gray-500">{remaining} left this cycle</div>
                </button>
                <div className="mt-3">
                  <AppButton variant="secondary" onClick={() => onRename(list.id)}>Rename Group</AppButton>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard title="Create Group">
        <div className="flex gap-2">
          <input value={newListName} onChange={(e) => setNewListName(e.target.value)} placeholder="Group name" className="flex-1 rounded-2xl border px-3 py-2.5 outline-none" />
          <AppButton onClick={() => { addList(newListName); setNewListName(""); }}>Add</AppButton>
        </div>
      </SectionCard>
    </div>
  );
}

function BreadManagerScreen({ breadTypes, setCurrentBread, requestDeleteBreadType, openAdd }) {
  return (
    <SectionCard title="Gift Types" action={<AppButton onClick={openAdd}><Plus className="w-4 h-4 inline mr-1" />Add</AppButton>}>
      <div className="space-y-3">
        {breadTypes.map((bread) => (
          <div key={bread.id} className="rounded-2xl border p-3 flex items-center justify-between gap-3">
            <button onClick={() => setCurrentBread(bread.id)} className="flex-1 text-left font-medium">{bread.name}</button>
            {bread.isCurrent && <Badge tone="orange">CURRENT</Badge>}
            <button onClick={() => requestDeleteBreadType(bread.id)} className="text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function SetupScreen({ settings, onSave, savedPulse }) {
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
          action={<Badge tone={savedPulse ? "green" : "gray"}>{savedPulse ? "Saved" : "Ready"}</Badge>}
        >
          <div className="space-y-3">
          <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="App title" className="w-full rounded-2xl border px-3 py-3 outline-none" />
          <div className="grid grid-cols-2 gap-3">
            <input value={form.itemSingular} onChange={(e) => setForm((f) => ({ ...f, itemSingular: e.target.value }))} placeholder="Singular item" className="w-full rounded-2xl border px-3 py-3 outline-none" />
            <input value={form.itemPlural} onChange={(e) => setForm((f) => ({ ...f, itemPlural: e.target.value }))} placeholder="Plural item" className="w-full rounded-2xl border px-3 py-3 outline-none" />
          </div>
          <label className="flex items-center justify-between rounded-2xl border px-3 py-3">
            <span className="text-sm font-medium">Enable ratings</span>
            <input type="checkbox" checked={form.enableRatings} onChange={(e) => setForm((f) => ({ ...f, enableRatings: e.target.checked }))} />
          </label>
          <label className="flex items-center justify-between rounded-2xl border px-3 py-3">
            <span className="text-sm font-medium">Enable feedback</span>
            <input type="checkbox" checked={form.enableFeedback} onChange={(e) => setForm((f) => ({ ...f, enableFeedback: e.target.checked }))} />
          </label>
          <div className="flex justify-end">
            <AppButton onClick={() => onSave({
              title: form.title.trim() || "Giving Tracker",
              itemSingular: form.itemSingular.trim() || "gift",
              itemPlural: form.itemPlural.trim() || "gifts",
              enableRatings: !!form.enableRatings,
              enableFeedback: !!form.enableFeedback,
            })}>Save Setup</AppButton>
          </div>
            <div className="text-xs text-gray-500">
              These toggles affect visibility only. Existing ratings and feedback are preserved.
            </div>
        </div>
      </SectionCard>
      <SectionCard title="Preview">
        <div className="text-sm text-gray-600 space-y-1">
          <div><span className="font-medium">Title:</span> {form.title || "Giving Tracker"}</div>
          <div><span className="font-medium">Single item:</span> {form.itemSingular || "gift"}</div>
          <div><span className="font-medium">Plural item:</span> {form.itemPlural || "gifts"}</div>
          <div><span className="font-medium">Ratings:</span> {form.enableRatings ? "On" : "Hidden"}</div>
          <div><span className="font-medium">Feedback:</span> {form.enableFeedback ? "On" : "Hidden"}</div>
        </div>
      </SectionCard>
    </div>
  );
}

function AddPersonModal({ list, onClose, onSave }) {
  const [form, setForm] = useState({ name: "", associatedName: "", howMet: "", note: "", phone: "" });
  const nameRef = useRef(null);
  useEffect(() => { nameRef.current?.focus(); }, []);
  return (
    <Modal title="Add Person" onClose={onClose}>
      <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); onSave(form); }}>
        {[
          ["name", "Name *"], ["associatedName", "Associated person"], ["howMet", "How you met them"], ["note", "Position / note"], ["phone", "Phone number"],
        ].map(([key, label], index) => (
          <input key={key} ref={index === 0 ? nameRef : undefined} value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} placeholder={label} className="w-full rounded-2xl border px-3 py-3 outline-none" />
        ))}
        <div className="text-sm text-gray-500 rounded-2xl bg-stone-50 border p-3">
          {list ? `Saving will add this person to the master list and to ${list.name}.` : "Saving will add this person to the master list only."}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <AppButton onClick={onClose} variant="secondary">Cancel</AppButton>
          <AppButton type="submit" disabled={!form.name.trim()}>Save</AppButton>
        </div>
      </form>
    </Modal>
  );
}

function AddExistingModal({ list, people, memberships, onClose, onAdd }) {
  const [search, setSearch] = useState("");
  const alreadyInList = new Set(memberships.filter((m) => m.listId === list.id).map((m) => m.personId));
  const options = people
    .filter((p) => !p.archived && !alreadyInList.has(p.id))
    .filter((p) => {
      const q = search.trim().toLowerCase();
      return !q || p.name.toLowerCase().includes(q) || p.associatedName.toLowerCase().includes(q);
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Modal title={`Add Existing to ${list.name}`} onClose={onClose}>
      <div className="space-y-3">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search master list" className="w-full rounded-2xl border px-3 py-3 outline-none" />
        <div className="space-y-2">
          {options.map((p) => (
            <button key={p.id} onClick={() => onAdd(p.id)} className="w-full text-left rounded-2xl border p-3 hover:bg-stone-50">
              <div className="font-medium">{p.name}</div>
              {!!p.associatedName && <div className="text-sm text-gray-500">Assoc: {p.associatedName}</div>}
            </button>
          ))}
          {!options.length && <div className="text-sm text-gray-500">No available people found.</div>}
        </div>
      </div>
    </Modal>
  );
}

function PersonDetailModal({ person, gifts, lists, enableFeedback, enableRatings, onClose, onEditPerson, onEditGiftFeedback, onSaveFeedback }) {
  const latest = gifts[0] || null;
  const [feedback, setFeedback] = useState(latest?.feedback || "");
  const [rating, setRating] = useState(latest?.rating || 0);
  const [editingFeedback, setEditingFeedback] = useState(false);
  const sourceName = (gift) => lists.find((l) => l.id === gift.listId)?.name || "All People";
  const hasSavedFeedback = latest && (latest.feedback || latest.rating);

  return (
    <Modal title={person.name} onClose={onClose}>
      <div className="space-y-4">
        <SectionCard title="Details" action={<AppButton onClick={onEditPerson} variant="secondary">Edit Person</AppButton>}>
          {!!person.associatedName && <div className="text-sm"><span className="font-medium">Associated:</span> {person.associatedName}</div>}
          {!!person.howMet && <div className="text-sm"><span className="font-medium">How met:</span> {person.howMet}</div>}
          {!!person.note && <div className="text-sm"><span className="font-medium">Note:</span> {person.note}</div>}
          {!!person.phone && <div className="text-sm flex items-center gap-2"><Phone className="w-4 h-4" />{person.phone}</div>}
        </SectionCard>

        {latest && (
          <SectionCard title="Latest Gift">
            <div className="text-sm">{formatDate(latest.date)} · {latest.breadTypeName} · {sourceName(latest)}</div>
            {hasSavedFeedback && !editingFeedback && (
              <div className="space-y-2">
                {!!latest.rating && enableRatings && <div className="text-sm text-amber-700">{"★".repeat(latest.rating)}{"☆".repeat(5 - latest.rating)}</div>}
                {!!latest.feedback && enableFeedback && <div className="text-sm">{latest.feedback}</div>}
                {(enableFeedback || enableRatings) && <AppButton variant="secondary" onClick={() => setEditingFeedback(true)}>Edit Feedback</AppButton>}
              </div>
            )}
            {(!hasSavedFeedback || editingFeedback) && (enableFeedback || enableRatings) && (
              <div className="space-y-3">
                {enableFeedback && <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Feedback for this gift" className="w-full rounded-2xl border px-3 py-3 min-h-[100px] outline-none" />}
                {enableRatings && <StarPicker value={rating} onChange={setRating} />}
                <div className="flex gap-2">
                  {editingFeedback && <AppButton variant="secondary" onClick={() => setEditingFeedback(false)}>Cancel</AppButton>}
                  <AppButton onClick={() => {onSaveFeedback(feedback, rating); setEditingFeedback(false);}}> Save Feedback</AppButton>
                </div>
              </div>
            )}
          </SectionCard>
        )}

        <SectionCard title="Gift History">
          <div className="space-y-3">
            {gifts.map((gift) => (
              <div key={gift.id} className="rounded-2xl border p-3 space-y-2">
                <div className="font-medium">{formatDate(gift.date)} · {gift.breadTypeName}</div>
                <div className="text-sm text-gray-500">{sourceName(gift)}</div>
                {!!gift.rating && enableRatings && <div className="text-sm mt-2 text-amber-700">{"★".repeat(gift.rating)}{"☆".repeat(5 - gift.rating)}</div>}
                {!!gift.feedback && enableFeedback && <div className="text-sm mt-2">{gift.feedback}</div>}
                {(enableFeedback || enableRatings) && <div><AppButton variant="secondary" onClick={() => onEditGiftFeedback(gift.id)}>Edit Feedback</AppButton></div>}
              </div>
            ))}
            {!gifts.length && <div className="text-sm text-gray-500">No gift history yet.</div>}
          </div>
        </SectionCard>
      </div>
    </Modal>
  );
}

function AddBreadModal({ onClose, onSave }) {
  const [name, setName] = useState("");
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, []);
  return (
    <Modal title="Add Gift Type" onClose={onClose}>
      <div className="space-y-3">
        <input ref={inputRef} value={name} onChange={(e) => setName(e.target.value)} placeholder="Gift type" className="w-full rounded-2xl border px-3 py-3 outline-none" />
        <div className="flex justify-end gap-2">
          <AppButton onClick={onClose} variant="secondary">Cancel</AppButton>
          <AppButton onClick={() => onSave(name)} disabled={!name.trim()}>Add</AppButton>
        </div>
      </div>
    </Modal>
  );
}

function ConfirmDeleteBreadModal({ bread, onClose, onConfirm }) {
  return (
    <Modal title="Delete Gift Type" onClose={onClose}>
      <div className="space-y-4">
        <div className="text-sm text-gray-700">Delete <span className="font-semibold">{bread?.name}</span> from the gift type list? Previous gift records will keep this gift type name in history.</div>
        <div className="flex justify-end gap-2">
          <AppButton onClick={onClose} variant="secondary">Cancel</AppButton>
          <AppButton onClick={onConfirm} variant="danger">Delete</AppButton>
        </div>
      </div>
    </Modal>
  );
}

function EditGiftDateModal({ gift, onClose, onSave }) {
  const [date, setDate] = useState(gift?.date || todayInputValue());
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, []);
  return (
    <Modal title="Edit Gift Date" onClose={onClose}>
      <div className="space-y-3">
        <input ref={inputRef} type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-2xl border px-3 py-3 outline-none" />
        <div className="flex justify-end gap-2">
          <AppButton onClick={onClose} variant="secondary">Cancel</AppButton>
          <AppButton onClick={() => onSave(date)}>Save</AppButton>
        </div>
      </div>
    </Modal>
  );
}

function EditPersonModal({ person, onClose, onSave }) {
  const [form, setForm] = useState({
    name: person?.name || "", associatedName: person?.associatedName || "", howMet: person?.howMet || "", note: person?.note || "", phone: person?.phone || "",
  });
  const nameRef = useRef(null);
  useEffect(() => { nameRef.current?.focus(); }, []);
  return (
    <Modal title="Edit Person" onClose={onClose}>
      <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (!form.name.trim()) return; onSave({ name: form.name.trim(), associatedName: form.associatedName.trim(), howMet: form.howMet.trim(), note: form.note.trim(), phone: form.phone.trim() }); }}>
        {[
          ["name", "Name *"], ["associatedName", "Associated person"], ["howMet", "How you met them"], ["note", "Position / note"], ["phone", "Phone number"],
        ].map(([key, label], index) => (
          <input key={key} ref={index === 0 ? nameRef : undefined} value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} placeholder={label} className="w-full rounded-2xl border px-3 py-3 outline-none" />
        ))}
        <div className="flex justify-end gap-2 pt-2">
          <AppButton onClick={onClose} variant="secondary">Cancel</AppButton>
          <AppButton type="submit" disabled={!form.name.trim()}>Save Changes</AppButton>
        </div>
      </form>
    </Modal>
  );
}

function EditGiftFeedbackModal({ gift, enableFeedback, enableRatings, onClose, onSave }) {
  const [feedback, setFeedback] = useState(gift?.feedback || "");
  const [rating, setRating] = useState(gift?.rating || 0);
  const textRef = useRef(null);
  useEffect(() => { textRef.current?.focus(); }, []);
  return (
    <Modal title="Edit Gift Feedback" onClose={onClose}>
      <div className="space-y-3">
        <div className="text-sm text-gray-500">{gift ? `${formatDate(gift.date)} · ${gift.breadTypeName}` : "Gift"}</div>
        {enableFeedback && <textarea ref={textRef} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Feedback for this gift" className="w-full rounded-2xl border px-3 py-3 min-h-[100px] outline-none" />}
        {enableRatings && <StarPicker value={rating} onChange={setRating} />}
        <div className="flex justify-end gap-2">
          <AppButton onClick={onClose} variant="secondary">Cancel</AppButton>
          <AppButton onClick={() => {onSaveFeedback(feedback, rating); setEditingFeedback(false);}} >Save Feedback</AppButton>
        </div>
      </div>
    </Modal>
  );
}

function RenameGroupModal({ group, onClose, onSave }) {
  const [name, setName] = useState(group?.name || "");
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, []);
  return (
    <Modal title="Rename Group" onClose={onClose}>
      <div className="space-y-3">
        <input ref={inputRef} value={name} onChange={(e) => setName(e.target.value)} placeholder="Group name" className="w-full rounded-2xl border px-3 py-3 outline-none" />
        <div className="flex justify-end gap-2">
          <AppButton onClick={onClose} variant="secondary">Cancel</AppButton>
          <AppButton onClick={() => onSave(name)} disabled={!name.trim()}>Save</AppButton>
        </div>
      </div>
    </Modal>
  );
}

export default function AppWrapper() {
  const App = BreadGiftingTrackerWebApp;
  return <App />;
}


function BreadGiftingTrackerWebApp() {
  const [data, setData] = useState(defaultData);
  const [tab, setTab] = useState("home");
  const [activeListId, setActiveListId] = useState(null);
  const [search, setSearch] = useState("");
  const [undoGift, setUndoGift] = useState(null);
  const [personModalId, setPersonModalId] = useState(null);
  const [addPersonContext, setAddPersonContext] = useState(null);
  const [showAddExisting, setShowAddExisting] = useState(false);
  const [showBreadManager, setShowBreadManager] = useState(false);
  const [editGiftRow, setEditGiftRow] = useState(null);
  const [deleteBreadId, setDeleteBreadId] = useState(null);
  const [lastOpenedListId, setLastOpenedListId] = useState(null);
  const [editPersonId, setEditPersonId] = useState(null);
  const [editFeedbackGiftId, setEditFeedbackGiftId] = useState(null);
  const [renameGroupId, setRenameGroupId] = useState(null);
  const [setupSavedPulse, setSetupSavedPulse] = useState(false);
  const backupInputRef = useRef(null);
  const peopleCsvInputRef = useRef(null);

  useEffect(() => { setData(loadData()); }, []);
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }, [data]);
  useEffect(() => {
    if (!undoGift) return;
    const t = setTimeout(() => setUndoGift(null), 5000);
    return () => clearTimeout(t);
  }, [undoGift]);
  
  useEffect(() => {
    if (!setupSavedPulse) return;
    const t = setTimeout(() => setSetupSavedPulse(false), 1800);
    return () => clearTimeout(t);
  }, [setupSavedPulse]);

  const settings = data.appSettings || DEFAULT_APP_SETTINGS;
  const itemSingular = settings.itemSingular || "gift";
  const itemPlural = settings.itemPlural || "gifts";
  const currentBread = useMemo(() => data.breadTypes.find((b) => b.isCurrent) || data.breadTypes[0], [data.breadTypes]);
  const activeList = useMemo(() => data.lists.find((l) => l.id === activeListId) || null, [data.lists, activeListId]);
  const quickAccessList = useMemo(() => data.lists.find((l) => l.id === (lastOpenedListId || activeListId)) || data.lists[0] || null, [data.lists, lastOpenedListId, activeListId]);

  function personById(id) { return data.people.find((p) => p.id === id); }
  function giftsForPerson(id) { return data.gifts.filter((g) => g.personId === id).sort((a, b) => b.date.localeCompare(a.date)); }
  function lastGiftAnywhere(personId) { return giftsForPerson(personId)[0] || null; }
  function lastGiftOnList(personId, listId) { return data.gifts.filter((g) => g.personId === personId && g.listId === listId).sort((a, b) => b.date.localeCompare(a.date))[0] || null; }
  function setCurrentBread(id) { setData((d) => ({ ...d, breadTypes: d.breadTypes.map((b) => ({ ...b, isCurrent: b.id === id })) })); }
  function addBreadType(name) {
    const trimmed = name.trim(); if (!trimmed) return;
    setData((d) => ({ ...d, breadTypes: [...d.breadTypes, { id: uid(), name: trimmed, isCurrent: d.breadTypes.length === 0 }] }));
  }
  function removeBreadType(id) {
    setData((d) => {
      const removed = d.breadTypes.find((b) => b.id === id);
      const next = d.breadTypes.filter((b) => b.id !== id);
      if (removed?.isCurrent && next[0]) next[0].isCurrent = true;
      return { ...d, breadTypes: next };
    });
  }
  function addList(name) {
    const trimmed = name.trim(); if (!trimmed) return;
    setData((d) => ({ ...d, lists: [...d.lists, { id: uid(), name: trimmed }] }));
  }
  function renameList(listId, name) {
    const trimmed = name.trim(); if (!trimmed) return;
    setData((d) => ({ ...d, lists: d.lists.map((list) => (list.id === listId ? { ...list, name: trimmed } : list)) }));
  }
  function updateAppSettings(updates) {
  setData((d) => ({
    ...d,
    appSettings: { ...DEFAULT_APP_SETTINGS, ...(d.appSettings || {}), ...updates },
  }));
  setSetupSavedPulse(true);
}
  function addExistingPersonToList(personId, listId) {
    setData((d) => {
      if (d.memberships.some((m) => m.personId === personId && m.listId === listId)) return d;
      return { ...d, memberships: [...d.memberships, { id: uid(), personId, listId, giftedThisCycle: false, isNewToList: true }] };
    });
  }
  function recordGift(personId, listId = null, overrideDate = null) {
    const gift = { id: uid(), personId, listId, breadTypeName: currentBread?.name || itemSingular, date: overrideDate || todayInputValue(), feedback: "", rating: null };
    setData((d) => ({
      ...d,
      gifts: [...d.gifts, gift],
      memberships: d.memberships.map((m) => m.personId === personId && m.listId === listId ? { ...m, giftedThisCycle: true, isNewToList: false } : m),
    }));
    setUndoGift(gift);
  }
  function undoLastGift() {
    if (!undoGift) return;
    const priorGiftOnList = undoGift.listId ? data.gifts.filter((g) => g.id !== undoGift.id && g.personId === undoGift.personId && g.listId === undoGift.listId).sort((a, b) => b.date.localeCompare(a.date))[0] : null;
    setData((d) => ({
      ...d,
      gifts: d.gifts.filter((g) => g.id !== undoGift.id),
      memberships: d.memberships.map((m) => {
        if (m.personId === undoGift.personId && m.listId === undoGift.listId) {
          return { ...m, giftedThisCycle: !!priorGiftOnList, isNewToList: priorGiftOnList ? false : m.isNewToList };
        }
        return m;
      }),
    }));
    setUndoGift(null);
  }
  function resetListCycle(listId) { setData((d) => ({ ...d, memberships: d.memberships.map((m) => (m.listId === listId ? { ...m, giftedThisCycle: false } : m)) })); }
  function updateLatestGiftFeedback(personId, feedback, rating) {
    const latest = giftsForPerson(personId)[0]; if (!latest) return;
    setData((d) => ({ ...d, gifts: d.gifts.map((g) => (g.id === latest.id ? { ...g, feedback, rating: rating || null } : g)) }));
  }
  function updateGiftFeedback(giftId, feedback, rating) { setData((d) => ({ ...d, gifts: d.gifts.map((g) => (g.id === giftId ? { ...g, feedback, rating: rating || null } : g)) })); }
  function updatePerson(personId, updates) { setData((d) => ({ ...d, people: d.people.map((p) => (p.id === personId ? { ...p, ...updates } : p)) })); }
  function updateGiftDate(giftId, date) { setData((d) => ({ ...d, gifts: d.gifts.map((g) => (g.id === giftId ? { ...g, date } : g)) })); setUndoGift((g) => (g && g.id === giftId ? { ...g, date } : g)); }
  function confirmDeleteBreadType() { if (!deleteBreadId) return; removeBreadType(deleteBreadId); setDeleteBreadId(null); }
  function exportBackup() { downloadTextFile(`giving-tracker-backup-${todayInputValue()}.json`, JSON.stringify(data, null, 2), "application/json;charset=utf-8"); }
  function exportGiftHistoryCsv() {
    const rows = data.gifts.slice().sort((a, b) => b.date.localeCompare(a.date)).map((gift) => ({
      date: gift.date, personName: personById(gift.personId)?.name || "", associatedName: personById(gift.personId)?.associatedName || "",
      giftType: gift.breadTypeName, groupName: data.lists.find((l) => l.id === gift.listId)?.name || "All People", rating: gift.rating || "", feedback: gift.feedback || "",
    }));
    downloadTextFile(`giving-history-${todayInputValue()}.csv`, buildCsv(rows, ["date", "personName", "associatedName", "giftType", "groupName", "rating", "feedback"]), "text/csv;charset=utf-8");
  }
  function importBackupFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try { const parsed = normalizeData(JSON.parse(String(reader.result || "{}"))); setData(parsed); setTab("home"); setActiveListId(null); setSearch(""); }
      catch { alert("That backup file could not be read."); }
    };
    reader.readAsText(file);
  }
  function importPeopleCsvFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const rows = parseCsv(String(reader.result || "")); if (!rows.length) { alert("The CSV did not contain any rows."); return; }
        setData((d) => {
          const nextPeople = [...d.people], nextLists = [...d.lists], nextMemberships = [...d.memberships];
          for (const row of rows) {
            const name = (row.name || row.Name || "").trim(); if (!name) continue;
            const associatedName = (row.associatedName || row.AssociatedName || row.associated || row.Associated || "").trim();
            const howMet = (row.howMet || row.HowMet || row.met || "").trim();
            const note = (row.note || row.Note || row.position || row.Position || "").trim();
            const phone = (row.phone || row.Phone || row.phoneNumber || row.PhoneNumber || "").trim();
            const listName = (row.groupName || row.GroupName || row.listName || row.ListName || row.group || row.Group || row.list || row.List || "").trim();
            const duplicate = nextPeople.find((p) => p.name.toLowerCase() === name.toLowerCase() && (p.associatedName || "").toLowerCase() === associatedName.toLowerCase());
            const personId = duplicate?.id || uid();
            if (!duplicate) nextPeople.push({ id: personId, name, associatedName, howMet, note, phone, archived: false });
            if (listName) {
              let list = nextLists.find((l) => l.name.toLowerCase() === listName.toLowerCase());
              if (!list) { list = { id: uid(), name: listName }; nextLists.push(list); }
              const existingMembership = nextMemberships.find((m) => m.personId === personId && m.listId === list.id);
              if (!existingMembership) nextMemberships.push({ id: uid(), personId, listId: list.id, giftedThisCycle: false, isNewToList: true });
            }
          }
          return { ...d, people: nextPeople, lists: nextLists, memberships: nextMemberships };
        });
        setTab("people");
      } catch { alert("That CSV file could not be imported."); }
    };
    reader.readAsText(file);
  }

  const allPeopleRows = useMemo(() => data.people.filter((p) => !p.archived).filter((p) => {
    const q = search.trim().toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || p.associatedName.toLowerCase().includes(q);
  }).map((person) => ({ person, neverGifted: !lastGiftAnywhere(person.id), lastAnywhere: lastGiftAnywhere(person.id), totalGifts: data.gifts.filter((g) => g.personId === person.id).length }))
  .sort((a, b) => {
    if (a.neverGifted !== b.neverGifted) return a.neverGifted ? -1 : 1;
    const ad = a.lastAnywhere?.date || "9999-12-31", bd = b.lastAnywhere?.date || "9999-12-31";
    if (ad !== bd) return ad.localeCompare(bd);
    return a.person.name.localeCompare(b.person.name);
  }), [data.people, data.gifts, search]);

  const activeListRows = useMemo(() => {
    if (!activeListId) return [];
    return data.memberships.filter((m) => m.listId === activeListId).map((m) => {
      const person = personById(m.personId); if (!person || person.archived) return null;
      return { person, checked: m.giftedThisCycle, isNewToList: m.isNewToList, neverGifted: !lastGiftAnywhere(person.id), lastAnywhere: lastGiftAnywhere(person.id), lastOnList: lastGiftOnList(person.id, activeListId) };
    }).filter(Boolean).filter((row) => {
      const q = search.trim().toLowerCase();
      return !q || row.person.name.toLowerCase().includes(q) || row.person.associatedName.toLowerCase().includes(q);
    }).sort((a, b) => {
      if (a.checked !== b.checked) return a.checked ? 1 : -1;
      const aNeverOnList = !a.lastOnList, bNeverOnList = !b.lastOnList;
      if (aNeverOnList !== bNeverOnList) return aNeverOnList ? -1 : 1;
      const ad = a.lastOnList?.date || "9999-12-31", bd = b.lastOnList?.date || "9999-12-31";
      if (ad !== bd) return ad.localeCompare(bd);
      return a.person.name.localeCompare(b.person.name);
    });
  }, [activeListId, data.memberships, data.people, data.gifts, search]);

  const neverGiftedCount = allPeopleRows.filter((r) => r.neverGifted).length;
  const giftsThisWeek = data.gifts.length;
  const selectedPerson = personModalId ? personById(personModalId) : null;
  const selectedPersonGifts = selectedPerson ? giftsForPerson(selectedPerson.id) : [];

  return (
    <div className="min-h-screen bg-stone-100 text-gray-900">
      <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 pb-28 space-y-4">
        <div className="rounded-[28px] bg-white border shadow-sm p-4 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-2"><div className="text-2xl font-bold">{settings.title || "Giving Tracker"}</div><span className="text-xs text-gray-400">{APP_VERSION}</span></div>
            <div className="text-sm text-gray-500">Mobile-first web app prototype with local saving in your browser. After recording a gift, use Edit Date in the banner if it was given in the past.</div>
          </div>
          <Badge tone="orange">{currentBread?.name || `No ${itemSingular} selected`}</Badge>
        </div>

        {tab === "home" && <div className="space-y-4">
          <SectionCard title="Overview">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-stone-50 border p-4"><div className="text-sm text-gray-500">Never gifted</div><div className="text-2xl font-bold">{neverGiftedCount}</div></div>
              <div className="rounded-2xl bg-stone-50 border p-4"><div className="text-sm text-gray-500">Gift records</div><div className="text-2xl font-bold">{giftsThisWeek}</div></div>
            </div>
          </SectionCard>

          <SectionCard title="Quick Access">
            <div className="grid sm:grid-cols-2 gap-3">
              <AppButton className="justify-start text-left" onClick={() => setTab("people")}>All People</AppButton>
              <AppButton className="justify-start text-left" onClick={() => setTab("lists")} variant="secondary">Groups</AppButton>
              <AppButton className="justify-start text-left" onClick={() => setTab("bread")} variant="secondary">Gift Types</AppButton>
              {!!quickAccessList && <AppButton className="justify-start text-left" onClick={() => { setActiveListId(quickAccessList.id); setLastOpenedListId(quickAccessList.id); setSearch(""); setTab("listDetail"); }} variant="secondary">Continue {quickAccessList.name}</AppButton>}
            </div>
          </SectionCard>

          <SectionCard title="Data Management">
            <div className="grid sm:grid-cols-2 gap-3">
              <AppButton onClick={exportBackup} variant="secondary">Export Backup</AppButton>
              <AppButton onClick={() => backupInputRef.current?.click()} variant="secondary">Import Backup</AppButton>
              <AppButton onClick={exportGiftHistoryCsv} variant="secondary">Export Gift History CSV</AppButton>
              <AppButton onClick={() => peopleCsvInputRef.current?.click()} variant="secondary">Import People CSV</AppButton>
            </div>
            <div className="text-sm text-gray-500">CSV import accepts headers such as: name, associatedName, howMet, note, phone, groupName.</div>
            <input ref={backupInputRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => { importBackupFile(e.target.files?.[0]); e.target.value = ""; }} />
            <input ref={peopleCsvInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => { importPeopleCsvFile(e.target.files?.[0]); e.target.value = ""; }} />
          </SectionCard>
        </div>}

        {tab === "people" && <div className="space-y-4">
          <SectionCard title="All People" action={<AppButton onClick={() => setAddPersonContext({ listId: null })}><Plus className="w-4 h-4 inline mr-1" />Add Person</AppButton>}>
            <div className="rounded-2xl border bg-stone-50 px-3 py-2 flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search everyone" className="bg-transparent outline-none w-full" />
            </div>
            <div className="space-y-3">
              {allPeopleRows.map((row) => (
                <div key={row.person.id} className="flex gap-2 items-stretch">
                  <div className="flex-1">
                    <PersonRow row={row} mode="all" itemSingular={itemSingular} itemPlural={itemPlural} onGift={() => recordGift(row.person.id, null)} onOpen={() => setPersonModalId(row.person.id)} onToggleGiftDateEdit={() => { const latest = giftsForPerson(row.person.id)[0]; if (latest) setEditGiftRow(latest); }} />
                  </div>
                  <AppButton onClick={() => recordGift(row.person.id, null)} className="self-center whitespace-nowrap">Give</AppButton>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>}

        {tab === "lists" && <ListsScreen data={data} setActiveListId={setActiveListId} setLastOpenedListId={setLastOpenedListId} setSearch={setSearch} setTab={setTab} addList={addList} onRename={(listId) => setRenameGroupId(listId)} />}

        {tab === "listDetail" && activeList && <div className="space-y-4">
          <SectionCard title={activeList.name} action={<div className="flex items-center gap-2"><AppButton variant="secondary" onClick={() => setTab("lists")}>Back to Groups</AppButton><AppButton variant="secondary" onClick={() => setRenameGroupId(activeList.id)}>Rename Group</AppButton><Badge tone="orange">{currentBread?.name || itemSingular}</Badge></div>}>
            <div className="rounded-2xl border bg-stone-50 px-3 py-2 flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or associated person" className="bg-transparent outline-none w-full" />
            </div>
            <div className="flex flex-wrap gap-2">
              <AppButton onClick={() => setAddPersonContext({ listId: activeList.id })}><UserPlus className="w-4 h-4 inline mr-1" />Add Person</AppButton>
              <AppButton onClick={() => setShowAddExisting(true)} variant="secondary">Add Existing</AppButton>
              <AppButton onClick={() => resetListCycle(activeList.id)} variant="secondary"><RotateCcw className="w-4 h-4 inline mr-1" />Reset Group Cycle</AppButton>
            </div>
          </SectionCard>

          <SectionCard title="Not Yet Gifted This Cycle">
            <div className="space-y-3">
              {activeListRows.filter((r) => !r.checked).map((row) => (
                <PersonRow key={row.person.id} row={row} mode="list" itemSingular={itemSingular} itemPlural={itemPlural} onGift={() => recordGift(row.person.id, activeList.id)} onOpen={() => setPersonModalId(row.person.id)} onToggleGiftDateEdit={() => {}} />
              ))}
              {!activeListRows.filter((r) => !r.checked).length && <div className="text-sm text-gray-500">Everyone in this group has been gifted in the current cycle.</div>}
            </div>
          </SectionCard>

          <SectionCard title="Already Gifted This Cycle">
            <div className="space-y-3">
              {activeListRows.filter((r) => r.checked).map((row) => (
                <PersonRow key={row.person.id} row={row} mode="list" itemSingular={itemSingular} itemPlural={itemPlural} onGift={() => {}} onOpen={() => setPersonModalId(row.person.id)} onToggleGiftDateEdit={() => setEditGiftRow(row.lastOnList)} />
              ))}
              {!activeListRows.filter((r) => r.checked).length && <div className="text-sm text-gray-500">No one checked off yet.</div>}
            </div>
          </SectionCard>
        </div>}

        {tab === "bread" && <BreadManagerScreen breadTypes={data.breadTypes} setCurrentBread={setCurrentBread} requestDeleteBreadType={setDeleteBreadId} openAdd={() => setShowBreadManager(true)} />}
        {tab === "setup" && (
          <SetupScreen
            settings={settings}
            onSave={updateAppSettings}
            savedPulse={setupSavedPulse}
          />
        )}
      </div>

      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur border-t z-40">
        <div className="max-w-5xl mx-auto grid grid-cols-5 px-2 py-2">
          {[["home", Home, "Home"], ["people", Users, "People"], ["lists", ListChecks, "Groups"], ["bread", Bread, "Gift Types"], ["setup", SettingsIcon, "Setup"]].map(([key, IconCmp, label]) => (
            <button key={key} onClick={() => { setTab(key); setSearch(""); }} className={`rounded-2xl py-2 flex flex-col items-center gap-1 text-xs ${tab === key ? "bg-stone-100 font-semibold" : "text-gray-500"}`}>
              <IconCmp className="w-5 h-5" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {undoGift && <div className="fixed left-3 right-3 bottom-24 z-50">
        <div className="max-w-3xl mx-auto rounded-3xl bg-white shadow-xl border p-4 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="font-semibold truncate">{itemSingular.charAt(0).toUpperCase() + itemSingular.slice(1)} recorded for {personById(undoGift.personId)?.name}</div>
            <div className="text-sm text-gray-500">{undoGift.breadTypeName} · {formatDate(undoGift.date)}</div>
          </div>
          <div className="flex gap-2">
            <AppButton onClick={() => setEditGiftRow(undoGift)} variant="secondary">Edit Date</AppButton>
            <AppButton onClick={undoLastGift} variant="secondary">Undo</AppButton>
          </div>
        </div>
      </div>}

      {addPersonContext && <AddPersonModal list={data.lists.find((l) => l.id === addPersonContext.listId) || null} onClose={() => setAddPersonContext(null)} onSave={(form) => { addPerson(form, addPersonContext.listId); setAddPersonContext(null); }} />}
      {showAddExisting && activeList && <AddExistingModal list={activeList} people={data.people} memberships={data.memberships} onClose={() => setShowAddExisting(false)} onAdd={(personId) => { addExistingPersonToList(personId, activeList.id); setShowAddExisting(false); }} />}
      {selectedPerson && <PersonDetailModal person={selectedPerson} gifts={selectedPersonGifts} lists={data.lists} enableFeedback={settings.enableFeedback} enableRatings={settings.enableRatings} onClose={() => setPersonModalId(null)} onEditPerson={() => setEditPersonId(selectedPerson.id)} onEditGiftFeedback={(giftId) => setEditFeedbackGiftId(giftId)} onSaveFeedback={(feedback, rating) => updateLatestGiftFeedback(selectedPerson.id, feedback, rating)} />}
      {showBreadManager && <AddBreadModal onClose={() => setShowBreadManager(false)} onSave={(name) => { addBreadType(name); setShowBreadManager(false); }} />}
      {editGiftRow && <EditGiftDateModal gift={editGiftRow} onClose={() => setEditGiftRow(null)} onSave={(date) => { updateGiftDate(editGiftRow.id, date); setEditGiftRow(null); }} />}
      {deleteBreadId && <ConfirmDeleteBreadModal bread={data.breadTypes.find((b) => b.id === deleteBreadId)} onClose={() => setDeleteBreadId(null)} onConfirm={confirmDeleteBreadType} />}
      {editPersonId && <EditPersonModal person={personById(editPersonId)} onClose={() => setEditPersonId(null)} onSave={(updates) => { updatePerson(editPersonId, updates); setEditPersonId(null); }} />}
      {editFeedbackGiftId && <EditGiftFeedbackModal gift={data.gifts.find((g) => g.id === editFeedbackGiftId)} enableFeedback={settings.enableFeedback} enableRatings={settings.enableRatings} onClose={() => setEditFeedbackGiftId(null)} onSave={(feedback, rating) => { updateGiftFeedback(editFeedbackGiftId, feedback, rating); setEditFeedbackGiftId(null); }} />}
      {renameGroupId && <RenameGroupModal group={data.lists.find((list) => list.id === renameGroupId)} onClose={() => setRenameGroupId(null)} onSave={(name) => { renameList(renameGroupId, name); setRenameGroupId(null); }} />}
    </div>
  );
}

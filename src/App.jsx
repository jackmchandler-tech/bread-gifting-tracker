import React, { useEffect, useMemo, useRef, useState } from "react";

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
const Gift = ({ className = "w-5 h-5" }) => <Icon className={className}>🎁</Icon>;
const Users = ({ className = "w-5 h-5" }) => <Icon className={className}>👥</Icon>;
const GroupIcon = ({ className = "w-5 h-5" }) => <Icon className={className}>☰</Icon>;
const Home = ({ className = "w-5 h-5" }) => <Icon className={className}>⌂</Icon>;
const SettingsIcon = ({ className = "w-5 h-5" }) => <Icon className={className}>⚙</Icon>;
const Star = ({ className = "w-5 h-5", filled = false }) => <Icon className={className}>{filled ? "★" : "☆"}</Icon>;
const Phone = ({ className = "w-5 h-5" }) => <Icon className={className}>☎</Icon>;
const CheckSquare = ({ className = "w-5 h-5" }) => <Icon className={className}>☑</Icon>;
const Square = ({ className = "w-5 h-5" }) => <Icon className={className}>☐</Icon>;
const UserPlus = ({ className = "w-5 h-5" }) => <Icon className={className}>🧑+</Icon>;
const Trash2 = ({ className = "w-5 h-5" }) => <Icon className={className}>🗑</Icon>;
const X = ({ className = "w-5 h-5" }) => <Icon className={className}>✕</Icon>;
const Pencil = ({ className = "w-5 h-5" }) => <Icon className={className}>✎</Icon>;

const STORAGE_KEY = "bread-gifting-tracker-v1";
const SETTINGS_KEY = "bread-gifting-tracker-settings-v1";
const APP_VERSION = "v1.2";

function defaultSettings() {
  return {
    appTitle: "Giving Tracker",
    itemLabelSingular: "gift",
    itemLabelPlural: "gifts",
    enableRatings: true,
    enableFeedback: true,
  };
}

function downloadTextFile(filename, content, mimeType = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function parseCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (!lines.length) return [];
  const headers = parseCsvLine(lines[0]).map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return headers.reduce((obj, header, index) => {
      obj[header] = values[index] || "";
      return obj;
    }, {});
  });
}

function toCsvValue(value) {
  const str = value == null ? "" : String(value);
  return /[",]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function buildCsv(rows, headers) {
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((header) => toCsvValue(row[header] || "")).join(","));
  }
  return lines.join("\n");
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function todayInputValue() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatDate(value) {
  if (!value) return "Never";
  const d = new Date(value + "T12:00:00");
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function titleCase(text) {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

function defaultData() {
  const fishGroup = "group_fish";
  const neighborsGroup = "group_neighbors";
  const p1 = "p_joe";
  const p2 = "p_mary";
  const p3 = "p_ed";
  const p4 = "p_tom";
  const p5 = "p_nancy";
  const p6 = "p_helen";

  return {
    giftTypes: [
      { id: "g1", name: "Bread", isCurrent: true },
      { id: "g2", name: "Card", isCurrent: false },
      { id: "g3", name: "Money", isCurrent: false },
      { id: "g4", name: "Gift", isCurrent: false },
    ],
    people: [
      { id: p1, name: "Joe Smith", associatedName: "Linda Smith", howMet: "Fish dinners", note: "New kitchen volunteer", phone: "716-555-0123", archived: false },
      { id: p2, name: "Mary Collins", associatedName: "", howMet: "Fish dinners", note: "Fish fry prep", phone: "", archived: false },
      { id: p3, name: "Ed Nowak", associatedName: "", howMet: "Fish dinners", note: "Dish room", phone: "", archived: false },
      { id: p4, name: "Tom Sweeney", associatedName: "", howMet: "Fish dinners", note: "Cashier", phone: "", archived: false },
      { id: p5, name: "Nancy Weber", associatedName: "", howMet: "Neighbor", note: "Kitchen helper", phone: "", archived: false },
      { id: p6, name: "Helen Parker", associatedName: "Bob Parker", howMet: "Neighbor", note: "", phone: "", archived: false },
    ],
    groups: [
      { id: fishGroup, name: "Fish Dinner", archived: false },
      { id: neighborsGroup, name: "Neighbors", archived: false },
    ],
    memberships: [
      { id: uid(), personId: p1, groupId: fishGroup, giftedThisCycle: false, isNewToGroup: true },
      { id: uid(), personId: p2, groupId: fishGroup, giftedThisCycle: false, isNewToGroup: false },
      { id: uid(), personId: p3, groupId: fishGroup, giftedThisCycle: false, isNewToGroup: false },
      { id: uid(), personId: p4, groupId: fishGroup, giftedThisCycle: true, isNewToGroup: false },
      { id: uid(), personId: p5, groupId: fishGroup, giftedThisCycle: true, isNewToGroup: false },
      { id: uid(), personId: p5, groupId: neighborsGroup, giftedThisCycle: false, isNewToGroup: false },
      { id: uid(), personId: p6, groupId: neighborsGroup, giftedThisCycle: false, isNewToGroup: true },
    ],
    gifts: [
      { id: uid(), personId: p1, groupId: neighborsGroup, giftTypeName: "Bread", date: "2026-03-01", feedback: "", rating: null },
      { id: uid(), personId: p2, groupId: fishGroup, giftTypeName: "Card", date: "2026-02-02", feedback: "", rating: null },
      { id: uid(), personId: p3, groupId: fishGroup, giftTypeName: "Bread", date: "2026-01-10", feedback: "", rating: null },
      { id: uid(), personId: p4, groupId: fishGroup, giftTypeName: "Bread", date: "2026-03-08", feedback: "", rating: null },
      { id: uid(), personId: p5, groupId: neighborsGroup, giftTypeName: "Gift", date: "2025-09-20", feedback: "", rating: 4 },
    ],
  };
}

function migrateData(parsed) {
  if (!parsed) return defaultData();
  if (parsed.groups && parsed.giftTypes) return parsed;
  return {
    people: parsed.people || [],
    gifts: (parsed.gifts || []).map((gift) => ({
      ...gift,
      groupId: gift.groupId ?? gift.listId ?? null,
      giftTypeName: gift.giftTypeName ?? gift.breadTypeName ?? "Gift",
    })),
    groups: (parsed.groups || parsed.lists || []).map((group) => ({
      ...group,
      archived: group.archived ?? false,
    })),
    giftTypes: (parsed.giftTypes || parsed.breadTypes || []).map((giftType) => ({
      id: giftType.id,
      name: giftType.name,
      isCurrent: !!giftType.isCurrent,
    })),
    memberships: (parsed.memberships || []).map((membership) => ({
      ...membership,
      groupId: membership.groupId ?? membership.listId,
      isNewToGroup: membership.isNewToGroup ?? membership.isNewToList ?? false,
    })),
  };
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? migrateData(JSON.parse(raw)) : defaultData();
  } catch {
    return defaultData();
  }
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...defaultSettings(), ...JSON.parse(raw) } : defaultSettings();
  } catch {
    return defaultSettings();
  }
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

function PersonRow({ row, mode, itemLabelPlural, onGift, onOpen, onToggleGiftDateEdit }) {
  return (
    <div className="rounded-2xl border p-3 bg-white">
      <div className="flex items-start gap-3">
        {mode === "group" && (
          <button onClick={onGift} className="mt-0.5">
            {row.checked ? <CheckSquare className="w-6 h-6" /> : <Square className="w-6 h-6 text-gray-400" />}
          </button>
        )}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <div className="font-medium leading-tight flex items-center gap-2 flex-wrap">
              <span>{row.person.name}</span>
              {mode === "all" && <Badge tone="gray">{(row.totalGifts || 0) === 1 ? `1 ${itemLabelPlural.slice(0, -1) || "gift"}` : `${row.totalGifts || 0} ${itemLabelPlural}`}</Badge>}
            </div>
            <div className="flex gap-1 flex-wrap justify-end">
              {row.isNewToGroup && mode === "group" && <Badge tone="blue">NEW TO GROUP</Badge>}
              {row.neverGifted && mode === "all" && <Badge tone="yellow">NEVER GIVEN</Badge>}
            </div>
          </div>
          {!!row.person.associatedName && <div className="text-sm text-gray-600">Assoc: {row.person.associatedName}</div>}
          {!row.person.associatedName && !!row.person.note && <div className="text-sm text-gray-600">{row.person.note}</div>}
          {mode === "group" ? (
            row.checked ? (
              <button onClick={onToggleGiftDateEdit} className="text-xs text-gray-500 hover:text-gray-800 text-left">
                Given {formatDate(row.lastOnGroup?.date)} · {row.lastOnGroup?.giftTypeName}
              </button>
            ) : (
              <div className="text-xs text-gray-500">Last anywhere: {formatDate(row.lastAnywhere?.date)}</div>
            )
          ) : (
            <button onClick={onToggleGiftDateEdit} className="text-xs text-gray-500 hover:text-gray-800 text-left">
              {row.lastAnywhere ? `Last anywhere: ${formatDate(row.lastAnywhere.date)} · ${row.lastAnywhere.giftTypeName}` : "Never received anything"}
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

export default function GivingTrackerApp() {
  const [data, setData] = useState(defaultData);
  const [settings, setSettings] = useState(defaultSettings);
  const [tab, setTab] = useState("home");
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [search, setSearch] = useState("");
  const [undoGift, setUndoGift] = useState(null);
  const [personModalId, setPersonModalId] = useState(null);
  const [addPersonContext, setAddPersonContext] = useState(null);
  const [showAddExisting, setShowAddExisting] = useState(false);
  const [showGiftTypeManager, setShowGiftTypeManager] = useState(false);
  const [editGiftRow, setEditGiftRow] = useState(null);
  const [deleteGiftTypeId, setDeleteGiftTypeId] = useState(null);
  const [lastOpenedGroupId, setLastOpenedGroupId] = useState(null);
  const [editPersonId, setEditPersonId] = useState(null);
  const [editFeedbackGiftId, setEditFeedbackGiftId] = useState(null);
  const [editGroupId, setEditGroupId] = useState(null);
  const backupInputRef = useRef(null);
  const peopleCsvInputRef = useRef(null);

  useEffect(() => {
    setData(loadData());
    setSettings(loadSettings());
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (!undoGift) return;
    const t = setTimeout(() => setUndoGift(null), 5000);
    return () => clearTimeout(t);
  }, [undoGift]);

  const currentGiftType = useMemo(() => data.giftTypes.find((g) => g.isCurrent) || data.giftTypes[0], [data.giftTypes]);
  const activeGroup = useMemo(() => data.groups.find((g) => g.id === activeGroupId) || null, [data.groups, activeGroupId]);
  const quickAccessGroup = useMemo(() => data.groups.find((g) => g.id === (lastOpenedGroupId || activeGroupId)) || data.groups[0] || null, [data.groups, lastOpenedGroupId, activeGroupId]);

  function personById(id) {
    return data.people.find((p) => p.id === id);
  }

  function giftsForPerson(id) {
    return data.gifts.filter((g) => g.personId === id).sort((a, b) => b.date.localeCompare(a.date));
  }

  function lastGiftAnywhere(personId) {
    return giftsForPerson(personId)[0] || null;
  }

  function lastGiftOnGroup(personId, groupId) {
    return data.gifts.filter((g) => g.personId === personId && g.groupId === groupId).sort((a, b) => b.date.localeCompare(a.date))[0] || null;
  }

  function setCurrentGiftType(id) {
    setData((d) => ({ ...d, giftTypes: d.giftTypes.map((g) => ({ ...g, isCurrent: g.id === id })) }));
  }

  function addGiftType(name) {
    const trimmed = name.trim();
    if (!trimmed) return;
    setData((d) => ({
      ...d,
      giftTypes: [...d.giftTypes, { id: uid(), name: trimmed, isCurrent: d.giftTypes.length === 0 }],
    }));
  }

  function removeGiftType(id) {
    setData((d) => {
      const removed = d.giftTypes.find((g) => g.id === id);
      const next = d.giftTypes.filter((g) => g.id !== id);
      if (removed?.isCurrent && next[0]) next[0].isCurrent = true;
      return { ...d, giftTypes: next };
    });
  }

  function addGroup(name) {
    const trimmed = name.trim();
    if (!trimmed) return;
    setData((d) => ({ ...d, groups: [...d.groups, { id: uid(), name: trimmed, archived: false }] }));
  }

  function updateGroup(groupId, updates) {
    setData((d) => ({ ...d, groups: d.groups.map((g) => (g.id === groupId ? { ...g, ...updates } : g)) }));
  }

  function addPerson(form, groupId = null) {
    const trimmed = form.name.trim();
    if (!trimmed) return;
    const personId = uid();
    setData((d) => ({
      ...d,
      people: [
        ...d.people,
        {
          id: personId,
          name: trimmed,
          associatedName: form.associatedName.trim(),
          howMet: form.howMet.trim(),
          note: form.note.trim(),
          phone: form.phone.trim(),
          archived: false,
        },
      ],
      memberships: groupId
        ? [...d.memberships, { id: uid(), personId, groupId, giftedThisCycle: false, isNewToGroup: true }]
        : d.memberships,
    }));
  }

  function addExistingPersonToGroup(personId, groupId) {
    setData((d) => {
      if (d.memberships.some((m) => m.personId === personId && m.groupId === groupId)) return d;
      return { ...d, memberships: [...d.memberships, { id: uid(), personId, groupId, giftedThisCycle: false, isNewToGroup: true }] };
    });
  }

  function recordGift(personId, groupId = null, overrideDate = null) {
    const gift = {
      id: uid(),
      personId,
      groupId,
      giftTypeName: currentGiftType?.name || titleCase(settings.itemLabelSingular),
      date: overrideDate || todayInputValue(),
      feedback: "",
      rating: null,
    };

    setData((d) => ({
      ...d,
      gifts: [...d.gifts, gift],
      memberships: d.memberships.map((m) =>
        m.personId === personId && m.groupId === groupId ? { ...m, giftedThisCycle: true, isNewToGroup: false } : m
      ),
    }));
    setUndoGift(gift);
  }

  function undoLastGift() {
    if (!undoGift) return;
    const priorGiftOnGroup = undoGift.groupId
      ? data.gifts.filter((g) => g.id !== undoGift.id && g.personId === undoGift.personId && g.groupId === undoGift.groupId).sort((a, b) => b.date.localeCompare(a.date))[0]
      : null;

    setData((d) => ({
      ...d,
      gifts: d.gifts.filter((g) => g.id !== undoGift.id),
      memberships: d.memberships.map((m) => {
        if (m.personId === undoGift.personId && m.groupId === undoGift.groupId) {
          return { ...m, giftedThisCycle: !!priorGiftOnGroup, isNewToGroup: priorGiftOnGroup ? false : m.isNewToGroup };
        }
        return m;
      }),
    }));
    setUndoGift(null);
  }

  function resetGroupCycle(groupId) {
    setData((d) => ({ ...d, memberships: d.memberships.map((m) => (m.groupId === groupId ? { ...m, giftedThisCycle: false } : m)) }));
  }

  function updateLatestGiftFeedback(personId, feedback, rating) {
    const latest = giftsForPerson(personId)[0];
    if (!latest) return;
    setData((d) => ({ ...d, gifts: d.gifts.map((g) => (g.id === latest.id ? { ...g, feedback, rating: rating || null } : g)) }));
  }

  function updateGiftFeedback(giftId, feedback, rating) {
    setData((d) => ({ ...d, gifts: d.gifts.map((g) => (g.id === giftId ? { ...g, feedback, rating: rating || null } : g)) }));
  }

  function updatePerson(personId, updates) {
    setData((d) => ({ ...d, people: d.people.map((p) => (p.id === personId ? { ...p, ...updates } : p)) }));
  }

  function archivePerson(personId) {
    setData((d) => ({ ...d, people: d.people.map((p) => (p.id === personId ? { ...p, archived: true } : p)) }));
  }

  function updateGiftDate(giftId, date) {
    setData((d) => ({ ...d, gifts: d.gifts.map((g) => (g.id === giftId ? { ...g, date } : g)) }));
    setUndoGift((g) => (g && g.id === giftId ? { ...g, date } : g));
  }

  function confirmDeleteGiftType() {
    if (!deleteGiftTypeId) return;
    removeGiftType(deleteGiftTypeId);
    setDeleteGiftTypeId(null);
  }

  function exportBackup() {
    downloadTextFile(`giving-tracker-backup-${todayInputValue()}.json`, JSON.stringify({ data, settings }, null, 2), "application/json;charset=utf-8");
  }

  function exportGiftHistoryCsv() {
    const rows = data.gifts.slice().sort((a, b) => b.date.localeCompare(a.date)).map((gift) => ({
      date: gift.date,
      personName: personById(gift.personId)?.name || "",
      associatedName: personById(gift.personId)?.associatedName || "",
      giftType: gift.giftTypeName,
      groupName: data.groups.find((g) => g.id === gift.groupId)?.name || "All People",
      rating: gift.rating || "",
      feedback: gift.feedback || "",
    }));
    downloadTextFile(`giving-history-${todayInputValue()}.csv`, buildCsv(rows, ["date", "personName", "associatedName", "giftType", "groupName", "rating", "feedback"]), "text/csv;charset=utf-8");
  }

  function importBackupFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || "{}"));
        const nextData = parsed.data ? migrateData(parsed.data) : migrateData(parsed);
        const nextSettings = parsed.settings ? { ...defaultSettings(), ...parsed.settings } : defaultSettings();
        setData(nextData);
        setSettings(nextSettings);
        setTab("home");
        setActiveGroupId(null);
        setSearch("");
      } catch {
        alert("That backup file could not be read.");
      }
    };
    reader.readAsText(file);
  }

  function importPeopleCsvFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const rows = parseCsv(String(reader.result || ""));
        if (!rows.length) {
          alert("The CSV did not contain any rows.");
          return;
        }
        setData((d) => {
          const nextPeople = [...d.people];
          const nextGroups = [...d.groups];
          const nextMemberships = [...d.memberships];

          for (const row of rows) {
            const name = (row.name || row.Name || "").trim();
            if (!name) continue;
            const associatedName = (row.associatedName || row.AssociatedName || row.associated || row.Associated || "").trim();
            const howMet = (row.howMet || row.HowMet || row.met || "").trim();
            const note = (row.note || row.Note || row.position || row.Position || "").trim();
            const phone = (row.phone || row.Phone || row.phoneNumber || row.PhoneNumber || "").trim();
            const groupName = (row.groupName || row.GroupName || row.listName || row.ListName || row.group || row.list || "").trim();

            const duplicate = nextPeople.find((p) => p.name.toLowerCase() === name.toLowerCase() && (p.associatedName || "").toLowerCase() === associatedName.toLowerCase());
            const personId = duplicate?.id || uid();
            if (!duplicate) nextPeople.push({ id: personId, name, associatedName, howMet, note, phone, archived: false });

            if (groupName) {
              let group = nextGroups.find((g) => g.name.toLowerCase() === groupName.toLowerCase());
              if (!group) {
                group = { id: uid(), name: groupName, archived: false };
                nextGroups.push(group);
              }
              const existing = nextMemberships.find((m) => m.personId === personId && m.groupId === group.id);
              if (!existing) nextMemberships.push({ id: uid(), personId, groupId: group.id, giftedThisCycle: false, isNewToGroup: true });
            }
          }
          return { ...d, people: nextPeople, groups: nextGroups, memberships: nextMemberships };
        });
        setTab("people");
      } catch {
        alert("That CSV file could not be imported.");
      }
    };
    reader.readAsText(file);
  }

  const allPeopleRows = useMemo(() => {
    return data.people
      .filter((p) => !p.archived)
      .filter((p) => {
        const q = search.trim().toLowerCase();
        return !q || p.name.toLowerCase().includes(q) || p.associatedName.toLowerCase().includes(q);
      })
      .map((person) => ({
        person,
        neverGifted: !lastGiftAnywhere(person.id),
        lastAnywhere: lastGiftAnywhere(person.id),
        totalGifts: data.gifts.filter((g) => g.personId === person.id).length,
      }))
      .sort((a, b) => {
        if (a.neverGifted !== b.neverGifted) return a.neverGifted ? -1 : 1;
        const ad = a.lastAnywhere?.date || "9999-12-31";
        const bd = b.lastAnywhere?.date || "9999-12-31";
        if (ad !== bd) return ad.localeCompare(bd);
        return a.person.name.localeCompare(b.person.name);
      });
  }, [data.people, data.gifts, search]);

  const activeGroupRows = useMemo(() => {
    if (!activeGroupId) return [];
    return data.memberships
      .filter((m) => m.groupId === activeGroupId)
      .map((m) => {
        const person = personById(m.personId);
        if (!person || person.archived) return null;
        return {
          person,
          checked: m.giftedThisCycle,
          isNewToGroup: m.isNewToGroup,
          neverGifted: !lastGiftAnywhere(person.id),
          lastAnywhere: lastGiftAnywhere(person.id),
          lastOnGroup: lastGiftOnGroup(person.id, activeGroupId),
        };
      })
      .filter(Boolean)
      .filter((row) => {
        const q = search.trim().toLowerCase();
        return !q || row.person.name.toLowerCase().includes(q) || row.person.associatedName.toLowerCase().includes(q);
      })
      .sort((a, b) => {
        if (a.checked !== b.checked) return a.checked ? 1 : -1;
        const aNeverOnGroup = !a.lastOnGroup;
        const bNeverOnGroup = !b.lastOnGroup;
        if (aNeverOnGroup !== bNeverOnGroup) return aNeverOnGroup ? -1 : 1;
        const ad = a.lastOnGroup?.date || "9999-12-31";
        const bd = b.lastOnGroup?.date || "9999-12-31";
        if (ad !== bd) return ad.localeCompare(bd);
        return a.person.name.localeCompare(b.person.name);
      });
  }, [activeGroupId, data.memberships, data.people, data.gifts, search]);

  const neverGiftedCount = allPeopleRows.filter((r) => r.neverGifted).length;
  const totalGivenCount = data.gifts.length;
  const selectedPerson = personModalId ? personById(personModalId) : null;
  const selectedPersonGifts = selectedPerson ? giftsForPerson(selectedPerson.id) : [];
  const activeGroupRemaining = activeGroupRows.filter((r) => !r.checked).length;

  return (
    <div className="min-h-screen bg-stone-100 text-gray-900">
      <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 pb-28 space-y-4">
        <div className="rounded-[28px] bg-white border shadow-sm p-4 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold">{settings.appTitle}</div>
              <span className="text-xs text-gray-400">{APP_VERSION}</span>
            </div>
            <div className="text-sm text-gray-500">Track who has received each {settings.itemLabelSingular}, by person and by group.</div>
          </div>
          <Badge tone="orange">{currentGiftType?.name || titleCase(settings.itemLabelSingular)}</Badge>
        </div>

        {tab === "home" && (
          <div className="space-y-4">
            <SectionCard title="Overview">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-stone-50 border p-4">
                  <div className="text-sm text-gray-500">Never given</div>
                  <div className="text-2xl font-bold">{neverGiftedCount}</div>
                </div>
                <div className="rounded-2xl bg-stone-50 border p-4">
                  <div className="text-sm text-gray-500">Total {settings.itemLabelPlural}</div>
                  <div className="text-2xl font-bold">{totalGivenCount}</div>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Quick Access">
              <div className="grid sm:grid-cols-2 gap-3">
                <AppButton className="justify-start text-left" onClick={() => setTab("people")}>All People</AppButton>
                <AppButton className="justify-start text-left" onClick={() => setTab("groups")} variant="secondary">Groups</AppButton>
                <AppButton className="justify-start text-left" onClick={() => setTab("giftTypes")} variant="secondary">Gift Types</AppButton>
                {!!quickAccessGroup && (
                  <AppButton className="justify-start text-left" onClick={() => { setActiveGroupId(quickAccessGroup.id); setLastOpenedGroupId(quickAccessGroup.id); setSearch(""); setTab("groupDetail"); }} variant="secondary">
                    Continue {quickAccessGroup.name}
                  </AppButton>
                )}
              </div>
            </SectionCard>

            <SectionCard title="Data Management">
              <div className="grid sm:grid-cols-2 gap-3">
                <AppButton onClick={exportBackup} variant="secondary">Export Backup</AppButton>
                <AppButton onClick={() => backupInputRef.current?.click()} variant="secondary">Import Backup</AppButton>
                <AppButton onClick={exportGiftHistoryCsv} variant="secondary">Export History CSV</AppButton>
                <AppButton onClick={() => peopleCsvInputRef.current?.click()} variant="secondary">Import People CSV</AppButton>
              </div>
              <div className="text-sm text-gray-500">CSV import headers can include: name, associatedName, howMet, note, phone, groupName.</div>
              <input ref={backupInputRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => { importBackupFile(e.target.files?.[0]); e.target.value = ""; }} />
              <input ref={peopleCsvInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => { importPeopleCsvFile(e.target.files?.[0]); e.target.value = ""; }} />
            </SectionCard>
          </div>
        )}

        {tab === "people" && (
          <div className="space-y-4">
            <SectionCard title="All People" action={<AppButton onClick={() => setAddPersonContext({ groupId: null })}><Plus className="w-4 h-4 inline mr-1" />Add Person</AppButton>}>
              <div className="rounded-2xl border bg-stone-50 px-3 py-2 flex items-center gap-2">
                <Search className="w-4 h-4 text-gray-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search everyone" className="bg-transparent outline-none w-full" />
              </div>
              <div className="space-y-3">
                {allPeopleRows.map((row) => (
                  <div key={row.person.id} className="flex gap-2 items-stretch">
                    <div className="flex-1">
                      <PersonRow
                        row={row}
                        mode="all"
                        itemLabelPlural={settings.itemLabelPlural}
                        onGift={() => recordGift(row.person.id, null)}
                        onOpen={() => setPersonModalId(row.person.id)}
                        onToggleGiftDateEdit={() => {
                          const latest = giftsForPerson(row.person.id)[0];
                          if (latest) setEditGiftRow(latest);
                        }}
                      />
                    </div>
                    <AppButton onClick={() => recordGift(row.person.id, null)} className="self-center whitespace-nowrap">Give</AppButton>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        )}

        {tab === "groups" && (
          <GroupsScreen data={data} setActiveGroupId={setActiveGroupId} setLastOpenedGroupId={setLastOpenedGroupId} setSearch={setSearch} setTab={setTab} addGroup={addGroup} onEditGroup={(id) => setEditGroupId(id)} />
        )}

        {tab === "groupDetail" && activeGroup && (
          <div className="space-y-4">
            <SectionCard
              title={activeGroup.name}
              action={<div className="flex items-center gap-2"><AppButton variant="secondary" onClick={() => setTab("groups")}>Back to Groups</AppButton><AppButton variant="secondary" onClick={() => setEditGroupId(activeGroup.id)}><Pencil className="w-4 h-4 inline mr-1" />Edit Group</AppButton><Badge tone="orange">{currentGiftType?.name || titleCase(settings.itemLabelSingular)}</Badge></div>}
            >
              <div className="rounded-2xl border bg-stone-50 px-3 py-2 flex items-center gap-2">
                <Search className="w-4 h-4 text-gray-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or associated person" className="bg-transparent outline-none w-full" />
              </div>
              <div className="flex flex-wrap gap-2">
                <AppButton onClick={() => setAddPersonContext({ groupId: activeGroup.id })}><UserPlus className="w-4 h-4 inline mr-1" />Add Person</AppButton>
                <AppButton onClick={() => setShowAddExisting(true)} variant="secondary">Add Existing</AppButton>
                <AppButton onClick={() => resetGroupCycle(activeGroup.id)} variant="secondary"><RotateCcw className="w-4 h-4 inline mr-1" />Reset Group Cycle</AppButton>
              </div>
              <div className="text-sm text-gray-500">Remaining {settings.itemLabelPlural}: {activeGroupRemaining}</div>
            </SectionCard>

            <SectionCard title="Not Yet Given This Cycle">
              <div className="space-y-3">
                {activeGroupRows.filter((r) => !r.checked).map((row) => (
                  <PersonRow key={row.person.id} row={row} mode="group" itemLabelPlural={settings.itemLabelPlural} onGift={() => recordGift(row.person.id, activeGroup.id)} onOpen={() => setPersonModalId(row.person.id)} onToggleGiftDateEdit={() => {}} />
                ))}
                {!activeGroupRows.filter((r) => !r.checked).length && <div className="text-sm text-gray-500">Everyone in this group has been given something in the current cycle.</div>}
              </div>
            </SectionCard>

            <SectionCard title="Already Given This Cycle">
              <div className="space-y-3">
                {activeGroupRows.filter((r) => r.checked).map((row) => (
                  <PersonRow key={row.person.id} row={row} mode="group" itemLabelPlural={settings.itemLabelPlural} onGift={() => {}} onOpen={() => setPersonModalId(row.person.id)} onToggleGiftDateEdit={() => setEditGiftRow(row.lastOnGroup)} />
                ))}
                {!activeGroupRows.filter((r) => r.checked).length && <div className="text-sm text-gray-500">No one checked off yet.</div>}
              </div>
            </SectionCard>
          </div>
        )}

        {tab === "giftTypes" && <GiftTypeManagerScreen giftTypes={data.giftTypes} setCurrentGiftType={setCurrentGiftType} requestDeleteGiftType={setDeleteGiftTypeId} openAdd={() => setShowGiftTypeManager(true)} />}

        {tab === "setup" && <SetupScreen settings={settings} currentGiftType={currentGiftType} giftTypes={data.giftTypes} setSettings={setSettings} setCurrentGiftType={setCurrentGiftType} />}
      </div>

      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur border-t z-40">
        <div className="max-w-5xl mx-auto grid grid-cols-5 px-2 py-2">
          {[
            ["home", Home, "Home"],
            ["people", Users, "People"],
            ["groups", GroupIcon, "Groups"],
            ["giftTypes", Gift, "Gift Types"],
            ["setup", SettingsIcon, "Setup"],
          ].map(([key, IconCmp, label]) => (
            <button key={key} onClick={() => { setTab(key); setSearch(""); }} className={`rounded-2xl py-2 flex flex-col items-center gap-1 text-xs ${tab === key ? "bg-stone-100 font-semibold" : "text-gray-500"}`}>
              <IconCmp className="w-5 h-5" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {undoGift && (
        <div className="fixed left-3 right-3 bottom-24 z-50">
          <div className="max-w-3xl mx-auto rounded-3xl bg-white shadow-xl border p-4 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate">Recorded for {personById(undoGift.personId)?.name}</div>
              <div className="text-sm text-gray-500">{undoGift.giftTypeName} · {formatDate(undoGift.date)}</div>
            </div>
            <div className="flex gap-2">
              <AppButton onClick={() => setEditGiftRow(undoGift)} variant="secondary">Edit Date</AppButton>
              <AppButton onClick={undoLastGift} variant="secondary">Undo</AppButton>
            </div>
          </div>
        </div>
      )}

      {addPersonContext && <AddPersonModal group={data.groups.find((g) => g.id === addPersonContext.groupId) || null} onClose={() => setAddPersonContext(null)} onSave={(form) => { addPerson(form, addPersonContext.groupId); setAddPersonContext(null); }} />}

      {showAddExisting && activeGroup && <AddExistingModal group={activeGroup} people={data.people} memberships={data.memberships} onClose={() => setShowAddExisting(false)} onAdd={(personId) => { addExistingPersonToGroup(personId, activeGroup.id); setShowAddExisting(false); }} />}

      {selectedPerson && <PersonDetailModal person={selectedPerson} gifts={selectedPersonGifts} groups={data.groups} settings={settings} onClose={() => setPersonModalId(null)} onEditPerson={() => setEditPersonId(selectedPerson.id)} onEditGiftFeedback={(giftId) => setEditFeedbackGiftId(giftId)} onSaveFeedback={(feedback, rating) => updateLatestGiftFeedback(selectedPerson.id, feedback, rating)} />}

      {showGiftTypeManager && <AddGiftTypeModal onClose={() => setShowGiftTypeManager(false)} onSave={(name) => { addGiftType(name); setShowGiftTypeManager(false); }} />}

      {editGiftRow && <EditGiftDateModal gift={editGiftRow} onClose={() => setEditGiftRow(null)} onSave={(date) => { updateGiftDate(editGiftRow.id, date); setEditGiftRow(null); }} />}

      {deleteGiftTypeId && <ConfirmDeleteGiftTypeModal giftType={data.giftTypes.find((g) => g.id === deleteGiftTypeId)} onClose={() => setDeleteGiftTypeId(null)} onConfirm={confirmDeleteGiftType} />}

      {editPersonId && <EditPersonModal person={personById(editPersonId)} onClose={() => setEditPersonId(null)} onSave={(updates) => { updatePerson(editPersonId, updates); setEditPersonId(null); }} onDelete={() => { archivePerson(editPersonId); setEditPersonId(null); }} />}

      {editFeedbackGiftId && <EditGiftFeedbackModal gift={data.gifts.find((g) => g.id === editFeedbackGiftId)} settings={settings} onClose={() => setEditFeedbackGiftId(null)} onSave={(feedback, rating) => { updateGiftFeedback(editFeedbackGiftId, feedback, rating); setEditFeedbackGiftId(null); }} />}

      {editGroupId && <EditGroupModal group={data.groups.find((g) => g.id === editGroupId)} onClose={() => setEditGroupId(null)} onSave={(updates) => { updateGroup(editGroupId, updates); setEditGroupId(null); }} />}
    </div>
  );
}

function GroupsScreen({ data, setActiveGroupId, setLastOpenedGroupId, setSearch, setTab, addGroup, onEditGroup }) {
  const [newGroupName, setNewGroupName] = useState("");
  return (
    <div className="space-y-4">
      <SectionCard title="Groups">
        <div className="space-y-3">
          {data.groups.filter((g) => !g.archived).map((group) => {
            const remaining = data.memberships.filter((m) => m.groupId === group.id && !m.giftedThisCycle).length;
            const total = data.memberships.filter((m) => m.groupId === group.id).length;
            return (
              <div key={group.id} className="rounded-2xl border p-4 bg-white flex items-start justify-between gap-3">
                <button onClick={() => { setActiveGroupId(group.id); setLastOpenedGroupId(group.id); setSearch(""); setTab("groupDetail"); }} className="text-left flex-1">
                  <div className="font-medium">{group.name}</div>
                  <div className="text-sm text-gray-500">{total} people • {remaining} left this cycle</div>
                </button>
                <AppButton variant="secondary" onClick={() => onEditGroup(group.id)}><Pencil className="w-4 h-4 inline mr-1" />Edit</AppButton>
              </div>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard title="Create Group">
        <div className="flex gap-2">
          <input value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} placeholder="Group name" className="flex-1 rounded-2xl border px-3 py-2.5 outline-none" />
          <AppButton onClick={() => { addGroup(newGroupName); setNewGroupName(""); }}>Add</AppButton>
        </div>
      </SectionCard>
    </div>
  );
}

function GiftTypeManagerScreen({ giftTypes, setCurrentGiftType, requestDeleteGiftType, openAdd }) {
  return (
    <SectionCard title="Gift Types" action={<AppButton onClick={openAdd}><Plus className="w-4 h-4 inline mr-1" />Add</AppButton>}>
      <div className="space-y-3">
        {giftTypes.map((giftType) => (
          <div key={giftType.id} className="rounded-2xl border p-3 flex items-center justify-between gap-3">
            <button onClick={() => setCurrentGiftType(giftType.id)} className="flex-1 text-left font-medium">{giftType.name}</button>
            {giftType.isCurrent && <Badge tone="orange">CURRENT</Badge>}
            <button onClick={() => requestDeleteGiftType(giftType.id)} className="text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function SetupScreen({ settings, setSettings, giftTypes, currentGiftType, setCurrentGiftType }) {
  const [draft, setDraft] = useState(settings);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  return (
    <div className="space-y-4">
      <SectionCard title="Setup">
        <div className="space-y-3">
          <label className="block text-sm font-medium">App Title</label>
          <input value={draft.appTitle} onChange={(e) => setDraft((s) => ({ ...s, appTitle: e.target.value }))} className="w-full rounded-2xl border px-3 py-3 outline-none" />

          <label className="block text-sm font-medium">Item Label (singular)</label>
          <input value={draft.itemLabelSingular} onChange={(e) => setDraft((s) => ({ ...s, itemLabelSingular: e.target.value }))} className="w-full rounded-2xl border px-3 py-3 outline-none" />

          <label className="block text-sm font-medium">Item Label (plural)</label>
          <input value={draft.itemLabelPlural} onChange={(e) => setDraft((s) => ({ ...s, itemLabelPlural: e.target.value }))} className="w-full rounded-2xl border px-3 py-3 outline-none" />

          <label className="flex items-center justify-between rounded-2xl border px-3 py-3">
            <span className="text-sm font-medium">Enable Ratings</span>
            <input type="checkbox" checked={draft.enableRatings} onChange={(e) => setDraft((s) => ({ ...s, enableRatings: e.target.checked }))} />
          </label>

          <label className="flex items-center justify-between rounded-2xl border px-3 py-3">
            <span className="text-sm font-medium">Enable Feedback</span>
            <input type="checkbox" checked={draft.enableFeedback} onChange={(e) => setDraft((s) => ({ ...s, enableFeedback: e.target.checked }))} />
          </label>

          <div className="rounded-2xl border p-3">
            <div className="text-sm font-medium mb-2">Current Gift Type</div>
            <div className="space-y-2">
              {giftTypes.map((giftType) => (
                <button key={giftType.id} onClick={() => setCurrentGiftType(giftType.id)} className="w-full rounded-2xl border px-3 py-2.5 text-left flex items-center justify-between">
                  <span>{giftType.name}</span>
                  {giftType.id === currentGiftType?.id && <Badge tone="orange">CURRENT</Badge>}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <AppButton onClick={() => setSettings({ ...draft, appTitle: draft.appTitle.trim() || "Giving Tracker", itemLabelSingular: draft.itemLabelSingular.trim() || "gift", itemLabelPlural: draft.itemLabelPlural.trim() || "gifts" })}>Save Setup</AppButton>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

function AddPersonModal({ group, onClose, onSave }) {
  const [form, setForm] = useState({ name: "", associatedName: "", howMet: "", note: "", phone: "" });
  const nameRef = useRef(null);

  useEffect(() => { nameRef.current?.focus(); }, []);

  return (
    <Modal title="Add Person" onClose={onClose}>
      <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); onSave(form); }}>
        {[["name", "Name *"], ["associatedName", "Associated person"], ["howMet", "How you met them"], ["note", "Position / note"], ["phone", "Phone number"]].map(([key, label], index) => (
          <input key={key} ref={index === 0 ? nameRef : undefined} value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} placeholder={label} className="w-full rounded-2xl border px-3 py-3 outline-none" />
        ))}
        <div className="text-sm text-gray-500 rounded-2xl bg-stone-50 border p-3">{group ? `Saving will add this person to the master list and to ${group.name}.` : "Saving will add this person to the master list only."}</div>
        <div className="flex justify-end gap-2 pt-2"><AppButton onClick={onClose} variant="secondary">Cancel</AppButton><AppButton type="submit" disabled={!form.name.trim()}>Save</AppButton></div>
      </form>
    </Modal>
  );
}

function AddExistingModal({ group, people, memberships, onClose, onAdd }) {
  const [search, setSearch] = useState("");
  const alreadyInGroup = new Set(memberships.filter((m) => m.groupId === group.id).map((m) => m.personId));
  const options = people.filter((p) => !p.archived && !alreadyInGroup.has(p.id)).filter((p) => {
    const q = search.trim().toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || p.associatedName.toLowerCase().includes(q);
  }).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Modal title={`Add Existing to ${group.name}`} onClose={onClose}>
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

function PersonDetailModal({ person, gifts, groups, settings, onClose, onEditPerson, onEditGiftFeedback, onSaveFeedback }) {
  const latest = gifts[0] || null;
  const [feedback, setFeedback] = useState(latest?.feedback || "");
  const [rating, setRating] = useState(latest?.rating || 0);
  const [editingFeedback, setEditingFeedback] = useState(false);
  const sourceName = (gift) => groups.find((g) => g.id === gift.groupId)?.name || "All People";
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
            <div className="text-sm">{formatDate(latest.date)} · {latest.giftTypeName} · {sourceName(latest)}</div>
            {hasSavedFeedback && !editingFeedback && (
              <div className="space-y-2">
                {settings.enableRatings && !!latest.rating && <div className="text-sm text-amber-700">{"★".repeat(latest.rating)}{"☆".repeat(5 - latest.rating)}</div>}
                {settings.enableFeedback && !!latest.feedback && <div className="text-sm">{latest.feedback}</div>}
                {(settings.enableFeedback || settings.enableRatings) && <AppButton variant="secondary" onClick={() => setEditingFeedback(true)}>Edit Feedback</AppButton>}
              </div>
            )}
            {(!hasSavedFeedback || editingFeedback) && (settings.enableFeedback || settings.enableRatings) && (
              <div className="space-y-3">
                {settings.enableFeedback && <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Feedback for this gift" className="w-full rounded-2xl border px-3 py-3 min-h-[100px] outline-none" />}
                {settings.enableRatings && <StarPicker value={rating} onChange={setRating} />}
                <div className="flex gap-2">
                  {editingFeedback && <AppButton variant="secondary" onClick={() => setEditingFeedback(false)}>Cancel</AppButton>}
                  <AppButton onClick={() => { onSaveFeedback(feedback, rating); setEditingFeedback(false); }}>Save Feedback</AppButton>
                </div>
              </div>
            )}
          </SectionCard>
        )}

        <SectionCard title="Gift History">
          <div className="space-y-3">
            {gifts.map((gift) => (
              <div key={gift.id} className="rounded-2xl border p-3 space-y-2">
                <div className="font-medium">{formatDate(gift.date)} · {gift.giftTypeName}</div>
                <div className="text-sm text-gray-500">{sourceName(gift)}</div>
                {settings.enableRatings && !!gift.rating && <div className="text-sm text-amber-700">{"★".repeat(gift.rating)}{"☆".repeat(5 - gift.rating)}</div>}
                {settings.enableFeedback && !!gift.feedback && <div className="text-sm">{gift.feedback}</div>}
                {(settings.enableFeedback || settings.enableRatings) && <div><AppButton variant="secondary" onClick={() => onEditGiftFeedback(gift.id)}>Edit Feedback</AppButton></div>}
              </div>
            ))}
            {!gifts.length && <div className="text-sm text-gray-500">No gift history yet.</div>}
          </div>
        </SectionCard>
      </div>
    </Modal>
  );
}

function AddGiftTypeModal({ onClose, onSave }) {
  const [name, setName] = useState("");
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, []);
  return (
    <Modal title="Add Gift Type" onClose={onClose}>
      <div className="space-y-3">
        <input ref={inputRef} value={name} onChange={(e) => setName(e.target.value)} placeholder="Gift type" className="w-full rounded-2xl border px-3 py-3 outline-none" />
        <div className="flex justify-end gap-2"><AppButton onClick={onClose} variant="secondary">Cancel</AppButton><AppButton onClick={() => onSave(name)} disabled={!name.trim()}>Add</AppButton></div>
      </div>
    </Modal>
  );
}

function ConfirmDeleteGiftTypeModal({ giftType, onClose, onConfirm }) {
  return (
    <Modal title="Delete Gift Type" onClose={onClose}>
      <div className="space-y-4">
        <div className="text-sm text-gray-700">Delete <span className="font-semibold">{giftType?.name}</span> from the gift type list? Previous history will keep this name.</div>
        <div className="flex justify-end gap-2"><AppButton onClick={onClose} variant="secondary">Cancel</AppButton><AppButton onClick={onConfirm} variant="danger">Delete</AppButton></div>
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
        <div className="flex justify-end gap-2"><AppButton onClick={onClose} variant="secondary">Cancel</AppButton><AppButton onClick={() => onSave(date)}>Save</AppButton></div>
      </div>
    </Modal>
  );
}

function EditPersonModal({ person, onClose, onSave, onDelete }) {
  const [form, setForm] = useState({ name: person?.name || "", associatedName: person?.associatedName || "", howMet: person?.howMet || "", note: person?.note || "", phone: person?.phone || "" });
  const nameRef = useRef(null);
  useEffect(() => { nameRef.current?.focus(); }, []);
  return (
    <Modal title="Edit Person" onClose={onClose}>
      <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (!form.name.trim()) return; onSave({ name: form.name.trim(), associatedName: form.associatedName.trim(), howMet: form.howMet.trim(), note: form.note.trim(), phone: form.phone.trim() }); }}>
        {[["name", "Name *"], ["associatedName", "Associated person"], ["howMet", "How you met them"], ["note", "Position / note"], ["phone", "Phone number"]].map(([key, label], index) => (
          <input key={key} ref={index === 0 ? nameRef : undefined} value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} placeholder={label} className="w-full rounded-2xl border px-3 py-3 outline-none" />
        ))}
        <div className="flex justify-between gap-2 pt-2">
          <AppButton onClick={onDelete} variant="danger">Remove Person</AppButton>
          <div className="flex gap-2"><AppButton onClick={onClose} variant="secondary">Cancel</AppButton><AppButton type="submit" disabled={!form.name.trim()}>Save Changes</AppButton></div>
        </div>
      </form>
    </Modal>
  );
}

function EditGiftFeedbackModal({ gift, settings, onClose, onSave }) {
  const [feedback, setFeedback] = useState(gift?.feedback || "");
  const [rating, setRating] = useState(gift?.rating || 0);
  const textRef = useRef(null);
  useEffect(() => { textRef.current?.focus(); }, []);
  return (
    <Modal title="Edit Gift Feedback" onClose={onClose}>
      <div className="space-y-3">
        <div className="text-sm text-gray-500">{gift ? `${formatDate(gift.date)} · ${gift.giftTypeName}` : "Gift"}</div>
        {settings.enableFeedback && <textarea ref={textRef} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Feedback for this gift" className="w-full rounded-2xl border px-3 py-3 min-h-[100px] outline-none" />}
        {settings.enableRatings && <StarPicker value={rating} onChange={setRating} />}
        <div className="flex justify-end gap-2"><AppButton onClick={onClose} variant="secondary">Cancel</AppButton><AppButton onClick={() => onSave(feedback, rating)}>Save Changes</AppButton></div>
      </div>
    </Modal>
  );
}

function EditGroupModal({ group, onClose, onSave }) {
  const [name, setName] = useState(group?.name || "");
  const nameRef = useRef(null);
  useEffect(() => { nameRef.current?.focus(); }, []);
  return (
    <Modal title="Edit Group" onClose={onClose}>
      <div className="space-y-3">
        <input ref={nameRef} value={name} onChange={(e) => setName(e.target.value)} placeholder="Group name" className="w-full rounded-2xl border px-3 py-3 outline-none" />
        <div className="flex justify-end gap-2"><AppButton onClick={onClose} variant="secondary">Cancel</AppButton><AppButton onClick={() => onSave({ name: name.trim() || group?.name || "Group" })}>Save Changes</AppButton></div>
      </div>
    </Modal>
  );
}

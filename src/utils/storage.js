import { DEFAULT_APP_SETTINGS } from "../constants";

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function normalizeData(raw) {
  const data = raw || {};
  return {
    breadTypes: Array.isArray(data.breadTypes) ? data.breadTypes : [],
    people: Array.isArray(data.people) ? data.people.map((p) => ({ active: true, ...p })) : [],
    lists: Array.isArray(data.lists) ? data.lists : [],
    memberships: Array.isArray(data.memberships) ? data.memberships : [],
    gifts: Array.isArray(data.gifts) ? data.gifts : [],
    appSettings: { ...DEFAULT_APP_SETTINGS, ...(data.appSettings || {}) },
  };
}

export function defaultData() {
  const fishList = "list_fish";
  const neighborsList = "list_neighbors";
  const p1 = "p_joe";
  const p2 = "p_mary";
  const p3 = "p_ed";
  const p4 = "p_tom";
  const p5 = "p_nancy";
  const p6 = "p_helen";

  return normalizeData({
    appSettings: { ...DEFAULT_APP_SETTINGS },
    breadTypes: [
      { id: "b1", name: "Sourdough", isCurrent: true },
      { id: "b2", name: "Rye", isCurrent: false },
      { id: "b3", name: "Italian Loaf", isCurrent: false },
      { id: "b4", name: "Honey Wheat", isCurrent: false },
    ],
    people: [
      { id: p1, name: "Joe Smith", associatedName: "Linda Smith", howMet: "Fish dinners", note: "New kitchen volunteer", phone: "716-555-0123", active: true },
      { id: p2, name: "Mary Collins", associatedName: "", howMet: "Fish dinners", note: "Fish fry prep", phone: "", active: true },
      { id: p3, name: "Ed Nowak", associatedName: "", howMet: "Fish dinners", note: "Dish room", phone: "", active: true },
      { id: p4, name: "Tom Sweeney", associatedName: "", howMet: "Fish dinners", note: "Cashier", phone: "", active: true },
      { id: p5, name: "Nancy Weber", associatedName: "", howMet: "Neighbor", note: "Kitchen helper", phone: "", active: true },
      { id: p6, name: "Helen Parker", associatedName: "Bob Parker", howMet: "Neighbor", note: "", phone: "", active: true },
    ],
    lists: [
      { id: fishList, name: "Fish Dinner" },
      { id: neighborsList, name: "Neighbors" },
    ],
    memberships: [
      { id: uid(), personId: p1, listId: fishList, giftedThisCycle: false, isNewToList: true },
      { id: uid(), personId: p2, listId: fishList, giftedThisCycle: false, isNewToList: false },
      { id: uid(), personId: p3, listId: fishList, giftedThisCycle: false, isNewToList: false },
      { id: uid(), personId: p4, listId: fishList, giftedThisCycle: true, isNewToList: false },
      { id: uid(), personId: p5, listId: fishList, giftedThisCycle: true, isNewToList: false },
      { id: uid(), personId: p5, listId: neighborsList, giftedThisCycle: false, isNewToList: false },
      { id: uid(), personId: p6, listId: neighborsList, giftedThisCycle: false, isNewToList: true },
    ],
    gifts: [
      { id: uid(), personId: p1, listId: neighborsList, breadTypeName: "Sourdough", date: "2026-03-01", feedback: "", rating: null },
      { id: uid(), personId: p2, listId: fishList, breadTypeName: "Rye", date: "2026-02-02", feedback: "", rating: null },
      { id: uid(), personId: p3, listId: fishList, breadTypeName: "Sourdough", date: "2026-01-10", feedback: "", rating: null },
      { id: uid(), personId: p4, listId: fishList, breadTypeName: "Sourdough", date: "2026-03-08", feedback: "", rating: null },
      { id: uid(), personId: p5, listId: neighborsList, breadTypeName: "Italian Loaf", date: "2025-09-20", feedback: "", rating: 4 },
    ],
  });
}

export function loadData(storageKey) {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? normalizeData(JSON.parse(raw)) : defaultData();
  } catch {
    return defaultData();
  }
}

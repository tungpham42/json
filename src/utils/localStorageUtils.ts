const STORAGE_KEY = "json_tool_saves";

export interface SavedJson {
  id: string;
  name: string;
  content: string;
  timestamp: number;
}

export function getSavedJsonList(): SavedJson[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveJson(name: string, content: string): void {
  const list = getSavedJsonList();
  const newItem: SavedJson = {
    id: `${Date.now()}`,
    name,
    content,
    timestamp: Date.now(),
  };
  const updated = [newItem, ...list].slice(0, 10); // Keep only last 10
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function loadJsonById(id: string): string | null {
  const list = getSavedJsonList();
  const item = list.find((i) => i.id === id);
  return item ? item.content : null;
}
export function deleteJsonById(id: string): void {
  const list = getSavedJsonList();
  const updated = list.filter((i) => i.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}
export function clearSavedJson(): void {
  localStorage.removeItem(STORAGE_KEY);
}
export function renameJsonById(id: string, newName: string): void {
  const list = getSavedJsonList();
  const updated = list.map((item) =>
    item.id === id ? { ...item, name: newName } : item
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}
export function getJsonNameById(id: string): string | null {
  const list = getSavedJsonList();
  const item = list.find((i) => i.id === id);
  return item ? item.name : null;
}
export function getJsonTimestampById(id: string): number | null {
  const list = getSavedJsonList();
  const item = list.find((i) => i.id === id);
  return item ? item.timestamp : null;
}
export function getJsonContentById(id: string): string | null {
  const list = getSavedJsonList();
  const item = list.find((i) => i.id === id);
  return item ? item.content : null;
}
export function getJsonIdByName(name: string): string | null {
  const list = getSavedJsonList();
  const item = list.find((i) => i.name === name);
  return item ? item.id : null;
}

// formStore.ts (NO IMMER VERSION)
import { create } from "zustand";
import type { Schema, PropertyValue, BaseInputConfig, DependentAction } from "../types/index";


export type UIMeta = {
  folded: Record<string, boolean>;
  hidden: Record<string, boolean>;
};

export type FormValues = Record<string, any>;

export interface FormStore {
  values: FormValues;
  uiMeta: UIMeta;

  setField: (path: string | string[], value: any) => void;
  getField: (path: string | string[]) => any;

  pushArrayItem: (path: string | string[], item?: any) => void;

  setUiMeta: (meta: UIMeta) => void;

  loadValues: (data: Record<string, any>) => void;
}

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

function normalizePath(path: string | string[]): string[] {
  return Array.isArray(path) ? path : path.split(".");
}

function getAt(obj: any, path: string | string[]) {
  const keys = normalizePath(path);
  let cur = obj;

  for (const key of keys) {
    if (!cur) return undefined;

    const m = key.match(/^(.+)\[(\d+)\]$/);
    if (m) {
      const arrKey = m[1];
      const idx = Number(m[2]);
      if (!Array.isArray(cur[arrKey])) return undefined;
      cur = cur[arrKey][idx];
    } else {
      cur = cur[key];
    }
  }

  return cur;
}

function setAt(obj: any, path: string | string[], value: any) {
  const keys = normalizePath(path);
  const last = keys[keys.length - 1];

  let cur = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    const m = key.match(/^(.+)\[(\d+)\]$/);
    if (m) {
      const arrKey = m[1];
      const idx = Number(m[2]);

      cur[arrKey] = cur[arrKey] ?? [];
      while (cur[arrKey].length <= idx) cur[arrKey].push({});
      cur = cur[arrKey][idx];
    } else {
      cur[key] = cur[key] ?? {};
      cur = cur[key];
    }
  }

  const mLast = last.match(/^(.+)\[(\d+)\]$/);
  if (mLast) {
    const arrKey = mLast[1];
    const idx = Number(mLast[2]);

    cur[arrKey] = cur[arrKey] ?? [];
    while (cur[arrKey].length <= idx) cur[arrKey].push(undefined);

    cur[arrKey][idx] = value;
  } else {
    cur[last] = value;
  }
}

function valueFor(cfg: BaseInputConfig) {
  if (cfg.init !== undefined) return cfg.init;
  if (cfg.value !== undefined) return cfg.value;

  if (cfg.input === "CheckBox") return false;
  return "";
}

export function buildInitialState(
  typesObj: Schema["types"] | undefined
): FormValues {
  const state: FormValues = {};
  if (!typesObj) return state;

  function walk(props: Record<string, PropertyValue>): any {
    const out: any = {};

    for (const [key, val] of Object.entries(props)) {
      if (Array.isArray(val)) {
        out[key] = val.map((v) => walk(v));
      } else if (typeof val === "object" && (val as BaseInputConfig).input) {
        out[key] = valueFor(val as BaseInputConfig);
      } else if (typeof val === "object") {
        out[key] = walk(val as Record<string, PropertyValue>);
      }
    }

    return out;
  }

  for (const [typeName, typeObj] of Object.entries(typesObj)) {
    state[typeName] = {};
    if (typeObj.properties) {
      state[typeName] = walk(typeObj.properties);
    }
  }

  return state;
}

// extract "{@form[path]}"
function extractFormPath(token: string): string | null {
  const m = token.match(/\{\s*@form\[(.+?)\]/);
  return m ? m[1].trim() : null;
}

function evaluateCondition(
  cond: DependentAction["condition"],
  getField: (p: string) => any
): boolean {
  if (cond.type !== "compare") return false;

  const path = extractFormPath(cond.target);
  if (!path) return false;

  const val = getField(path);

  return String(val) === String(cond.compareWith);
}

export function evaluateDependentActions(
  list: DependentAction[] | undefined,
  getField: (p: string) => any,
  uiMeta: UIMeta
): UIMeta {
  if (!list) return uiMeta;

  const meta = clone(uiMeta);

  for (const item of list) {
    if (!evaluateCondition(item.condition, getField)) continue;

    for (const action of item.actions) {
      const target = extractFormPath(action.target);
      if (!target) continue;

      const bool = action.value === "true";

      if (action.method === "hide") meta.hidden[target] = bool;
      if (action.method === "folded") meta.folded[target] = bool;
    }
  }
  return meta;
}

export function createFormStore(typesObj?: Schema["types"]) {
  const initialValues = buildInitialState(typesObj);

  return create<FormStore>((set, get) => ({
    values: initialValues,
    uiMeta: { folded: {}, hidden: {} },

    setField: (path, value) =>
      set(() => {
        const newVals = clone(get().values);
        setAt(newVals, path, value);
        return { values: newVals };
      }),

    getField: (path) => getAt(get().values, path),

    pushArrayItem: (path, item = {}) =>
      set(() => {
        const newVals = clone(get().values);

        const arr = getAt(newVals, path);
        if (Array.isArray(arr)) {
          arr.push(item);
        }
        return { values: newVals };
      }),

    setUiMeta: (meta) => set({ uiMeta: meta }),

    /*loadValues: (data) =>
      set(() => {
        const newVals = clone(get().values);

        function apply(src: any, dst: any) {
          for (const key in src) {
            if (!(key in dst)) continue;

            if (Array.isArray(src[key]) && Array.isArray(dst[key])) {
              src[key].forEach((item: any, idx: number) => {
                if (!dst[key][idx]) return;
                apply(item, dst[key][idx]);
              });
            } else if (
              typeof src[key] === "object" &&
              typeof dst[key] === "object"
            ) {
              apply(src[key], dst[key]);
            } else {
              dst[key] = src[key];
            }
          }
        }

        apply(data, newVals);

        return { values: newVals };
      }),*/

    loadValues: (data) =>
      set(() => {
        const newVals = clone(get().values);

        const dataKeys = Object.keys(data).map((k) => k.toLowerCase());

        // Return matching key based on suffix
        function getMatchingKey(fullPath: string): string | null {
          const correctpath = fullPath.substring(fullPath.indexOf(".") + 1);
          const parts = correctpath.split(".").map((p) => p.replace(/\[\d+\]/, "").toLowerCase());          
          
          // Try suffix of 2 segments, then 1 segment
          for (let size = 2; size >= 1; size--) {
            let suffix = parts.slice(-size).join(".");
            
            if(fullPath.indexOf('General') === -1){
              if(fullPath.indexOf('toolBar') > -1){
                suffix = '_'+parts[0];
              }else{
                suffix = parts[0];
              }              
            }
            const idx = dataKeys.indexOf(suffix);
            if (idx !== -1) return Object.keys(data)[idx];
          }
          return null;
        }

        function deepMerge(dst: any, src: any) {
          if (typeof dst !== "object" || dst === null) return src;
          //if (Object.keys(dst).length === 0) return src;
          if (typeof src !== "object" || src === null) return src;

          for (const key of Object.keys(src)) {
            if (Array.isArray(src[key])) {
              // Create array if needed
              if (!Array.isArray(dst[key])) dst[key] = [];

              src[key].forEach((srcItem: any, index: number) => {
                // Ensure index exists
                dst[key][index] = dst[key][index] ?? {};

                // Deep merge each object item
                if (typeof srcItem === "object") {
                  deepMerge(dst[key][index], srcItem);
                } else {
                  dst[key][index] = srcItem;
                }
              });
            }

            else if (typeof src[key] === "object") {
              dst[key] = {};//dst[key] ?? {};
              deepMerge(dst[key], src[key]);
            }

            else {
              dst[key] = src[key];
            }
          }
        }

        // Walk schema and assign values
        function walk(prefix: string[], obj: any) {
          for (const [key, val] of Object.entries(obj)) {
            const fullPath = [...prefix, key].join(".");

            // If this schema path matches the array name exactly:
            const matchKey = getMatchingKey(fullPath);
            if (matchKey && Array.isArray(data[matchKey])) {
              // Prefill entire array at once
              if(key.toLowerCase().indexOf('toolbar') > -1){
                const tbkey: string = matchKey.replace('_','');
                deepMerge(getAt(newVals, prefix), { [tbkey]: data[matchKey][0] });
                continue;
              }else{
                deepMerge(getAt(newVals, prefix), { [key]: data[matchKey] });
                continue;
              }
            }
            
            // Input field?
            if (typeof val === "object" && val !== null && "input" in val) {
              if (matchKey && !Array.isArray(data[matchKey])) {
                if(matchKey === "pageOverlay" || matchKey === "actions"
                   || fullPath.indexOf('alpha') > -1 || fullPath.indexOf('font') > -1 || fullPath.indexOf('padding') > -1 || fullPath.indexOf('frame') > -1){
                  const _path = [...prefix, matchKey].join(".");
                  setAt(newVals, _path, data[matchKey]);

                }else{
                  setAt(newVals, fullPath, data[matchKey]);
                }
              }
            }

            // Nested object
            else if (typeof val === "object" && val !== null) {
              walk([...prefix, key], val);
            }
          }
        }

        for (const [typeName, typeObj] of Object.entries(typesObj ?? {})) {
          if (typeObj.properties) walk([typeName], typeObj.properties);
        }

        //console.log(data, ".....newVals >>>>", newVals);
        return { values: newVals };
      }),

  }));
}

type AnyObject = { [key: string]: any };

export function flattenObject(
  obj: AnyObject,
  parentKey: string = '',
  result: Record<string, any> = {}
): Record<string, any> {
  if (obj === null) {
    if (parentKey) result[parentKey] = null;
    return result;
  }

  if (typeof obj !== 'object') {
    if (parentKey) result[parentKey] = obj;
    return result;
  }

  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      const newKey = parentKey ? `${parentKey}.${index}` : `${index}`;
      flattenObject(item, newKey, result);
    });
  } else {
    Object.keys(obj).forEach(key => {
      const newKey = parentKey ? `${parentKey}.${key}` : key;
      flattenObject(obj[key], newKey, result);
    });
  }

  return result;
}

export function flattenObjectBracket(
  obj: AnyObject,
  parentKey: string = '',
  result: Record<string, any> = {}
): Record<string, any> {
  if (obj === null) {
    if (parentKey) result[parentKey] = null;
    return result;
  }

  if (typeof obj !== 'object') {
    if (parentKey) result[parentKey] = obj;
    return result;
  }

  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      const newKey = parentKey ? `${parentKey}[${index}]` : `[${index}]`;
      flattenObjectBracket(item, newKey, result);
    });
  } else {
    Object.keys(obj).forEach(key => {
      const newKey = parentKey ? `${parentKey}.${key}` : key;
      flattenObjectBracket(obj[key], newKey, result);
    });
  }

  return result;
}

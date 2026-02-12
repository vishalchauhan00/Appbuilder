import { extractUILocaleMap } from "./localeUtils";
import { createFormStore } from "../store/propertyFormStore";

let uiDefCache: any | null = null;
let uiLocaleCache: any | null = null;

export async function loadUIConfig(): Promise<any> {
  if (uiDefCache && uiLocaleCache) {
    return {
      uiLocaleJson: uiLocaleCache,
    };
  }

  const [defRes, localeRes] = await Promise.all([
    fetch("./config/UIPartDic.json"),
    fetch("./locale/en_US/uiproperties.json"),
  ]);

  if (!defRes.ok || !localeRes.ok) {
    throw new Error("Failed to load UI config JSON");
  }

  uiDefCache = await defRes.json();
  uiLocaleCache = await localeRes.json();

  return {
    uiLocaleJson: uiLocaleCache,
  };
}


type UIInspectorInstance = {
  schema: any;
  localeMap: Record<string, string>;
  useForm: ReturnType<typeof createFormStore>;
};

const uiInspectorCache = new Map<string, UIInspectorInstance>();

export async function getUIInspector(
  uiType: string,
  uiLocaleJson: any
): Promise<UIInspectorInstance> {

  if (uiInspectorCache.has(uiType)) {
    return uiInspectorCache.get(uiType)!;
  }

  // 🔹 Fetch DEF per uiType (ONLY ONCE)
  const defRes = await fetch(`./config/components/${uiType}.json`);
  if (!defRes.ok) {
    throw new Error(`Failed to load ${uiType}.json`);
  }

  const defJson = await defRes.json();

   // 🔹 Build schema
  /*const schema = {
    types: {
      [uiType]: {
        properties: defJson.properties,
      },
    },
  };*/
  const schema = defJson;

  // --- Extract locale ---
  const localeMap = extractUILocaleMap(uiLocaleJson, uiType);

  // --- Create Zustand store for THIS uiType ---
  const useForm = createFormStore(schema.item?.types);

  const instance: UIInspectorInstance = {
    schema,
    localeMap,
    useForm,
  };

  uiInspectorCache.set(uiType, instance);
  return instance;
}

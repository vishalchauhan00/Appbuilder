// src/types.ts
export type Primitive = string | number | boolean | null;

export type InputType =
  | "TextInput"
  | "TextInputWithButton"
  | "DropDownList"
  | "NumericStepper"
  | "CheckBox"
  | "ColorPicker"
  | "LabelWithButton";

export interface BaseInputConfig {
  input: InputType;
  init?: Primitive;
  value?: Primitive;
  dataType?: string;
  dataSource?: Array<{ name?: string } | string>;
  disable?: boolean;
  popup?: string;
  min?: string | number;
  max?: string | number;
  validators?: string[];
  dependentActions?: DependentAction[];
  [k: string]: any;
}

/**
 * Property can be:
 *  - an InputConfig object (has .input)
 *  - an array of objects (repeatable complex type)
 *  - a nested plain object (group)
 */
export type PropertyValue = BaseInputConfig | { [key: string]: PropertyValue } | Array<{ [key: string]: PropertyValue }>;

export interface TypeEntry {
  properties?: { [propertyName: string]: PropertyValue };
}

export interface Schema {
  item?: {
    meta?: any;
    types?: { [typeName: string]: TypeEntry };
  };
  types?: { [typeName: string]: TypeEntry };
}

/**
 * Dependent actions (based on your JSON)
 */
export interface DependentCondition {
  type: "compare" | string;
  target: string; // e.g. "{@form[Children[0].showScrollButtons]:value}"
  compareBy?: "EQ" | string;
  compareWith?: string | number;
  at?: string[]; // e.g. ["initForm", " postCommit"]
}

export interface DependentActionItem {
  target: string; // e.g. "{@form[Children[0].scrollButtonsBGColor]:}"
  method: "folded" | "hide" | string;
  value: string; // "true"|"false"
  case?: string;
}

export interface DependentAction {
  condition: DependentCondition;
  actions: DependentActionItem[];
}

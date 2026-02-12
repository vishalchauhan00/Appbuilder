// src/FormEngine.tsx
import { useEffect, useMemo } from "react";
import { Accordion, AccordionSummary, AccordionDetails, Typography, Box } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { RenderField, InspectorGroup } from "./FormRenderer";
import type { Schema, PropertyValue, BaseInputConfig } from "../../types/index";
import { createFormStore, evaluateDependentActions } from "../../store/propertyFormStore";


function resolveLabel(
  fullPath: string,
  key: string,
  locale?: Record<string, string>
): string {
  if (!locale) return key;

  const normalized = Object.fromEntries(
    Object.entries(locale).map(([k, v]) => [k.toLowerCase(), v])
  );

  const parts = fullPath.split(".");

  // Try suffix paths (longest → shortest)
  for (let i = 0; i < parts.length; i++) {
    const suffix = parts.slice(i).join(".").toLowerCase();
    if (normalized[suffix]) return normalized[suffix];
  }

  // Fallback to key
  return normalized[key.toLowerCase()] ?? key;
}

interface FormEngineProps  {
  schema: Schema;
  prefillData?: Record<string, any>;
  localeMap?: Record<string, string>;
  useFormOverride?: ReturnType<typeof createFormStore>;
}

export const FormEngine: React.FC<FormEngineProps> = ({
  schema,
  prefillData,
  localeMap,
  useFormOverride,
}) => {
  const types = schema?.item?.types ?? schema.types ?? {};

  //console.log(prefillData?.viewType, ".... FormEngine ....", types);

  //const useForm = useMemo(() => createFormStore(types), [JSON.stringify(types)]);
  const useForm = useMemo(
    () => useFormOverride ?? createFormStore(types),
    [useFormOverride, JSON.stringify(types)]
  );

  const values = useForm((s) => s.values);
  const uiMeta = useForm((s) => s.uiMeta);

  const setField = useForm((s) => s.setField);
  const getField = useForm((s) => s.getField);
  const setUiMeta = useForm((s) => s.setUiMeta);
  const loadValues = useForm((s) => s.loadValues);

  useEffect(() => {
    if (prefillData) {
      loadValues(prefillData);
      runAllDependentActions();
    }
  }, [prefillData]);

  function isInputConfig(v: PropertyValue): v is BaseInputConfig {
    return typeof v === "object" && v !== null && "input" in v;
  }

  function renderProperties(props: Record<string, PropertyValue>, prefix: string[]) {
    return Object.entries(props).map(([key, cfg]) => {
      const fullPath = [...prefix, key].join(".");

      const folded = uiMeta.folded[fullPath];
      const hidden = uiMeta.hidden[fullPath];

      if (Array.isArray(cfg)) {
        return cfg.map((item, idx) => {
          const arrPath = `${fullPath}[${idx}]`;
          return (
            <Box
              key={arrPath}
              sx={{
                p: 0.5,
                border: "1px dashed #ccc",
                borderRadius: 1,
                background: "background.default",
              }}
            >
              {renderProperties(item as Record<string, PropertyValue>, [...prefix, `${key}[${idx}]`])}
            </Box>
            
          );
        });
      }

      if (isInputConfig(cfg)) {
        const val = getField(fullPath);
        //console.log(fullPath, "***********", val);

        const label = resolveLabel(fullPath, key, localeMap );

        return (
          <RenderField
            key={fullPath}
            path={fullPath}
            name={label}
            config={cfg}
            value={val}
            folded={folded}
            hidden={hidden}
            toggleFold={(p) =>
              setUiMeta({
                ...uiMeta,
                folded: { ...uiMeta.folded, [p]: !uiMeta.folded[p] },
              })
            }
            onChange={(value) => {
              setField(fullPath, value);
              if (cfg.dependentActions) {
                const meta = evaluateDependentActions(
                  cfg.dependentActions,
                  getField,
                  uiMeta
                );
                setUiMeta(meta);
              }
              runAllDependentActions();
            }}
          />
        );
      }

      // Nested object → group
      if (typeof cfg === "object" && cfg !== null) {
        const groupLabel = resolveLabel(
          fullPath,
          key,
          localeMap
        );

        return (
          <InspectorGroup key={fullPath} title={groupLabel}>
            {renderProperties(
              cfg as Record<string, PropertyValue>,
              [...prefix, key]
            )}
          </InspectorGroup>
        );
      }

      return null;
    });
  }

  function runAllDependentActions() {
    let meta = clone(uiMeta);

    const stack: Array<[string[], any]> = [];

    for (const [typeName, typeObj] of Object.entries(types)) {
      if (typeObj.properties) {
        stack.push([[typeName], typeObj.properties]);
      }
    }

    while (stack.length) {
      const [prefix, props] = stack.pop()!;

      for (const [key, rawVal] of Object.entries(props)) {
        // Ensure TS knows the type
        const val = rawVal as PropertyValue;

        //const full = [...prefix, key].join(".");

        if (Array.isArray(val)) {
          val.forEach((item, idx) => {
            stack.push([[...prefix, `${key}[${idx}]`], item as Record<string, PropertyValue>]);
          });
        }
        else if (isInputConfig(val)) {
          if (val.dependentActions) {
            meta = evaluateDependentActions(val.dependentActions, getField, meta);
          }
        }
        else if (typeof val === "object" && val !== null) {
          stack.push([[...prefix, key], val as Record<string, PropertyValue>]);
        }
      }

    }

    setUiMeta(meta);
  }

  function clone(v: any) {
    return JSON.parse(JSON.stringify(v));
  }


  return (
    <Box sx={{ p: 0.5, overflow: "auto" }}>
      {Object.entries(types).map(([typeName, typeObj]) => (
        <Accordion defaultExpanded key={typeName} sx={{ mb: 1 }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              minHeight: 32, border: '1px solid #ccc', borderBottomWidth: 2,
              "&.Mui-expanded": { minHeight: 32 },
              "& .MuiAccordionSummary-content": { my: 0, minHeight: 32, alignItems: "center" },
              "& .MuiAccordionSummary-content.Mui-expanded": { my: 0, minHeight: 32 },
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {typeName}
            </Typography>
          </AccordionSummary>

          <AccordionDetails sx={{ pt: 0.5, border: '1px solid #ccc' }}>
            {typeObj.properties ? (
              renderProperties(typeObj.properties, [typeName])
            ) : (
              <Typography>No properties</Typography>
            )}
          </AccordionDetails>
        </Accordion>
      ))}

      <Box mt={2} sx={{ display: "none" }}>
        <Typography variant="caption">Form Values</Typography>
        <pre
          style={{
            fontSize: 11,
            maxHeight: 250,
            overflow: "auto",
            background: "#f7f7f7",
            padding: 8,
          }}
        >
          {JSON.stringify(values, null, 2)}
        </pre>
      </Box>
    </Box>
  );
}

export default FormEngine;

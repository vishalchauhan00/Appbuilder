import React, { useCallback } from "react";
import {
  TextField,
  Checkbox,
  Button,
  Box,
  Typography,
  Select,
  MenuItem,
  IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { BaseInputConfig } from "../../types/index";


/* -------------------------------------------------------
   Shared inspector layout state
------------------------------------------------------- */

const LABEL_MIN = 80;
const LABEL_MAX = 220;

/**
 * Simple shared label width store.
 * (No Zustand needed – inspector-wide UX)
 */
let labelWidth = 140;
const subscribers = new Set<() => void>();

function setLabelWidth(w: number) {
  labelWidth = Math.max(LABEL_MIN, Math.min(LABEL_MAX, w));
  subscribers.forEach((cb) => cb());
}

function useLabelWidth() {
  const [, force] = React.useState({});
  React.useEffect(() => {
    const cb = () => force({});
    subscribers.add(cb);

    return () => {
      subscribers.delete(cb); // ✅ no return value
    };
  }, []);

  return labelWidth;
}

/* -------------------------------------------------------
   Reusable Row Layout
------------------------------------------------------- */

function InspectorRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const width = useLabelWidth();

  const onDragStart = useCallback((e: React.MouseEvent) => {
    const startX = e.clientX;
    const startWidth = width;

    function onMove(ev: MouseEvent) {
      setLabelWidth(startWidth + (ev.clientX - startX));
    }

    function onUp() {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [width]);

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: `${width}px 1fr`,
        alignItems: "center",
        gap: 1,
        py: 0.5,
      }}
    >
      {/* Label column */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pr: 0.5,
          userSelect: "none",
        }}
      >
        <Typography
          variant="caption"
          sx={{ fontSize: 12, color: "text.secondary", whiteSpace: "nowrap" }}
        >
          {label}
        </Typography>

        {/* Drag handle */}
        <Box
          onMouseDown={onDragStart}
          sx={{
            width: 4,
            height: 16,
            cursor: "col-resize",
            borderRadius: 1,
            "&:hover": { bgcolor: "divider" },
          }}
        />
      </Box>

      {/* Field column */}
      {children}
    </Box>
  );
}

/* -------------------------------------------------------
   Group Header
------------------------------------------------------- */

export function InspectorGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ mt: 0.5, mb: 0 }}>
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 600,
          textTransform: "uppercase",
          color: "text.disabled",
          mb: 0.5,
        }}
      >
        {title}
      </Typography>

      <Box
        sx={{
          borderTop: "1px solid",
          borderColor: "divider",
          pt: 0.5,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

/* -------------------------------------------------------
   Field Renderer
------------------------------------------------------- */

interface Props {
  path: string;
  name: string;
  config: BaseInputConfig;
  value: any;
  folded?: boolean;
  hidden?: boolean;
  toggleFold: (p: string) => void;
  onChange: (value: any) => void;
}

export const RenderField: React.FC<Props> = ({
  path,
  name,
  config,
  value,
  folded,
  hidden,
  toggleFold,
  onChange,
}) => {

  if (hidden || config.disable === true) return null;

  const label = name;

  if (folded) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        sx={{ border: "1px dashed #bbb", p: 1, mb: 1, borderRadius: 1 }}
      >
        <Typography variant="caption">{label} (folded)</Typography>
        <IconButton size="small" onClick={() => toggleFold(path)}>
          <ExpandMoreIcon fontSize="small" />
        </IconButton>
      </Box>
    );
  }

  const baseSlotProps = {
    inputLabel: { shrink: true },
    input: {
      sx: {
        height: 28, padding: "4px", fontSize: "12px",                
      },
    },
  } as const;

  switch (config.input) {
    case "TextInput":
      return (
       <InspectorRow label={name}>
          <TextField
            fullWidth
            size="small"
            slotProps={baseSlotProps}
            sx={{
              "& .MuiOutlinedInput-input": {
                padding: "2px",
              },
            }}
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
          />
        </InspectorRow>

      );

    case "NumericStepper":
      return (
         <InspectorRow label={name}>
          <TextField
            fullWidth
            size="small"
            type="number"
            slotProps={{
              ...baseSlotProps,
              htmlInput: {
                min: config.min,
                max: config.max,
              },
            }}
            sx={{
              "& .MuiOutlinedInput-input": {
                padding: "2px",
              },
            }}
            value={value ?? ""}
            onChange={(e) => onChange(Number(e.target.value))}
          />
        </InspectorRow>
      );

    case "TextInputWithButton":
      return (
        <Box display="flex" gap={0} my={0.5}>
          <TextField
            fullWidth
            size="small"
            margin="dense"
            label={label}
            slotProps={baseSlotProps}
            sx={{
              "& .MuiOutlinedInput-input": {
                padding: "2px",
              },
            }}
            disabled={!!config.disable}
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
          />
          <Button size="small" variant="outlined" sx={{ minWidth: 28, height: 28, marginTop: 1 }}>
            ...
          </Button>
        </Box>
      );

    case "DropDownList":
      return (
        <InspectorRow label={name}>          
          <Select size="small"
            sx={{ 
              maxHeight: 28, padding: "4px", fontSize: "12px",
              "& .MuiOutlinedInput-input": {
                  padding: "2px",
              },
              "& .MuiOutlinedInput-notchedOutline legend": {
                width: 0,
              },
            }}            
            value={value ?? config.init ?? ""}
            onChange={(e) => onChange(e.target.value)}
          >
            {(config.dataSource ?? []).map((opt: any, idx: number) => (
              <MenuItem key={idx} value={opt?.name ?? opt}>
                {opt?.name ?? opt}
              </MenuItem>
            ))}
          </Select>
        </InspectorRow>
      );

    case "CheckBox":
      return (
        <InspectorRow label={name}>
          <Box sx={{ display: "flex"}}>
            <Checkbox
              size="small"
              checked={!!value}
              onChange={(e) => onChange(e.target.checked)}
              sx={{ p: 0.5 }}
            />
          </Box>
        </InspectorRow>
      );

    case "ColorPicker":
      const colorVal = value ? getColorValue(value) : "#000000";
      return (
        <InspectorRow label={name}>
          <Box display="flex" gap={0.5} alignItems="center" sx={{ border: "1px solid #ccc", borderRadius: 1 }}>
            <input
              type="color"
              value={colorVal}
              onChange={(e) => onChange(e.target.value)}
              style={{
                width: 28,
                height: 28,
                border: "none",
                background: "transparent",
              }}
            />
            <Typography variant="caption">{colorVal}</Typography>
          </Box>
        </InspectorRow>
      );

    case "LabelWithButton":
      let btnLabel = 'Edit';
      if(value && Array.isArray(value)){
        btnLabel = label.indexOf('UI') > -1 ? 'Count ('+value.length+')' : 'Edit ('+value.length+')';
      } 
      return (
        <InspectorRow label={name}>
          <Button
            size="small"
            variant="outlined"
            sx={{
              height: "28px", my: 0.5, textTransform: "none",
            }}
            onClick={() => alert(`Open editor: ${config.popup || name}`)}
          >
            {btnLabel}
          </Button>
        </InspectorRow>
      );

    default:
      return (
        <TextField
          fullWidth
          size="small"
          margin="dense"
          label={label}
          sx={{
            "& .MuiOutlinedInput-input": {
              padding: "2px",
            },
          }}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
};

type ColorObject = {
  red: number;
  green: number;
  blue: number;
  alpha?: number;
  colorName?: string;
};

function getColorValue(color: ColorObject): string {
  // Clamp values between 0–255
  const r = Math.round(color.red * 255);
  const g = Math.round(color.green * 255);
  const b = Math.round(color.blue * 255);

  // Convert each to 2-digit hex
  const hex = [r, g, b]
    .map(val => val.toString(16).padStart(2, '0'))
    .join('');

  return `#${hex}`;
}

export default RenderField;
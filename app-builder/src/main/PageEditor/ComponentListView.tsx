import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  CardContent,
  CardMedia,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import React, { useEffect, useMemo, useState } from "react";

type BoolString = "true" | "false";

export interface UIItem {
  name: string;
  text: string;
  visible: BoolString;
  imagePath: string;
  description?: string;
  type?: string;
}

export interface UIPart {
  name: string;
  text: string;
  include: BoolString;
  items: UIItem[];
}

interface UIComponentViewProps {
  parts: UIPart[];
}

const UIComponentView: React.FC<UIComponentViewProps> = ({ parts }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const visibleParts = useMemo(
    () => parts.filter((part) => part.include === "true"),
    [parts]
  );
  const firstPanelKey = visibleParts[0]?.name ?? null;
  const [expandedKey, setExpandedKey] = useState<string | false>(
    firstPanelKey || false
  );

  useEffect(() => {
    setExpandedKey(firstPanelKey || false);
  }, [firstPanelKey]);

  const handleToggle =
    (panelKey: string) =>
    (_event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedKey(isExpanded ? panelKey : false);
    };

  const headerBg = isDarkMode
    ? alpha(theme.palette.primary.dark, 0.25)
    : theme.palette.grey[100];
  const contentBg = theme.palette.background.paper;
  const cardBg = isDarkMode
    ? alpha(theme.palette.background.default, 0.6)
    : theme.palette.grey[50];

  const handleDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    item: UIItem
  ) => {
    event.dataTransfer.setData(
      "application/x-ui-item",
      JSON.stringify(item)
    );
    event.dataTransfer.effectAllowed = "copyMove";
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 300,
        margin: "0 auto",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {visibleParts.map((part) => {
        const panelKey = part.name;
        const isOpen = expandedKey === panelKey;
        const visibleItems = part.items.filter(
          (item) => item.visible === "true"
        );

        return (
          <Accordion
            key={panelKey}
            expanded={isOpen}
            onChange={handleToggle(panelKey)}
            disableGutters
            square
            sx={{
              mb: 1,
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: headerBg,
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`${panelKey}-content`}
              id={`${panelKey}-header`}
              sx={{
                minHeight: 28, px: 1,
                "&.Mui-expanded": { minHeight: 28 },
                "& .MuiAccordionSummary-content": {
                  margin: 0,
                },
                "& .MuiAccordionSummary-content.Mui-expanded": {
                  margin: 0,
                },
              }}
            >
              <Typography fontWeight={600} sx={{ fontSize: '0.775rem' }} component="div">{part.text}</Typography>
            </AccordionSummary>
            {visibleItems.length > 0 && (
              <AccordionDetails
                sx={{
                  p: 0,
                  minHeight: 240,
                  maxHeight: 320,
                  overflowY: "auto",
                  overflowX: "hidden",
                  backgroundColor: contentBg,
                }}
              >
                <Box
                  sx={{
                    p: 0.5,
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(120px, 1fr))",
                    gap: 1,
                    width: "100%",
                  }}
                >
                  {visibleItems.map((item) => (
                    <Card
                      key={item.name}
                      variant="outlined"
                      draggable
                      onDragStart={(e) => handleDragStart(e, item)}
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        backgroundColor: cardBg,
                        borderColor: (theme) => `${theme.palette.primary.main}`, borderWidth: 1, borderStyle: "solid",
                      }}
                    >
                      <CardContent
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          textAlign: "center",
                          gap: 0,
                          p: 0.5,
                          "&:last-child": {
                            pb: 0.5,
                          },
                        }}
                      >
                        <CardMedia
                          component="img"
                          image={"src/"+item.imagePath}
                          alt={item.text}
                          sx={{
                            width: 48,
                            height: 48,
                            objectFit: "contain",
                            mb: 1,
                          }}
                        />
                        {item.description &&
                        item.description.trim() !== "" ? (
                          <Tooltip title={item.description}>
                            <Typography
                              variant="subtitle2"
                              fontWeight={600}
                              sx={{ cursor: "help" }}
                            >
                              {item.text}
                            </Typography>
                          </Tooltip>
                        ) : (
                          <Typography variant="subtitle2" fontWeight={600}>
                            {item.text}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </AccordionDetails>
            )}
          </Accordion>
        );
      })}
    </div>
  );
};

export default UIComponentView;
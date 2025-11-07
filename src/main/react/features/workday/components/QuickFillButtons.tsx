import React from "react";
import { Typography, Button } from "@material-ui/core";

interface QuickFillButtonsProps {
  presets?: number[];
  onQuickFill: (hours: number) => void;
  classes: {
    fillButton: string;
  };
}

export const QuickFillButtons: React.FC<QuickFillButtonsProps> = ({
  presets = [0, 8, 9],
  onQuickFill,
  classes,
}) => {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
      <Typography variant="body2" style={{ marginRight: "8px" }}>
        Uren vullen voor deze maand:
      </Typography>
      {presets.map((hours) => (
        <Button
          key={hours}
          variant="outlined"
          className={classes.fillButton}
          style={{ marginRight: 8 }}
          onClick={() => onQuickFill(hours)}
        >
          {hours}
        </Button>
      ))}
    </div>
  );
};

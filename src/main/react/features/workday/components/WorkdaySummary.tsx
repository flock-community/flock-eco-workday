import React from "react";
import { Typography, Button } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import {
  EVENT_COLOR,
  SICKNESS_COLOR,
  VACATION_COLOR,
  OVERLAP_COLOR,
} from "../enhanced/types";

interface WorkdaySummaryProps {
  sickHours: number;
  eventHours: number;
  leaveHours: number;
  overlapHours: number;
  grandTotal: number;
  monthCount: number;
  onAddMonth: () => void;
  classes: {
    legendAndButtonRow: string;
    summaryRow: string;
    summaryItem: string;
    summaryColor: string;
    summaryText: string;
    summaryHours: string;
    addMonthButton: string;
    monthTotal: string;
    monthTotalLabel: string;
    monthTotalValue: string;
  };
}

export const WorkdaySummary: React.FC<WorkdaySummaryProps> = ({
  sickHours,
  eventHours,
  leaveHours,
  overlapHours,
  grandTotal,
  monthCount,
  onAddMonth,
  classes,
}) => {
  return (
    <>
      {/* Legend and add month button */}
      <div className={classes.legendAndButtonRow}>
        <div className={classes.summaryRow}>
          {sickHours > 0 && (
            <div className={classes.summaryItem}>
              <div
                className={classes.summaryColor}
                style={{ backgroundColor: SICKNESS_COLOR }}
              ></div>
              <Typography variant="body2" className={classes.summaryText}>
                Ziekte
              </Typography>
              <div className={classes.summaryHours}>
                <Typography variant="body2">{sickHours}</Typography>
              </div>
            </div>
          )}

          {eventHours > 0 && (
            <div className={classes.summaryItem}>
              <div
                className={classes.summaryColor}
                style={{ backgroundColor: EVENT_COLOR }}
              ></div>
              <Typography variant="body2" className={classes.summaryText}>
                Event
              </Typography>
              <div className={classes.summaryHours}>
                <Typography variant="body2">{eventHours}</Typography>
              </div>
            </div>
          )}

          {leaveHours > 0 && (
            <div className={classes.summaryItem}>
              <div
                className={classes.summaryColor}
                style={{ backgroundColor: VACATION_COLOR }}
              ></div>
              <Typography variant="body2" className={classes.summaryText}>
                Verlof
              </Typography>
              <div className={classes.summaryHours}>
                <Typography variant="body2">{leaveHours}</Typography>
              </div>
            </div>
          )}

          {overlapHours > 0 && (
            <div className={classes.summaryItem}>
              <div
                className={classes.summaryColor}
                style={{
                  backgroundColor: "transparent",
                  border: `2px solid ${OVERLAP_COLOR}`,
                }}
              ></div>
              <Typography variant="body2" className={classes.summaryText}>
                Overlappend
              </Typography>
              <div className={classes.summaryHours}>
                <Typography variant="body2">{overlapHours}</Typography>
              </div>
            </div>
          )}
        </div>

        <Button
          variant="outlined"
          color="primary"
          onClick={onAddMonth}
          startIcon={<AddIcon />}
          className={classes.addMonthButton}
        >
          Maand toevoegen
        </Button>
      </div>

      {/* Total for all periods */}
      <div className={classes.monthTotal}>
        <Typography variant="h6" className={classes.monthTotalLabel}>
          {monthCount > 1 ? "Totaal Alle Maanden:" : "Maand Totaal:"}
        </Typography>
        <Typography variant="h4" className={classes.monthTotalValue}>
          {grandTotal}
        </Typography>
      </div>
    </>
  );
};

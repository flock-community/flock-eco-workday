import { useState, useCallback } from "react";
import { WorkDayClient } from "../../../clients/WorkDayClient";
import { ExportClient } from "../../../clients/ExportClient";
import { isDefined } from "../../../utils/validation";
import { ISO_8601_DATE } from "../../../clients/util/DateFormats";
import UserAuthorityUtil from "@flock-community/flock-eco-feature-user/src/main/react/user_utils/UserAuthorityUtil";
import { WorkDayState, ExportStatusProps } from "../enhanced/types";

interface UseWorkdayFormHandlersParams {
  code?: string;
  selectedWeeks: number[];
  onComplete?: (result?: any) => void;
  onStateChange?: (state: WorkDayState | null) => void;
}

interface UseWorkdayFormHandlersReturn {
  processing: boolean;
  openDelete: boolean;
  exportLink: ExportStatusProps;
  handleSubmit: (formValues: any) => Promise<any>;
  handleDelete: () => void;
  handleDeleteOpen: () => void;
  handleDeleteClose: () => void;
  handleClose: () => void;
  handleExport: (() => Promise<void>) | null;
  clearExportLink: () => void;
}

export function useWorkdayFormHandlers({
  code,
  selectedWeeks,
  onComplete,
  onStateChange,
}: UseWorkdayFormHandlersParams): UseWorkdayFormHandlersReturn {
  const [processing, setProcessing] = useState<boolean>(false);
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const [exportLink, setExportLink] = useState<ExportStatusProps>({
    loading: false,
    link: null,
  });

  // Handle form submission
  const handleSubmit = useCallback(
    (it: any) => {
      setProcessing(true);

      // Clone the days array to avoid modifying the original
      let processedDays = it.days ? [...it.days] : null;

      // Filter out hours from days in disabled weeks
      if (processedDays && processedDays.length > 0) {
        // Create an array to track whether each day should be included
        const includeDayFlags = Array(processedDays.length).fill(false);

        // For each day, determine if it belongs to a selected week
        for (let i = 0; i < processedDays.length; i++) {
          const dayDate = it.from.clone().add(i, "day");
          const weekNumber = dayDate.isoWeek();

          // If the week is selected, this day should be included
          if (selectedWeeks.includes(weekNumber)) {
            includeDayFlags[i] = true;
          }
        }

        // Now zero out the hours for days in disabled weeks
        for (let i = 0; i < processedDays.length; i++) {
          if (!includeDayFlags[i]) {
            processedDays[i] = 0;
          }
        }
      }

      // Calculate total hours only from selected days
      const totalHours = processedDays
        ? processedDays.reduce((acc, cur) => acc + parseFloat(cur || 0), 0)
        : it.hours;

      const body = {
        from: it.from.format(ISO_8601_DATE),
        to: it.to.format(ISO_8601_DATE),
        days: processedDays ? processedDays : null,
        hours: totalHours,
        assignmentCode: it.assignmentCode,
        status: it.status,
        sheets: it.sheets,
      };

      if (code) {
        return WorkDayClient.put(code, body).then((res) => {
          if (isDefined(onComplete)) {
            setProcessing(false);
            onComplete(res);
          }
          if (onStateChange) {
            onStateChange(null);
          }
        });
      } else {
        return WorkDayClient.post(body).then((res) => {
          if (isDefined(onComplete)) onComplete(res);
          if (onStateChange) {
            onStateChange(null);
          }
          setProcessing(false);
        });
      }
    },
    [code, selectedWeeks, onComplete, onStateChange]
  );

  // Delete workday
  const handleDelete = useCallback(() => {
    if (!code) return;

    WorkDayClient.delete(code).then(() => {
      if (isDefined(onComplete)) onComplete();
      setOpenDelete(false);
      setProcessing(true);
    });
  }, [code, onComplete]);

  const handleDeleteOpen = useCallback(() => {
    setOpenDelete(true);
  }, []);

  const handleDeleteClose = useCallback(() => {
    setOpenDelete(false);
  }, []);

  const handleClose = useCallback(() => {
    if (isDefined(onComplete)) onComplete();
    if (onStateChange) {
      onStateChange(null);
    }
  }, [onComplete, onStateChange]);

  // Export functionality
  const handleExport =
    code && UserAuthorityUtil.hasAuthority("WorkDayAuthority.ADMIN")
      ? async () => {
          setExportLink({ loading: true, link: null });
          const response = await ExportClient().exportWorkday(code);
          setExportLink({ loading: false, link: response.link });
          setProcessing(true);
        }
      : null;

  const clearExportLink = useCallback(() => {
    setExportLink({
      loading: false,
      link: null,
    });
  }, []);

  return {
    processing,
    openDelete,
    exportLink,
    handleSubmit,
    handleDelete,
    handleDeleteOpen,
    handleDeleteClose,
    handleClose,
    handleExport,
    clearExportLink,
  };
}

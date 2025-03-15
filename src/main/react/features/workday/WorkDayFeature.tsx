import React, { useContext, useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@material-ui/core";
import { WorkDayDialog } from "./WorkDayDialog";
import { EnhancedWorkDayDialog } from "./enhanced/EnhancedWorkDayDialog";
import { WorkDayList } from "./WorkDayList";
import { ApplicationContext } from "../../application/ApplicationContext";
import { WorkDayClient } from "../../clients/WorkDayClient";
import { addError } from "../../hooks/ErrorHook";
import Button from "@material-ui/core/Button";
import AddIcon from "@material-ui/icons/Add";
import { Person } from "../../clients/PersonClient";
import { ISO_8601_DATE } from "../../clients/util/DateFormats";
import EnhancedUiToggle from "../../components/preferences/EnhancedUiToggle";
import { isEnhancedUiEnabled, setEnhancedUiEnabled } from "../../utils/UiPreferences";

type WorkDayFeatureProps = {
  person: Person;
};

export function WorkDayFeature({ person }: WorkDayFeatureProps) {
  const [refresh, setRefresh] = useState(false);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<any>();
  const [useEnhancedUI, setUseEnhancedUI] = useState(false);
  const { authorities } = useContext(ApplicationContext);

  // Initialize enhanced UI setting from localStorage
  useEffect(() => {
    const storedValue = isEnhancedUiEnabled(false);
    setUseEnhancedUI(storedValue);
  }, []);

  function handleCompleteDialog() {
    setRefresh(!refresh);
    setOpen(false);
    setValue(undefined);
  }

  function handleClickAdd() {
    if (person === null) {
      addError("No person selected");
    } else {
      setValue(undefined);
      setOpen(true);
    }
  }

  function handleClickRow(item) {
    setValue(item);
    setOpen(true);
  }

  function handleStatusChange(status, it) {
    WorkDayClient.put(it.code, {
      ...it,
      from: it.from.format(ISO_8601_DATE),
      to: it.to.format(ISO_8601_DATE),
      status,
      assignmentCode: it.assignment.code,
      days: it.days.length > 0 ? it.days : null,
    }).then(() => setRefresh(!refresh));
  }

  function handleToggleUI(enabled: boolean) {
    setUseEnhancedUI(enabled);
    setEnhancedUiEnabled(enabled);
  }

  return (
    <>
      <Card>
        <CardHeader
          title="Work days"
          action={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <EnhancedUiToggle
                onChange={handleToggleUI}
                label="Enhanced Calendar UI"
                tooltipText="Enable the modern calendar view with improved visualization features"
              />
              <Button onClick={handleClickAdd} style={{ marginLeft: 16 }}>
                <AddIcon /> Add
              </Button>
            </div>
          }
        />
        <CardContent>
          <WorkDayList
            personId={person.uuid}
            onClickRow={handleClickRow}
            refresh={refresh}
            onClickStatus={handleStatusChange}
          />
        </CardContent>
      </Card>
      {useEnhancedUI ? (
        <EnhancedWorkDayDialog
          personFullName={person.fullName}
          open={open}
          code={value?.code}
          onComplete={handleCompleteDialog}
        />
      ) : (
        <WorkDayDialog
          personFullName={person.fullName}
          open={open}
          code={value?.code}
          onComplete={handleCompleteDialog}
        />
      )}
    </>
  );
}

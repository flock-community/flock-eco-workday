import React, { useEffect, useState } from "react";
import { Box, Dialog, DialogContent, Divider } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import WorkIcon from "@material-ui/icons/Work";
import { ConfirmDialog } from "@flock-community/flock-eco-core/src/main/react/components/ConfirmDialog";
import Typography from "@material-ui/core/Typography";
import UserAuthorityUtil from "@flock-community/flock-eco-feature-user/src/main/react/user_utils/UserAuthorityUtil";
import { WorkDayClient } from "../../clients/WorkDayClient";
import { TransitionSlider } from "../../components/transitions/Slide";
import { DialogFooter, DialogHeader } from "../../components/dialog";
import { schema, WORKDAY_FORM_ID, WorkDayForm } from "./WorkDayForm";
import { isDefined } from "../../utils/validation";
import { ISO_8601_DATE } from "../../clients/util/DateFormats";
import Button from "@material-ui/core/Button";
import { ExportClient } from "../../clients/ExportClient";
import Snackbar from "@material-ui/core/Snackbar";

type ExportStatusProps = {
  loading: boolean;
  link: string | null;
};

const useStyles = makeStyles((theme) => ({
  dialogContent: {
    margin: "auto",
    maxWidth: 768, // should be a decent medium-sized breakpoint
  },
  exportSnackBar: {
    display: "flex",
    justifyItems: "center",
    alignItems: "center",
    padding: "1rem",
    border: "2px solid",
    borderColor: theme.palette.success["600"],
    borderRadius: "5px",
    backgroundColor: theme.palette.success["200"],
  },
  exportMessage: {
    marginRight: "0.5rem",
  },
}));

export function WorkDayDialog({ personFullName, open, code, onComplete }) {
  const classes = useStyles();
  const [openDelete, setOpenDelete] = useState<boolean>(false);

  const [state, setState] = useState<any>(null);
  const [exportLink, setExportLink] = useState<ExportStatusProps>({
    loading: false,
    link: null,
  });

  useEffect(() => {
    if (open) {
      if (code) {
        WorkDayClient.get(code).then((res) => {
          setState({
            assignmentCode: res.assignment.code,
            from: res.from,
            to: res.to,
            days: res.days,
            hours: res.hours,
            status: res.status,
            sheets: res.sheets,
          });
        });
      } else {
        setState(schema.cast());
      }
    } else {
      setState(null);
    }
  }, [open, code]);

  const handleSubmit = (it) => {
    const body = {
      from: it.from.format(ISO_8601_DATE),
      to: it.to.format(ISO_8601_DATE),
      days: it.days ? it.days : null,
      hours: it.days
        ? it.days.reduce((acc, cur) => acc + parseFloat(cur || 0), 0)
        : it.hours,
      assignmentCode: it.assignmentCode,
      status: it.status,
      sheets: it.sheets,
    };
    if (code) {
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log("Waited enough");
          resolve("tada");
        }, 1000);
      })
        .then((_) => WorkDayClient.put(code, body))
        .then((res) => {
          if (isDefined(onComplete)) onComplete(res);
          setState(null);
        });
    } else {
      return WorkDayClient.post(body).then((res) => {
        if (isDefined(onComplete)) onComplete(res);
        setState(null);
      });
    }
  };

  const handleDelete = () => {
    WorkDayClient.delete(code).then(() => {
      if (isDefined(onComplete)) onComplete();
      setOpenDelete(false);
    });
  };

  const handleDeleteOpen = () => {
    setOpenDelete(true);
  };

  const handleDeleteClose = () => {
    setOpenDelete(false);
  };

  const handleClose = () => {
    if (isDefined(onComplete)) onComplete();
    setState(null);
  };

  const handleExport =
    code && UserAuthorityUtil.hasAuthority("WorkDayAuthority.ADMIN")
      ? async () => {
          setExportLink({ loading: true, link: null });
          const response = await ExportClient().exportWorkday(code);
          setExportLink({ loading: false, link: response.link });
        }
      : null;

  const headline = UserAuthorityUtil.hasAuthority("WorkDayAuthority.ADMIN")
    ? `Create Workday | ${personFullName}`
    : "Create Workday";

  function clearExportLink() {
    setExportLink({
      loading: false,
      link: null,
    });
  }

  return (
    <>
      <Dialog
        fullScreen
        open={open}
        onClose={handleClose}
        // @ts-ignore
        TransitionComponent={TransitionSlider}
        // @ts-ignore
        TransitionProps={{ direction: "right" }}
      >
        <DialogHeader
          icon={<WorkIcon />}
          headline={headline}
          subheadline="Add your workday."
          onClose={handleClose}
        />
        <DialogContent className={classes.dialogContent}>
          <UserAuthorityUtil has={"WorkDayAuthority.ADMIN"}>
            <Box my="1rem">
              <Typography variant={"h5"} component={"h2"}>
                {personFullName}
              </Typography>
            </Box>
          </UserAuthorityUtil>
          {state && <WorkDayForm value={state} onSubmit={handleSubmit} />}
        </DialogContent>
        <Divider />
        <DialogFooter
          formId={WORKDAY_FORM_ID}
          onClose={handleClose}
          onDelete={handleDeleteOpen}
          onExport={handleExport}
          disableDelete={
            !UserAuthorityUtil.hasAuthority("WorkDayAuthority.ADMIN") &&
            state &&
            state.status !== "REQUESTED"
          }
          disableEdit={
            !UserAuthorityUtil.hasAuthority("WorkDayAuthority.ADMIN") &&
            state &&
            state.status !== "REQUESTED"
          }
          processingExport={exportLink.loading}
        />
      </Dialog>
      <ConfirmDialog
        open={openDelete}
        onClose={handleDeleteClose}
        onConfirm={handleDelete}
      >
        <Typography>Are you sure you want to remove this workday.</Typography>
      </ConfirmDialog>
      <Snackbar
        open={exportLink.link != null}
        onClose={clearExportLink}
        autoHideDuration={6000}
      >
        <div className={classes.exportSnackBar}>
          <Typography className={classes.exportMessage}>
            Export of workday to google drive is done.
          </Typography>
          <Button
            onClick={clearExportLink}
            href={exportLink.link!}
            target="_blank"
          >
            Open in tab
          </Button>
        </div>
      </Snackbar>
    </>
  );
}

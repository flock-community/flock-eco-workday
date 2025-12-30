import React, { useEffect, useState } from "react";
import { Box, Dialog, DialogContent, Divider } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { Theme } from "@mui/material/styles";
import WorkIcon from "@mui/icons-material/Work";
import { ConfirmDialog } from "@workday-core/components/ConfirmDialog";
import Typography from "@mui/material/Typography";
import UserAuthorityUtil from "@workday-user/user_utils/UserAuthorityUtil";
import { WorkDayClient } from "../../clients/WorkDayClient";
import { TransitionSlider } from "../../components/transitions/Slide";
import { DialogFooter, DialogHeader } from "../../components/dialog";
import { schema, WORKDAY_FORM_ID, WorkDayForm } from "./WorkDayForm";
import { isDefined } from "../../utils/validation";
import { ISO_8601_DATE } from "../../clients/util/DateFormats";
import Button from "@mui/material/Button";
import { ExportClient } from "../../clients/ExportClient";
import Snackbar from "@mui/material/Snackbar";

type ExportStatusProps = {
  loading: boolean;
  link: string | null;
};

const useStyles = makeStyles((theme: Theme) => ({
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
  const [processing, setProcessing] = useState<boolean>(false);

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
    setProcessing(true);
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
      return WorkDayClient.put(code, body).then((res) => {
        if (isDefined(onComplete)) {
          setProcessing(false);
          onComplete(res);
        }
        setState(null);
      });
    } else {
      return WorkDayClient.post(body).then((res) => {
        if (isDefined(onComplete)) onComplete(res);
        setState(null);
        setProcessing(false);
      });
    }
  };

  const handleDelete = () => {
    WorkDayClient.delete(code).then(() => {
      if (isDefined(onComplete)) onComplete();
      setOpenDelete(false);
      setProcessing(true);
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
          setProcessing(true);
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
        TransitionComponent={TransitionSlider}
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
          processing={processing}
        />
      </Dialog>
      <ConfirmDialog
        open={openDelete}
        onClose={handleDeleteClose}
        onConfirm={handleDelete}
      >
        <Typography>Are you sure you want to remove this Work Day?</Typography>
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

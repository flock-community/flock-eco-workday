import WorkIcon from '@mui/icons-material/Work';
import { Box, Dialog, Divider } from '@mui/material';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { ConfirmDialog } from '@workday-core/components/ConfirmDialog';
import { DialogFooter, DialogHeader } from '@workday-core/components/dialog';
import { DialogBody } from '@workday-core/components/dialog/DialogHeader';
import UserAuthorityUtil from '@workday-user/user_utils/UserAuthorityUtil';
import { useEffect, useState } from 'react';
import { ExportClient } from '../../clients/ExportClient';
import { ISO_8601_DATE } from '../../clients/util/DateFormats';
import { WorkDayClient } from '../../clients/WorkDayClient';
import { TransitionSlider } from '../../components/transitions/Slide';
import { isDefined } from '../../utils/validation';
import { schema, WORKDAY_FORM_ID, WorkDayForm } from './WorkDayForm';

const PREFIX = 'WorkDayDialog';

const classes = {
  dialogContent: `${PREFIX}dialogContent`,
  exportSnackBar: `${PREFIX}exportSnackBar`,
  exportMessage: `${PREFIX}exportMessage`,
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')(({ theme }) => ({
  [`& .${classes.dialogContent}`]: {
    margin: 'auto',
    maxWidth: 768, // should be a decent medium-sized breakpoint
  },

  [`& .${classes.exportSnackBar}`]: {
    display: 'flex',
    justifyItems: 'center',
    alignItems: 'center',
    padding: '1rem',
    border: '2px solid',
    borderColor: theme.palette.success['600'],
    borderRadius: '5px',
    backgroundColor: theme.palette.success['200'],
  },

  [`& .${classes.exportMessage}`]: {
    marginRight: '0.5rem',
  },
}));

type ExportStatusProps = {
  loading: boolean;
  link: string | null;
};

export function WorkDayDialog({ personFullName, open, code, onComplete }) {
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
            sheets: res.sheets.map((s) => ({
              name: s.name,
              fileReference: s.file,
            })),
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
      sheets: it.sheets.map((s) => ({
        name: s.name,
        file: s.fileReference,
      })),
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
    code && UserAuthorityUtil.hasAuthority('WorkDayAuthority.ADMIN')
      ? async () => {
          setExportLink({ loading: true, link: null });
          const response = await ExportClient().exportWorkday(code);
          setExportLink({ loading: false, link: response.link });
          setProcessing(true);
        }
      : null;

  const headline = UserAuthorityUtil.hasAuthority('WorkDayAuthority.ADMIN')
    ? `Create Workday | ${personFullName}`
    : 'Create Workday';

  function clearExportLink() {
    setExportLink({
      loading: false,
      link: null,
    });
  }

  return (
    <Root>
      <Dialog
        open={open}
        onClose={handleClose}
        // TransitionComponent={TransitionSlider}
        maxWidth="lg"
        fullWidth
      >
        <DialogHeader
          icon={<WorkIcon />}
          headline={headline}
          subheadline="Add your workday."
          onClose={handleClose}
        />
        <DialogBody>
          <UserAuthorityUtil has={'WorkDayAuthority.ADMIN'}>
            <Box my="1rem">
              <Typography variant={'h5'} component={'h2'}>
                {personFullName}
              </Typography>
            </Box>
          </UserAuthorityUtil>
          {state && <WorkDayForm value={state} onSubmit={handleSubmit} />}
        </DialogBody>
        <Divider />
        <DialogFooter
          formId={WORKDAY_FORM_ID}
          onClose={handleClose}
          onDelete={handleDeleteOpen}
          onExport={handleExport}
          disableDelete={
            !UserAuthorityUtil.hasAuthority('WorkDayAuthority.ADMIN') &&
            state &&
            state.status !== 'REQUESTED'
          }
          disableEdit={
            !UserAuthorityUtil.hasAuthority('WorkDayAuthority.ADMIN') &&
            state &&
            state.status !== 'REQUESTED'
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
    </Root>
  );
}

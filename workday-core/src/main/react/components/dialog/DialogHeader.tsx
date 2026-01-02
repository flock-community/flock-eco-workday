import Close from '@mui/icons-material/Close';
import { Button, DialogTitle, Typography } from '@mui/material';
import DialogContent from '@mui/material/DialogContent';
import { styled } from '@mui/material/styles';
import type React from 'react';

const PREFIX = 'DialogHeader';

const classes = {
  root: `${PREFIX}Root`,
  closeBtn: `${PREFIX}CloseBtn`,
  dialogTitle: `${PREFIX}dialogTitle`,
  dialogContent: `${PREFIX}dialogContent`,
  iconWrapper: `${PREFIX}iconWrapper`,
  titleText: `${PREFIX}TitleText`,
};

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  [`&.${classes.root}`]: {
    margin: 0,
    padding: theme.spacing(2),
  },
  [`& .${classes.closeBtn}`]: {
    alignSelf: 'start',
    marginLeft: 'auto',
    minWidth: 'unset', // override material button property
  },
  [`& .${classes.dialogTitle}`]: {
    alignItems: 'center',
    display: 'flex',
  },
  [`& .${classes.iconWrapper}`]: {
    '& > svg': {
      height: 40,
      width: 40,
    },
  },
  [`& .${classes.titleText}`]: {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: '1rem',
  },
}));

const StyledDiv = styled('div')(({ theme }) => ({
  [`&.${classes.dialogContent}`]: {
    paddingTop: '10px',
    paddingBottom: '10px',
    marginTop: '10px',
    marginBottom: '10px',
  },
}));

type DialogHeaderProps = {
  icon?: React.ReactNode;
  headline?: string;
  subheadline?: string;
  onClose: () => void;
};

type DialogBodyProps = {
  children: React.ReactNode | React.ReactNode[];
};

export const DialogHeader = (props: DialogHeaderProps) => {
  const { icon, headline, subheadline, onClose } = props;

  return (
    <StyledDialogTitle className={classes.root}>
      <div className={classes.dialogTitle}>
        <div className={classes.iconWrapper}>{icon}</div>
        <div className={classes.titleText}>
          <Typography variant="body1">{headline}</Typography>
          <Typography variant="caption">{subheadline}</Typography>
        </div>
        <Button className={classes.closeBtn} onClick={onClose}>
          <Close />
        </Button>
      </div>
    </StyledDialogTitle>
  );
};

export const DialogBody = (props: DialogBodyProps) => {
  return (
    <StyledDiv className={classes.dialogContent}>
      <DialogContent>{props.children}</DialogContent>
    </StyledDiv>
  );
};

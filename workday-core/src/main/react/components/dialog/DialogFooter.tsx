import { Box, Button, DialogActions } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';

type DialogFooterProps = {
  formId: string;
  onClose: () => void;
  onSubmit?: (() => void) | null;
  onDelete?: () => void;
  onExport?: () => void;
  disableDelete?: boolean;
  disableEdit?: boolean;
  processingExport?: boolean;
  processing?: boolean;
};

export function DialogFooter({
  formId,
  onClose,
  onSubmit = null,
  onDelete,
  onExport,
  disableDelete = false,
  disableEdit = false,
  processingExport = false,
  processing = false,
}: DialogFooterProps) {
  return (
    <DialogActions>
      {onExport && (
        <Button disabled={processing || processingExport} onClick={onExport}>
          {!processingExport ? (
            <img
              width="16px"
              height="16xpx"
              src="/images/googleDriveIcon.svg"
              alt="Google Drive"
            />
          ) : (
            <CircularProgress color={'secondary'} size={'20px'} />
          )}
          <Box ml="0.5rem">Export</Box>
        </Button>
      )}
      <Button onClick={onClose} disabled={processing}>
        Cancel
      </Button>
      {onDelete && !disableDelete && (
        <Button onClick={onDelete} disabled={processing}>
          Delete
        </Button>
      )}
      {!disableEdit && (
        <Button
          type="submit"
          form={formId}
          color="primary"
          onClick={onSubmit}
          variant="contained"
          disabled={processing}
        >
          Save
        </Button>
      )}
    </DialogActions>
  );
}

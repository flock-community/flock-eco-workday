import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { AlignedLoader } from '@workday-core/components/AlignedLoader';
import { ConfirmDialog } from '@workday-core/components/ConfirmDialog';
import { useState } from 'react';
import { type Logo, LogoClient } from '../../clients/LogoClient';
import { apiErrorMessage } from '../../clients/util/ApiErrorMessage';
import { useLoginStatus } from '../../hooks/StatusHook';
import { LogoDialog } from './LogoDialog';
import { useLogos } from './logos';

/**
 * The company logos everybody shares for the assignments on their CVs. Whoever writes
 * CVs adds logos; a CV admin renames, replaces and deletes them.
 */
export function LogosPage() {
  const [logos, reload] = useLogos();
  const status = useLoginStatus();
  const isAdmin = status?.authorities?.includes('CvAuthority.ADMIN') ?? false;
  const [dialog, setDialog] = useState<{ open: boolean; logo?: Logo }>({
    open: false,
  });
  const [deleting, setDeleting] = useState<Logo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    if (!deleting) return;
    LogoClient.delete(deleting.id)
      .then(reload)
      .catch((err) =>
        setError(apiErrorMessage(err, 'The logo could not be deleted')),
      )
      .finally(() => setDeleting(null));
  };

  return (
    <Box sx={{ pb: 6 }}>
      <Stack direction="row" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          Logos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialog({ open: true })}
        >
          Add logo
        </Button>
      </Stack>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Company logos to show with the assignments on a CV. Everybody shares
        them.
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {logos == null && <AlignedLoader />}
      {logos?.length === 0 && (
        <Typography color="text.secondary">No logos yet.</Typography>
      )}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 2,
        }}
      >
        {logos?.map((logo) => (
          <Card key={logo.id} data-testid="logo-card">
            <CardContent>
              <Box
                sx={{
                  height: 90,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 1.5,
                  bgcolor: '#fffdf5',
                  borderRadius: 1,
                }}
              >
                <Box
                  component="img"
                  src={LogoClient.imageUrl(logo)}
                  alt={logo.name}
                  sx={{ maxHeight: 72, maxWidth: '90%', objectFit: 'contain' }}
                />
              </Box>
              <Typography variant="subtitle1" noWrap title={logo.name}>
                {logo.name}
              </Typography>
            </CardContent>
            {isAdmin && (
              <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                <Tooltip title="Change">
                  <IconButton
                    aria-label={`Change ${logo.name}`}
                    onClick={() => setDialog({ open: true, logo })}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton
                    aria-label={`Delete ${logo.name}`}
                    onClick={() => setDeleting(logo)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </CardActions>
            )}
          </Card>
        ))}
      </Box>
      <LogoDialog
        open={dialog.open}
        logo={dialog.logo}
        onClose={() => setDialog({ open: false })}
        onSaved={() => {
          setDialog({ open: false });
          reload();
        }}
      />
      <ConfirmDialog
        open={deleting != null}
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
      >
        <Typography>
          Delete the logo of {deleting?.name}? The CVs that show it will show no
          logo for those assignments.
        </Typography>
      </ConfirmDialog>
    </Box>
  );
}

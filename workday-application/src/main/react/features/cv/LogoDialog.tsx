import ImageIcon from '@mui/icons-material/Image';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { type ChangeEvent, useEffect, useState } from 'react';
import { fileToBase64, type Logo, LogoClient } from '../../clients/LogoClient';
import { apiErrorMessage } from '../../clients/util/ApiErrorMessage';

type LogoDialogProps = {
  open: boolean;
  /** The logo to change; leave out to add one. */
  logo?: Logo;
  /** The name to start with when adding, e.g. the client of the assignment. */
  suggestedName?: string;
  onClose: () => void;
  onSaved: (logo: Logo) => void;
};

/** Adds a logo to the shared collection, or renames it and replaces its image. */
export function LogoDialog({
  open,
  logo,
  suggestedName,
  onClose,
  onSaved,
}: LogoDialogProps) {
  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(logo?.name ?? suggestedName ?? '');
    setFile(null);
    setPreview(logo ? LogoClient.imageUrl(logo) : null);
    setError(null);
  }, [open, logo, suggestedName]);

  // The preview of a chosen file lives until another one is chosen
  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files?.[0] ?? null);
  };

  const handleSave = async () => {
    setError(null);
    if (!name.trim()) return setError('Name is required');
    if (!logo && !file) return setError('Choose an image');
    setSaving(true);
    try {
      const image = file ? await fileToBase64(file) : undefined;
      const body = { name: name.trim(), image };
      const saved = logo
        ? await LogoClient.update(logo.id, body)
        : await LogoClient.create(body);
      onSaved(saved);
    } catch (err) {
      setError(apiErrorMessage(err, 'The logo could not be saved'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{logo ? 'Change logo' : 'Add a logo'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            helperText="The company, as on the CVs: ING, Bol.com, ..."
            autoFocus
            fullWidth
          />
          <Box
            sx={{
              height: 120,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              bgcolor: '#fffdf5',
            }}
          >
            {preview ? (
              <Box
                component="img"
                src={preview}
                alt="Logo preview"
                sx={{ maxHeight: 96, maxWidth: '90%', objectFit: 'contain' }}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                No image yet
              </Typography>
            )}
          </Box>
          <Button
            component="label"
            variant="outlined"
            startIcon={<ImageIcon />}
          >
            {logo ? 'Replace image' : 'Choose image'}
            <input
              hidden
              type="file"
              aria-label="Logo image"
              accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml"
              onChange={handleFile}
            />
          </Button>
          <Typography variant="caption" color="text.secondary">
            PNG, JPEG, GIF, WebP or SVG, at most 512 KB. Logos are shared:
            everybody can use them on their CV.
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { ConfirmDialog } from '@workday-core/components/ConfirmDialog';
import { useEffect, useState } from 'react';
import {
  ApiKeyClient,
  type ApiKeyAccount,
  type GeneratedKey,
} from '../../clients/ApiKeyClient';
import { useUserMe } from '../../hooks/UserMeHook';

export function ProfileFeature() {
  const [user] = useUserMe();
  const [keys, setKeys] = useState<ApiKeyAccount[]>([]);
  const [refresh, setRefresh] = useState(false);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [newKey, setNewKey] = useState<GeneratedKey | null>(null);
  const [revokeKey, setRevokeKey] = useState<ApiKeyAccount | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    ApiKeyClient.fetchMyKeys().then(setKeys);
  }, [refresh]);

  const handleGenerate = () => {
    ApiKeyClient.generateKey(label).then((key) => {
      setGenerateOpen(false);
      setLabel('');
      setNewKey(key);
      setRefresh(!refresh);
    });
  };

  const handleRevoke = () => {
    if (revokeKey) {
      ApiKeyClient.revokeKey(revokeKey.id).then(() => {
        setRevokeKey(null);
        setRefresh(!refresh);
      });
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Box
      className={'flow'}
      flow-gap={'wide'}
      style={{ paddingBottom: '1.5rem' }}
    >
      <Card>
        <CardHeader title="Profile" />
        <CardContent>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell
                  component="th"
                  sx={{ fontWeight: 'bold', width: 120 }}
                >
                  Name
                </TableCell>
                <TableCell>{user?.name}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th" sx={{ fontWeight: 'bold' }}>
                  Email
                </TableCell>
                <TableCell>{user?.email}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          title="API Keys"
          subheader="Manage API keys for external automation"
          action={
            <Button onClick={() => setGenerateOpen(true)}>
              <AddIcon /> Generate
            </Button>
          }
        />
        <CardContent>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Label</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {keys.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3}>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        align="center"
                      >
                        No API keys yet
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
                {keys.map((k) => (
                  <TableRow key={k.id}>
                    <TableCell>{k.label}</TableCell>
                    <TableCell>{k.created}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Revoke key">
                        <IconButton
                          size="small"
                          onClick={() => setRevokeKey(k)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" color="textSecondary">
              Use your API key by including it in the Authorization header:
            </Typography>
            <Box
              component="code"
              sx={{ display: 'block', mt: 1, fontFamily: 'monospace' }}
            >
              Authorization: TOKEN &lt;your-key&gt;
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Generate Key Dialog */}
      <Dialog
        open={generateOpen}
        onClose={() => setGenerateOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Generate API Key</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Label"
            placeholder="e.g. CI Pipeline, Zapier"
            fullWidth
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGenerateOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleGenerate}
            disabled={!label.trim()}
          >
            Generate
          </Button>
        </DialogActions>
      </Dialog>

      {/* New Key Display Dialog */}
      <Dialog
        open={newKey !== null}
        onClose={() => setNewKey(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>API Key Generated</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Copy your key now. It will not be shown again.
          </Alert>
          <DialogContentText sx={{ mb: 1 }}>
            <strong>{newKey?.label}</strong>
          </DialogContentText>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              p: 1.5,
              bgcolor: 'grey.100',
              borderRadius: 1,
              fontFamily: 'monospace',
              wordBreak: 'break-all',
            }}
          >
            {newKey?.key}
            <Tooltip title={copied ? 'Copied!' : 'Copy to clipboard'}>
              <IconButton
                size="small"
                onClick={() => newKey?.key && handleCopy(newKey.key)}
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => setNewKey(null)}>
            Done
          </Button>
        </DialogActions>
      </Dialog>

      {/* Revoke Confirmation Dialog */}
      <ConfirmDialog
        open={revokeKey !== null}
        onConfirm={handleRevoke}
        onClose={() => setRevokeKey(null)}
      >
        <Typography>
          Are you sure you want to revoke the API key &apos;{revokeKey?.label}
          &apos;? Any integrations using this key will stop working.
        </Typography>
      </ConfirmDialog>
    </Box>
  );
}

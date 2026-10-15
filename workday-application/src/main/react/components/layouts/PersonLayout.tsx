import { Box, Card, CardContent } from '@mui/material';
import Typography from '@mui/material/Typography';
import UserAuthorityUtil from '@workday-user/user_utils/UserAuthorityUtil';
import type { ReactNode } from 'react';
import { usePerson } from '../../hooks/PersonHook';
import { PersonSelector } from '../selector';

type PageProps = {
  requireAuthority: string;
  children: any;
  actions?: ReactNode;
  /** Extra class on the root, for page specific (print) styles. */
  className?: string;
  /** Instead of switching to the picked person here, such as by following a link. */
  onChangePerson?: (personId: string) => void;
};

export default function PersonLayout({
  requireAuthority,
  children,
  actions,
  className,
  onChangePerson,
}: PageProps) {
  const [person, setPerson] = usePerson();

  const handleChangePerson = (personId) => {
    if (!personId) return;
    if (onChangePerson) onChangePerson(personId);
    else setPerson(personId);
  };

  return (
    <Box
      className={['full-width content-grid', className]
        .filter(Boolean)
        .join(' ')}
    >
      <UserAuthorityUtil has={requireAuthority}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <PersonSelector
                  value={person?.uuid}
                  onChange={handleChangePerson}
                  label="Select person"
                  embedded
                  multiple={false}
                  fullWidth
                />
              </Box>
              {actions}
            </Box>
          </CardContent>
        </Card>
      </UserAuthorityUtil>
      <Box
        className={'flow'}
        flow-gap={'wide'}
        style={{ paddingBottom: '1.5rem' }}
      >
        {person ? (
          children(person, setPerson)
        ) : (
          <Typography variant="caption">No person selected</Typography>
        )}
      </Box>
    </Box>
  );
}

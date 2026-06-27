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
};

export default function PersonLayout({
  requireAuthority,
  children,
  actions,
}: PageProps) {
  const [person, setPerson] = usePerson();

  const handleChangePerson = (personId) => {
    if (personId) setPerson(personId);
  };

  return (
    <Box className={'full-width content-grid'}>
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
          children(person)
        ) : (
          <Typography variant="caption">No person selected</Typography>
        )}
      </Box>
    </Box>
  );
}

import { Box } from '@mui/material';
import Typography from '@mui/material/Typography';
import UserAuthorityUtil from '@workday-user/user_utils/UserAuthorityUtil';
import { usePerson } from '../../hooks/PersonHook';
import { PersonSelector } from '../selector';

type PageProps = {
  requireAuthority: string;
  children: any;
};

export default function PersonLayout({
  requireAuthority,
  children,
}: PageProps) {
  const [person, setPerson] = usePerson();

  const handleChangePerson = (personId) => {
    if (personId) setPerson(personId);
  };

  return (
    <Box className={'full-width content-grid'}>
      <UserAuthorityUtil has={requireAuthority}>
        <PersonSelector
          value={person?.uuid}
          onChange={handleChangePerson}
          label="Select person"
          embedded={false}
          multiple={false}
          fullWidth
        />
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

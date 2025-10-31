import React from "react";
import UserAuthorityUtil from "@workday-user/user_utils/UserAuthorityUtil";
import { PersonSelector } from "../selector";
import { Box } from "@material-ui/core";
import { usePerson } from "../../hooks/PersonHook";
import Typography from "@material-ui/core/Typography";

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
    <Box className={"full-width content-grid"}>
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
        className={"flow"}
        flow-gap={"wide"}
        style={{ paddingBottom: "1.5rem" }}
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

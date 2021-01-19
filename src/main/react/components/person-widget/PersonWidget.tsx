import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import {
  Card,
  CardHeader,
  Avatar,
  CardActions,
  Typography,
  IconButton,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { blue } from "@material-ui/core/colors";
import FavoriteIcon from "@material-ui/icons/Favorite";
import InboxIcon from "@material-ui/icons/Inbox";
import DraftsIcon from "@material-ui/icons/Drafts";
import FaceIcon from "@material-ui/icons/Face";

type PersonWidgetProps = {
  person: any;
};
export function PersonWidget({ person }: PersonWidgetProps) {
  return (
    <Card>
      <Box p={2} textAlign={"right"}>
        <Chip
          icon={<FaceIcon />}
          color="primary"
          label="Full-Stack Developer"
          variant="outlined"
          size="small"
        />
      </Box>
      <CardHeader
        avatar={<Avatar aria-label="recipe">WF</Avatar>}
        title={`${person.firstname} ${person.lastname}`}
        subheader={person.email}
      />
      <Divider />
      <Box p={2}>
        <Box>
          <Typography variant="caption">Organization</Typography>
          <Typography variant="body2">Flock.community</Typography>
        </Box>
        <Box>
          <Typography variant="caption">Status</Typography>
          <Chip
            color="default"
            disabled
            label="disabled"
            variant="default"
            size="small"
          />
        </Box>
      </Box>
    </Card>
  );
}

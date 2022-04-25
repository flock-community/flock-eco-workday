import { useHistory } from "react-router-dom";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import React, { useState } from "react";
import ListItemText from "@material-ui/core/ListItemText";
import ListItem from "@material-ui/core/ListItem";
import { OverridableComponent } from "@material-ui/core/OverridableComponent";
import { Collapse, SvgIconTypeMap } from "@material-ui/core";
import { ExpandLess, ExpandMore } from "@material-ui/icons";
import List from "@material-ui/core/List";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  nested: {
    paddingLeft: theme.spacing(1),
  },
}));

type Item = {
  name: string;
  icon: OverridableComponent<SvgIconTypeMap>;
  url: string;
};

type Folder = {
  name: string;
  icon: OverridableComponent<SvgIconTypeMap>;
  items: Item[];
};

type ApplicationMenuItemProps = {
  item: Item | Folder;
  handleClose: () => void;
};

export default function ApplicationMenuItem({
  item,
  handleClose,
}: ApplicationMenuItemProps) {
  const history = useHistory();
  const [open, setOpen] = useState(false);

  const classes = useStyles();

  const handleClickItem = (item: Item) => () => {
    handleClose();
    history.push(item.url);
  };

  const handleClickFolder = () => setOpen(!open);

  const handleFolderExpanded = (node: HTMLElement) => node.scrollIntoView();

  if (!("items" in item)) {
    return (
      <ListItem button key={item.name} onClick={handleClickItem(item)}>
        <ListItemIcon>{React.createElement(item.icon)}</ListItemIcon>
        <ListItemText primary={item.name} />
      </ListItem>
    );
  }

  return (
    <>
      <ListItem button onClick={handleClickFolder}>
        <ListItemIcon>{React.createElement(item.icon)}</ListItemIcon>
        <ListItemText primary={item.name} />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse
        in={open}
        timeout={0} // This has to be 0 for the scrolling to work
        unmountOnExit
        addEndListener={handleFolderExpanded}
      >
        <List component="div" disablePadding className={classes.nested}>
          {item.items.map((subItem) => (
            <ApplicationMenuItem
              key={`${item.name}-${subItem.name}`}
              item={subItem}
              handleClose={handleClose}
            />
          ))}
        </List>
      </Collapse>
    </>
  );
}

import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { Collapse, type SvgIconTypeMap } from '@mui/material';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import type { OverridableComponent } from '@mui/material/OverridableComponent';
import { styled } from '@mui/material/styles';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

const PREFIX = 'ApplicationMenuItem';

const classes = {
  nested: `${PREFIX}Nested`,
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')(({ theme }) => ({
  [`& .${classes.nested}`]: {
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

  const handleClickItem = (item: Item) => () => {
    handleClose();
    history.push(item.url);
  };

  const handleClickFolder = () => setOpen(!open);

  const handleFolderExpanded = (node: HTMLElement) => node.scrollIntoView();

  if (!('items' in item)) {
    return (
      <ListItemButton key={item.name} onClick={handleClickItem(item)}>
        <ListItemIcon>{React.createElement(item.icon)}</ListItemIcon>
        <ListItemText primary={item.name} />
      </ListItemButton>
    );
  }

  return (
    <Root>
      <ListItemButton onClick={handleClickFolder}>
        <ListItemIcon>{React.createElement(item.icon)}</ListItemIcon>
        <ListItemText primary={item.name} />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
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
    </Root>
  );
}

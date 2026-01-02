import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import React from 'react';

// Types
import type { GroupedTodos, TypeProp } from '../../types';

const PREFIX = 'SimpleTabs';

const classes = {
  root: `${PREFIX}Root`,
};

const Root = styled('div')(({ theme }) => ({
  [`& .${classes.root}`]: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
}));

type TabPanelProps = {
  children?: React.ReactNode;
  value: number;
  index: number;
};

const TabPanel = ({ children, value, index, ...other }: TabPanelProps) => {
  return (
    <Root role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <>{children}</>}
    </Root>
  );
};

type simpleTabsProps = {
  data: GroupedTodos[];
  renderFunction: Function;
  exposedValue?: Function;
};

export const SimpleTabs = ({
  data,
  renderFunction,
  exposedValue,
}: simpleTabsProps) => {
  const [value, setValue] = React.useState(0);
  const categories = data.map((item) => item.todoType);

  const handleChange = (
    _event: any,
    newValue: React.SetStateAction<number>,
  ) => {
    setValue(newValue);

    exposedValue?.(newValue);
  };

  const getCategoryLabel = (category: TypeProp) => {
    return category.replaceAll('_', ' ');
  };

  return (
    <div className={classes.root}>
      <Tabs value={value} onChange={handleChange}>
        {categories.map((category) => {
          return <Tab key={category} label={getCategoryLabel(category)} />;
        })}
      </Tabs>
      {categories.map((category, index) => {
        const selectedTab = data?.find(
          (tabPanel) => tabPanel.todoType === category,
        );

        return (
          <TabPanel key={category} value={value} index={index}>
            <Grid container spacing={1}>
              {selectedTab?.todos.map((item, index) => {
                return renderFunction(item, index);
              })}
            </Grid>
          </TabPanel>
        );
      })}
    </div>
  );
};

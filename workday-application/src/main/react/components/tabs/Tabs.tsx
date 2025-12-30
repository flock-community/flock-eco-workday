import React from "react";
import makeStyles from "@mui/styles/makeStyles";
import { Theme } from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

// Types
import { GroupedTodos, TypeProp } from "../../types";

type TabPanelProps = {
  children?: React.ReactNode;
  value: number;
  index: number;
};

const TabPanel = ({ children, value, index, ...other }: TabPanelProps) => {
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <>{children}</>}
    </div>
  );
};

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
}));

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
  const classes = useStyles();
  const [value, setValue] = React.useState(0);
  const categories = data.map((item) => item.todoType);

  const handleChange = (event: any, newValue: React.SetStateAction<number>) => {
    setValue(newValue);

    exposedValue && exposedValue(newValue);
  };

  const getCategoryLabel = (category: TypeProp) => {
    return category.replaceAll("_", " ");
  };

  return (
    <div className={classes.root}>
      <Tabs value={value} onChange={handleChange}>
        {categories.map((category, index) => {
          return <Tab key={index} label={getCategoryLabel(category)} />;
        })}
      </Tabs>
      {categories.map((category, index) => {
        const selectedTab =
          data && data.find((tabPanel) => tabPanel.todoType === category);

        return (
          <TabPanel key={index} value={value} index={index}>
            <Grid container spacing={1}>
              {selectedTab &&
                selectedTab.todos.map((item, index) => {
                  return renderFunction(item, index);
                })}
            </Grid>
          </TabPanel>
        );
      })}
    </div>
  );
};

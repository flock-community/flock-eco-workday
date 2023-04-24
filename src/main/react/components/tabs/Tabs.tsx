import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";

// types
import type { TodoItemProps } from "../../features/todo/TodoList";

const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <>{children}</>}
    </div>
  );
};

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

const a11yProps = (index: number) => {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
};

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
}));

type tabItem = {
  type: string;
  items: TodoItemProps[];
};

type simpleTabsProps = {
  data: tabItem[];
  renderFunction: Function;
};

export const SimpleTabs = ({ data, renderFunction }: simpleTabsProps) => {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);
  const categories = data.map((item) => item.type);

  const handleChange = (event: any, newValue: React.SetStateAction<number>) => {
    setValue(newValue);
  };

  return (
    <div className={classes.root}>
      <Tabs value={value} onChange={handleChange}>
        {categories.map((category, index) => {
          return <Tab key={index} label={category} {...a11yProps(index)} />;
        })}
      </Tabs>
      {categories.map((category, index) => {
        const selectedTab =
          data && data.find((tabPanel) => tabPanel.type === category);

        return (
          <TabPanel key={index} value={value} index={index}>
            <Grid container spacing={1}>
              {selectedTab &&
                selectedTab.items.map((item, index) => {
                  return renderFunction(item, index);
                })}
            </Grid>
          </TabPanel>
        );
      })}
    </div>
  );
};

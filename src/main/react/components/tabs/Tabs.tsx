import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";

// Types
import { GroupedItemProps } from "../../types";

const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <>{children}</>}
    </div>
  );
};

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
}));

type simpleTabsProps = {
  data: GroupedItemProps[];
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
  const categories = data.map((item) => item.type);

  const handleChange = (event: any, newValue: React.SetStateAction<number>) => {
    setValue(newValue);

    exposedValue && exposedValue(newValue);
  };

  return (
    <div className={classes.root}>
      <Tabs value={value} onChange={handleChange}>
        {categories.map((category, index) => {
          return <Tab key={index} label={category} />;
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

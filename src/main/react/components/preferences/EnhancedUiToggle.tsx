import React, { useState, useEffect } from 'react';
import { Switch, FormControlLabel, Tooltip } from '@material-ui/core';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import { makeStyles } from '@material-ui/core/styles';
import { isEnhancedUiEnabled, setEnhancedUiEnabled } from '../../utils/UiPreferences';

const useStyles = makeStyles((theme) => ({
  toggleContainer: {
    display: 'flex',
    alignItems: 'center',
    marginLeft: theme.spacing(2),
  },
  helpIcon: {
    marginLeft: theme.spacing(1),
    fontSize: '1rem',
    color: theme.palette.text.secondary,
    cursor: 'help',
  },
}));

interface EnhancedUiToggleProps {
  /**
   * Optional callback triggered when the enhanced UI setting changes
   */
  onChange?: (enabled: boolean) => void;
  
  /**
   * Optional label to display next to the toggle (default: "Enhanced UI")
   */
  label?: string;
  
  /**
   * Optional tooltip text to display when hovering over the help icon
   */
  tooltipText?: string;
}

/**
 * A toggle component to enable/disable the enhanced UI features
 */
const EnhancedUiToggle: React.FC<EnhancedUiToggleProps> = ({
  onChange,
  label = "Enhanced UI",
  tooltipText = "Toggle enhanced UI features with modern layout and improved visualizations"
}) => {
  const classes = useStyles();
  const [enabled, setEnabled] = useState(false);
  
  // Initialize state from localStorage
  useEffect(() => {
    const storedValue = isEnhancedUiEnabled(false);
    setEnabled(storedValue);
  }, []);
  
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    setEnabled(newValue);
    setEnhancedUiEnabled(newValue);
    
    // Trigger callback if provided
    if (onChange) {
      onChange(newValue);
    }
  };
  
  return (
    <div className={classes.toggleContainer}>
      <FormControlLabel
        control={
          <Switch
            checked={enabled}
            onChange={handleChange}
            name="enhancedUiToggle"
            color="primary"
          />
        }
        label={label}
      />
      <Tooltip title={tooltipText} placement="top">
        <HelpOutlineIcon className={classes.helpIcon} />
      </Tooltip>
    </div>
  );
};

export default EnhancedUiToggle;

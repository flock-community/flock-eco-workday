import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  type FormControlProps,
  InputLabel,
  MenuItem,
  MenuList,
  type MenuListProps,
  Paper,
  type PaperProps,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import {
  createContext,
  forwardRef,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { type Person, PersonClient } from '../../clients/PersonClient';

// Slot components need a stable identity, so the footer of the dropdown (the
// inactive persons toggle) reaches them through context.
const DropdownFooterContext = createContext<ReactNode>(null);

// Paper slot of the autocomplete
const PaperWithFooter = forwardRef<HTMLDivElement, PaperProps>(
  function PaperWithFooter({ children, ...props }, ref) {
    const footer = useContext(DropdownFooterContext);
    return (
      <Paper ref={ref} {...props}>
        {children}
        {footer}
      </Paper>
    );
  },
);

// List slot of the select menu, the footer goes below the list in the menu's
// paper. The menu passes its ownerState to custom slots, which MenuList must
// not receive.
const MenuListWithFooter = forwardRef<
  HTMLUListElement,
  MenuListProps & { ownerState?: unknown }
>(function MenuListWithFooter({ ownerState: _ownerState, ...props }, ref) {
  const footer = useContext(DropdownFooterContext);
  return (
    <>
      <MenuList ref={ref} sx={{ outline: 0 }} {...props} />
      {footer}
    </>
  );
});

export type PersonSelectorProps = FormControlProps & {
  value?: string;
  onChange: (selected: any) => void;
  label?: string;
  embedded?: boolean;
  multiple?: boolean;
};

export function PersonSelector({
  value,
  onChange,
  label,
  embedded,
  multiple,
  ...props
}: PersonSelectorProps) {
  const [items, setItems] = useState<any>();
  const [state, setState] = useState<any>(value);
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    // Load inactive persons as well, so they can be shown on request and an
    // already selected inactive person still resolves to a name.
    PersonClient.findAllByPage({
      page: 0,
      size: 1000,
      sort: 'firstname',
    }).then((res) => setItems(res.list));
  }, []);

  useEffect(() => {
    setState(value);
  }, [value]);

  function handleChange(event) {
    const selected = event.target.value;
    setState(selected);
    onChange(selected);
  }

  function isSelected(uuid: string) {
    return Array.isArray(state) ? state.includes(uuid) : state === uuid;
  }

  // Inactive persons are hidden unless requested, but a selected inactive
  // person stays in the list so the current value keeps being displayed.
  const options: Person[] = (items || []).filter(
    (it: Person) => showInactive || it.active || isSelected(it.uuid),
  );

  function renderString(it: any) {
    return `${it.firstname} ${it.lastname}`;
  }

  function renderOptionLabel(item: Person) {
    return (
      <>
        {renderString(item)}
        {!item.active && (
          <Typography
            component="span"
            variant="caption"
            color="text.secondary"
            sx={{ ml: 1 }}
          >
            inactive
          </Typography>
        )}
      </>
    );
  }

  function renderValue(values: any) {
    if (!items) return '';
    if (values.length <= 3) {
      return values
        .map((uuid) => items.find((it) => it.uuid === uuid))
        .filter(Boolean)
        .map(renderString)
        .join(', ');
    } else {
      return `${values.length} persons selected`;
    }
  }

  function renderMenuItem(item: Person, key: number) {
    return (
      <MenuItem key={`person-selector-menu-item-${key}`} value={item.uuid}>
        {renderOptionLabel(item)}
      </MenuItem>
    );
  }

  const inactiveToggle = (
    <Box
      sx={{
        position: 'sticky',
        bottom: 0,
        p: 1,
        borderTop: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Button
        variant="text"
        size="small"
        // Keep the focus in the input, otherwise the autocomplete closes
        // before the click arrives
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => setShowInactive((it) => !it)}
      >
        {showInactive ? 'Hide inactive persons' : 'Show inactive persons'}
      </Button>
    </Box>
  );

  const singleInput = (
    <Autocomplete
      fullWidth
      size={props.size}
      slots={{ paper: PaperWithFooter }}
      options={options}
      getOptionLabel={renderString}
      renderOption={({ key, ...optionProps }, option) => (
        <li key={key} {...optionProps}>
          {renderOptionLabel(option)}
        </li>
      )}
      value={options.find((it) => it.uuid === state) ?? null}
      isOptionEqualToValue={(option, selected) => option.uuid === selected.uuid}
      onChange={(_event, option) => {
        const uuid = option?.uuid ?? '';
        setState(uuid);
        onChange(uuid);
      }}
      renderInput={(params) => (
        <TextField {...params} label={label} placeholder="Search person" />
      )}
    />
  );

  const multipleInput = (
    <FormControl fullWidth {...props}>
      <InputLabel shrink>{label}</InputLabel>
      <Select
        label={label}
        value={state || []}
        onChange={handleChange}
        displayEmpty
        renderValue={renderValue}
        MenuProps={{ slots: { list: MenuListWithFooter } }}
        multiple
      >
        {options.map(renderMenuItem)}
      </Select>
    </FormControl>
  );

  const selectInput = items && (multiple ? multipleInput : singleInput);

  return (
    <DropdownFooterContext.Provider value={inactiveToggle}>
      {embedded ? (
        <div>{selectInput}</div>
      ) : (
        <Card>
          <CardContent>{selectInput}</CardContent>
        </Card>
      )}
    </DropdownFooterContext.Provider>
  );
}

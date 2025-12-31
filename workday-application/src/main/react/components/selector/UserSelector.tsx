import React, { useEffect, useState } from "react";
import UserClient from "@workday-user/user/UserClient";
import { User } from "@workday-user/user/response/user";
import {
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";

type UserSelectorProps = {
  embedded?: boolean;
  onChange: (userId: string) => void;
  label?: string;
  selectedItem?: string;
};

export function UserSelector({
  embedded = false,
  onChange,
  label = "Select User",
  selectedItem = "",
}: UserSelectorProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selected, setSelected] = useState("");

  useEffect(() => {
    UserClient.findAllUsers("", 0, 100).then((res) => {
      setUsers(res.list);
      setSelected(selectedItem);
    });
  }, []);

  function handleChange(event) {
    // eslint-disable-next-line no-shadow
    const selected = event.target.value;
    setSelected(selected);
    onChange(selected);
  }

  const renderMenuItem = (user, key) => (
    <MenuItem key={`user-selector-menu-item-${key}`} value={user.id}>
      {user.name} &lt;{user.email}&gt;
    </MenuItem>
  );

  const selectInput = (
    <FormControl fullWidth>
      <InputLabel shrink>{label}</InputLabel>
      <Select
        label={label}
        value={selected || ""}
        displayEmpty
        onChange={handleChange}
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {users.map(renderMenuItem)}
      </Select>
    </FormControl>
  );

  return embedded ? (
    <div>{selectInput}</div>
  ) : (
    <Card>
      <CardContent>{selectInput}</CardContent>
    </Card>
  );
}

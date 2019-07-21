import React, {useState} from "react";
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';

export function HolidayUserSelector({users, onUserChange}) {

    const [selectedUser, setSelectedUser] = useState({});

    function renderSelect(users) {
        return (<div>
                <InputLabel>Selecteer Flocker</InputLabel>
                <Select value={selectedUser} onChange={handleChange}>
                    {users.map(function (user) {
                        return renderMenuItem(user)
                    })}
                </Select>
            </div>
        )
    }

    function renderMenuItem(user) {
        return (<MenuItem value={user} key={user.code}>{user.name}</MenuItem>)
    }

    function handleChange(event) {
        setSelectedUser(event.target.value);
        onUserChange(event.target.value)
    }

    return renderSelect(users)

}

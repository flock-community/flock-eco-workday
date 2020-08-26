"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var prop_types_1 = require("prop-types");
var core_1 = require("@material-ui/core");
var styles_1 = require("@material-ui/core/styles");
var UserAuthorityUtil_1 = require("@flock-community/flock-eco-feature-user/src/main/react/user_utils/UserAuthorityUtil");
var StatusMenu_1 = require("../../components/StatusMenu");
var useStyles = styles_1.makeStyles(function (theme) { return ({
    root: {
        position: "relative"
    },
    status: {
        position: "absolute",
        top: theme.spacing(2),
        right: theme.spacing(2)
    }
}); });
function WorkDayListItem(_a) {
    var value = _a.value, onClick = _a.onClick, onClickStatus = _a.onClickStatus, hasAuthority = _a.hasAuthority;
    var classes = useStyles();
    return (<core_1.Card onClick={onClick}>
      <core_1.CardContent className={classes.root}>
        <core_1.Typography variant="h6">
          {value.assignment.client.name} - {value.assignment.role}
        </core_1.Typography>
        <core_1.Typography>
          Period: {value.from.format("DD-MM-YYYY")} -{" "}
          {value.to.format("DD-MM-YYYY")}
        </core_1.Typography>
        <core_1.Typography>
          Aantal dagen: {value.to.diff(value.from, "days") + 1}
        </core_1.Typography>
        <core_1.Typography>Aantal uren: {value.hours}</core_1.Typography>
        <div className={classes.status}>
          <StatusMenu_1.StatusMenu onChange={onClickStatus} disabled={!UserAuthorityUtil_1.default.hasAuthority(hasAuthority)} value={value.status}/>
        </div>
      </core_1.CardContent>
    </core_1.Card>);
}
exports.WorkDayListItem = WorkDayListItem;
WorkDayListItem.propTypes = {
    value: prop_types_1.default.object,
    onClick: prop_types_1.default.func,
    onClickStatus: prop_types_1.default.func,
    hasAuthority: prop_types_1.default.string
};

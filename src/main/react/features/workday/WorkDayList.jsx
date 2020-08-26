"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var prop_types_1 = require("prop-types");
var core_1 = require("@material-ui/core");
var CardContent_1 = require("@material-ui/core/CardContent");
var Grid_1 = require("@material-ui/core/Grid");
var WorkDayClient_1 = require("../../clients/WorkDayClient");
var WorkDayListItem_1 = require("./WorkDayListItem");
function WorkDayList(_a) {
    var personCode = _a.personCode, refresh = _a.refresh, onClickRow = _a.onClickRow, onClickStatus = _a.onClickStatus;
    var _b = react_1.useState([]), state = _b[0], setState = _b[1];
    react_1.useEffect(function () {
        WorkDayClient_1.WorkDayClient.findAllByPersonCode(personCode).then(function (res) { return setState(res); });
    }, [personCode, refresh]);
    function renderItem(item, key) {
        return (<Grid_1.default key={"workday-list-item-" + key} item xs={12}>
        <WorkDayListItem_1.WorkDayListItem value={item} onClick={function (e) { return onClickRow(e, item); }} onClickStatus={function (status) { return onClickStatus(status, item); }} hasAuthority={"WorkDayAuthority.ADMIN"}/>
      </Grid_1.default>);
    }
    if (state.length === 0) {
        return (<core_1.Card>
        <CardContent_1.default>
          <core_1.Typography>No workdays</core_1.Typography>
        </CardContent_1.default>
      </core_1.Card>);
    }
    return (<Grid_1.default container spacing={1}>
      {state.map(renderItem)}
    </Grid_1.default>);
}
exports.WorkDayList = WorkDayList;
WorkDayList.propTypes = {
    refresh: prop_types_1.default.bool,
    personCode: prop_types_1.default.string,
    onClickRow: prop_types_1.default.func,
    onClickStatus: prop_types_1.default.func
};

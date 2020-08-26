"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var styles_1 = require("@material-ui/core/styles");
var Grid_1 = require("@material-ui/core/Grid");
var core_1 = require("@material-ui/core");
var WorkDayDialog_1 = require("./WorkDayDialog");
var WorkDayList_1 = require("./WorkDayList");
var selector_1 = require("../../components/selector");
var ApplicationContext_1 = require("../../application/ApplicationContext");
var FabButtons_1 = require("../../components/FabButtons");
var PersonHook_1 = require("../../hooks/PersonHook");
var WorkDayClient_1 = require("../../clients/WorkDayClient");
var useStyles = styles_1.makeStyles({
    root: {
        marginTop: 20
    }
});
/**
 * @return {null}
 */
function WorkDayFeature() {
    var classes = useStyles();
    var _a = PersonHook_1.usePerson(), person = _a[0], setPerson = _a[1];
    var _b = react_1.useState(false), refresh = _b[0], setRefresh = _b[1];
    var _c = react_1.useState(false), open = _c[0], setOpen = _c[1];
    var _d = react_1.useState(null), value = _d[0], setValue = _d[1];
    var authorities = react_1.useContext(ApplicationContext_1.ApplicationContext).authorities;
    function isSuperUser() {
        return authorities && authorities.includes("WorkDayAuthority.ADMIN");
    }
    function handleCompleteDialog() {
        setRefresh(!refresh);
        setOpen(false);
        setValue(null);
    }
    function handleClickAdd() {
        setValue(null);
        setOpen(true);
    }
    function handleClickRow(e, item) {
        setValue(item);
        setOpen(true);
    }
    function handlePersonChange(it) {
        setPerson(it);
    }
    function handleStatusChange(status, it) {
        WorkDayClient_1.WorkDayClient.put(it.code, __assign({}, it, { from: it.from.format("YYYY-MM-DD"), to: it.to.format("YYYY-MM-DD"), status: status, assignmentCode: it.assignment.code, days: it.days.length > 0 ? it.days : null }))
            .then(function () { return setRefresh(!refresh); });
    }
    return (<core_1.Container className={classes.root}>
      <Grid_1.default container spacing={1}>
        <Grid_1.default item xs={12}>
          {isSuperUser() && (<selector_1.PersonSelector value={person && person.code} onChange={handlePersonChange}/>)}
        </Grid_1.default>
        <Grid_1.default item xs={12}>
          <WorkDayList_1.WorkDayList personCode={person && person.code} onClickRow={handleClickRow} refresh={refresh} onClickStatus={handleStatusChange}/>
        </Grid_1.default>
      </Grid_1.default>
      <WorkDayDialog_1.WorkDayDialog open={open} code={value && value.code} value={value} onComplete={handleCompleteDialog}/>
      <FabButtons_1.AddActionFab color="primary" onClick={handleClickAdd}/>
    </core_1.Container>);
}
exports.WorkDayFeature = WorkDayFeature;
WorkDayFeature.propTypes = {};

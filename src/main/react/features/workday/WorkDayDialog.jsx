"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var prop_types_1 = require("prop-types");
var core_1 = require("@material-ui/core");
var styles_1 = require("@material-ui/core/styles");
var Work_1 = require("@material-ui/icons/Work");
var moment_1 = require("moment");
var ConfirmDialog_1 = require("@flock-community/flock-eco-core/src/main/react/components/ConfirmDialog");
var Typography_1 = require("@material-ui/core/Typography");
var UserAuthorityUtil_1 = require("@flock-community/flock-eco-feature-user/src/main/react/user_utils/UserAuthorityUtil");
var WorkDayClient_1 = require("../../clients/WorkDayClient");
var Slide_1 = require("../../components/transitions/Slide");
var dialog_1 = require("../../components/dialog");
var WorkDayForm_1 = require("./WorkDayForm");
var validation_1 = require("../../utils/validation");
var useStyles = styles_1.makeStyles(function () { return ({
    dialogContent: {
        margin: "auto",
        maxWidth: 768 // should be a decent medium-sized breakpoint
    }
}); });
function WorkDayDialog(_a) {
    var open = _a.open, code = _a.code, onComplete = _a.onComplete;
    var classes = useStyles();
    var _b = react_1.useState(false), openDelete = _b[0], setOpenDelete = _b[1];
    var _c = react_1.useState(null), state = _c[0], setState = _c[1];
    react_1.useEffect(function () {
        if (open) {
            if (code) {
                WorkDayClient_1.WorkDayClient.get(code).then(function (res) {
                    setState({
                        assignmentCode: res.assignment.code,
                        from: res.from,
                        to: res.to,
                        days: res.days,
                        hours: res.hours,
                        status: res.status,
                        sheets: res.sheets
                    });
                });
            }
            else {
                setState(WorkDayForm_1.schema.cast());
            }
        }
    }, [open, code]);
    var handleSubmit = function (it) {
        var body = {
            from: it.from.format(moment_1.HTML5_FMT.DATE),
            to: it.to.format(moment_1.HTML5_FMT.DATE),
            days: it.days ? it.days : null,
            hours: it.days
                ? it.days.reduce(function (acc, cur) { return acc + parseInt(cur, 10); }, 0)
                : it.hours,
            assignmentCode: it.assignmentCode,
            status: it.status,
            sheets: it.sheets
        };
        if (code) {
            WorkDayClient_1.WorkDayClient.put(code, body).then(function (res) {
                if (validation_1.isDefined(onComplete))
                    onComplete(res);
                setState(null);
            });
        }
        else {
            WorkDayClient_1.WorkDayClient.post(body).then(function (res) {
                if (validation_1.isDefined(onComplete))
                    onComplete(res);
                setState(null);
            });
        }
    };
    var handleDelete = function () {
        WorkDayClient_1.WorkDayClient.delete(code).then(function () {
            if (validation_1.isDefined(onComplete))
                onComplete();
            setOpenDelete(false);
        });
    };
    var handleDeleteOpen = function () {
        setOpenDelete(true);
    };
    var handleDeleteClose = function () {
        setOpenDelete(false);
    };
    var handleClose = function () {
        if (validation_1.isDefined(onComplete))
            onComplete();
    };
    return (<>
      <core_1.Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={Slide_1.TransitionSlider} TransitionProps={{ direction: "right" }}>
        <dialog_1.DialogHeader icon={<Work_1.default />} headline="Create Workday" subheadline="Add your workday." onClose={handleClose}/>
        <core_1.DialogContent className={classes.dialogContent}>
          {state && <WorkDayForm_1.WorkDayForm value={state} onSubmit={handleSubmit}/>}
        </core_1.DialogContent>
        <core_1.Divider />
        <dialog_1.DialogFooter formId={WorkDayForm_1.WORKDAY_FORM_ID} onClose={handleClose} onDelete={handleDeleteOpen} disableDelete={!UserAuthorityUtil_1.default.hasAuthority("WorkDayAuthority.ADMIN") &&
        state &&
        state.status !== "REQUESTED"} disableEdit={!UserAuthorityUtil_1.default.hasAuthority("WorkDayAuthority.ADMIN") &&
        state &&
        state.status !== "REQUESTED"}/>
      </core_1.Dialog>
      <ConfirmDialog_1.ConfirmDialog open={openDelete} onClose={handleDeleteClose} onConfirm={handleDelete}>
        <Typography_1.default>Are you sure you want to remove this workday.</Typography_1.default>
      </ConfirmDialog_1.ConfirmDialog>
    </>);
}
exports.WorkDayDialog = WorkDayDialog;
WorkDayDialog.propTypes = {
    open: prop_types_1.default.bool,
    code: prop_types_1.default.string,
    onComplete: prop_types_1.default.func
};

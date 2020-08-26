"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Yup = require("yup");
var formik_1 = require("formik");
var moment_1 = require("moment");
var Grid_1 = require("@material-ui/core/Grid");
var moment_2 = require("@date-io/moment");
var pickers_1 = require("@material-ui/pickers");
var Switch_1 = require("@material-ui/core/Switch");
var core_1 = require("@material-ui/core");
var formik_material_ui_1 = require("formik-material-ui");
var PropTypes = require("prop-types");
var UserAuthorityUtil_1 = require("@flock-community/flock-eco-feature-user/src/main/react/user_utils/UserAuthorityUtil");
var MenuItem_1 = require("@material-ui/core/MenuItem");
var PeriodInputField_1 = require("../../components/fields/PeriodInputField");
var validation_1 = require("../../utils/validation");
var PersonHook_1 = require("../../hooks/PersonHook");
var AssignmentSelectorField_1 = require("../../components/fields/AssignmentSelectorField");
var DatePickerField_1 = require("../../components/fields/DatePickerField");
var DropzoneAreaField_1 = require("../../components/fields/DropzoneAreaField");
exports.WORKDAY_FORM_ID = "work-day-form";
var now = moment_1.default();
exports.schema = Yup.object().shape({
    status: Yup.string()
        .required("Field required")
        .default("REQUESTED"),
    assignmentCode: Yup.string()
        .required("Assignment is required")
        .default(""),
    from: Yup.date()
        .required("From date is required")
        .default(now),
    to: Yup.date()
        .required("To date is required")
        .default(now),
    days: Yup.array().default([8]),
    hours: Yup.number(),
    sheets: Yup.array().default([])
});
/**
 * @return {null}
 */
function WorkDayForm(_a) {
    var value = _a.value, onSubmit = _a.onSubmit;
    var person = PersonHook_1.usePerson()[0];
    var _b = react_1.useState(false), daysSwitch = _b[0], setDaysSwitch = _b[1];
    react_1.useEffect(function () {
        if (value && value.days) {
            setDaysSwitch(value.days.length === 0);
        }
    }, [value]);
    var handleSubmit = function (data) {
        if (validation_1.isDefined(onSubmit))
            onSubmit({
                assignmentCode: data.assignmentCode,
                from: data.from,
                to: data.to,
                days: daysSwitch ? undefined : data.days,
                hours: data.hours,
                status: data.status,
                sheets: data.sheets
            });
    };
    var handleSwitchChange = function (ev) {
        setDaysSwitch(ev.target.checked);
    };
    var renderSwitch = (<Grid_1.default container alignItems="center" spacing={1}>
      <Grid_1.default item>
        <Switch_1.default checked={daysSwitch} onChange={handleSwitchChange}/>
      </Grid_1.default>
      <Grid_1.default item>
        <core_1.Typography>Hours only</core_1.Typography>
      </Grid_1.default>
    </Grid_1.default>);
    var renderFormHours = function () { return (<>
      <Grid_1.default item xs={6}>
        <DatePickerField_1.DatePickerField name="from" label="From" fullWidth/>
      </Grid_1.default>
      <Grid_1.default item xs={6}>
        <DatePickerField_1.DatePickerField name="to" label="To" fullWidth/>
      </Grid_1.default>
      <Grid_1.default item xs={12}>
        {renderSwitch}
      </Grid_1.default>
      <Grid_1.default item xs={12}>
        {daysSwitch ? (<formik_1.Field name="hours" type="number" label="Hours" fullWidth component={formik_material_ui_1.TextField}/>) : (<PeriodInputField_1.PeriodInputField name="days" from={value && value.from} to={value && value.to}/>)}
      </Grid_1.default>
    </>); };
    var renderForm = function () { return (<formik_1.Form id={exports.WORKDAY_FORM_ID}>
      <pickers_1.MuiPickersUtilsProvider utils={moment_2.default}>
        <Grid_1.default container spacing={1}>
          <Grid_1.default item xs={12}>
            <AssignmentSelectorField_1.AssignmentSelectorField fullWidth name="assignmentCode" label="Assignment" personCode={person.code}/>
          </Grid_1.default>
          {value && (<UserAuthorityUtil_1.default has={"WorkDayAuthority.ADMIN"}>
              <Grid_1.default item xs={12}>
                <formik_1.Field fullWidth type="text" name="status" label="Status" select variant="standard" component={formik_material_ui_1.TextField}>
                  <MenuItem_1.default value="REQUESTED">REQUESTED</MenuItem_1.default>
                  <MenuItem_1.default value="APPROVED">APPROVED</MenuItem_1.default>
                  <MenuItem_1.default value="REJECTED">REJECTED</MenuItem_1.default>
                </formik_1.Field>
              </Grid_1.default>
            </UserAuthorityUtil_1.default>)}
          <Grid_1.default item xs={12}>
            <hr />
          </Grid_1.default>
          {renderFormHours()}
          <Grid_1.default item xs={12}>
            <hr />
          </Grid_1.default>
          <Grid_1.default item xs={12}>
            <DropzoneAreaField_1.DropzoneAreaField name="sheets" endpoint="/api/workdays/sheets"/>
          </Grid_1.default>
        </Grid_1.default>
      </pickers_1.MuiPickersUtilsProvider>
    </formik_1.Form>); };
    return value ? (<formik_1.Formik enableReinitialize initialValues={value || exports.schema.cast()} onSubmit={handleSubmit} validationSchema={exports.schema} render={renderForm}/>) : null;
}
exports.WorkDayForm = WorkDayForm;
WorkDayForm.propTypes = {
    value: PropTypes.object,
    onSubmit: PropTypes.func,
    onChange: PropTypes.func,
    onSwitchChange: PropTypes.func,
    daysSwitch: PropTypes.func
};

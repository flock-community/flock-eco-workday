import 'package:flock_eco_holidays/day_off/day_off.dart';
import 'package:flock_eco_holidays/holiday/holiday.dart';
import 'package:flock_eco_holidays/holiday/holiday_input.dart';
import 'package:flock_eco_holidays/holiday/holiday_provider.dart';
import 'package:flock_eco_holidays/utils/date.dart';
import 'package:flock_eco_holidays/utils/iterable.dart';
import 'package:flutter/material.dart' hide MonthPicker;
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:badges/badges.dart';
import 'datepicker.dart';

class CreateHoliday extends StatelessWidget {
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Add Holiday"),
      ),
      body: CreateHolidayForm(),
    );
  }
}

class CreateHolidayForm extends StatefulWidget {
  @override
  CreateHolidayFormState createState() => CreateHolidayFormState();
}

class CreateHolidayFormState extends State<CreateHolidayForm> {
  var fromDate = DateTime.now();
  var toDate = DateTime.now();
  DateTime selectedDate = null;
  final formKey = GlobalKey<FormState>();
  Set<DayOff> daysOff = {};

  Map<DateTime, String> get dateLabels =>
      <DateTime, String>{for (var dayOff in daysOff) dayOff.date: dayOff.hours.toString()};

  TextEditingController controller = TextEditingController(text: '');

  @override
  Widget build(BuildContext context) {
    var holidays = Provider.of<HolidayProvider>(context);
    var scaffold = Scaffold.of(context);
    var navigator = Navigator.of(context);
    var theme = Theme.of(context);

    return Form(
      key: formKey,
      child: ListView(
        padding: EdgeInsets.all(16.0),
        children: [
          TextFormField(
            controller: controller,
            decoration: InputDecoration(
              labelText: 'Description',
            ),
            validator: (value) {
              if (value.isEmpty) {
                return 'Please enter a description for your holiday.';
              }
              return null;
            },
            style: theme.textTheme.display1.copyWith(fontSize: 20.0),
          ),
          DateTimePicker(
            labelText: 'From',
            selectedDate: fromDate,
            selectDate: (date) {
              setState(() {
                fromDate = withoutTime(date);
                daysOff = generateDayOffs();
                print(dateLabels);
              });
            },
          ),
          DateTimePicker(
            labelText: 'To',
            selectedDate: toDate,
            selectDate: (date) {
              setState(() {
                toDate = date;
                daysOff = generateDayOffs();
                print(daysOff);
                print(dateLabels);
              });
            },
          ),
          Column(
            children: <Widget>[
              Row(
                children: <Widget>[],
              )
            ],
          ),
          Container(
            height: 250,
            child: MonthPicker(
              dateLabels: dateLabels,
              firstDate: withoutTime(fromDate),
              lastDate: toDate,
              onChanged: (e) {
                setState(() {
                  selectedDate = e;
                });
              },
              selectedDate: selectedDate == null ? fromDate : selectedDate.isBefore(fromDate) ? fromDate : selectedDate,
            ),
          ),
          Padding(
            padding: EdgeInsets.symmetric(vertical: 16),
            child: RaisedButton(
              onPressed: () async {
                if (formKey.currentState.validate()) {
                  scaffold.showSnackBar(SnackBar(content: Text('Adding holiday...')));
                  await holidays.add(
                    HolidayInput(
                      description: controller.text,
                      from: withoutTime(fromDate),
                      to: withoutTime(toDate),
                    ),
                  );
                  navigator.pop();
                }
              },
              child: Text('Submit'),
            ),
          ),
        ],
      ),
    );
  }

  Set<DayOff> generateDayOffs() => naturals
      .map((i) => fromDate.add(Duration(days: i)))
      .map((day) => DayOff(
            date: day,
            hours: ([DateTime.saturday, DateTime.sunday].contains(day.weekday)) ? 0 : 8,
            type: DayType.HOLIDAY,
          ))
      .take(toDate.difference(fromDate).inDays + 2)
      .toSet();
}

class DateTimePicker extends StatelessWidget {
  const DateTimePicker({
    Key key,
    this.labelText,
    this.selectedDate,
    this.selectDate,
    this.firstDate,
    this.lastDate,
  }) : super(key: key);

  final DateTime firstDate;
  final DateTime lastDate;
  final String labelText;
  final DateTime selectedDate;
  final void Function(DateTime date) selectDate;

  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Expanded(
          flex: 4,
          child: InputDropdown(
            labelText: labelText,
            valueText: DateFormat.yMMMd().format(selectedDate),
            onPressed: () async {
              final DateTime picked = await showDatePicker(
                context: context,
                initialDate: selectedDate,
                firstDate: DateTime(2000),
                lastDate: DateTime(2100),
              );
              if (picked != null) selectDate(picked);
            },
          ),
        ),
      ],
    );
  }
}

class InputDropdown extends StatelessWidget {
  const InputDropdown({
    Key key,
    this.labelText,
    this.valueText,
    this.onPressed,
  }) : super(key: key);

  final String labelText;
  final String valueText;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onPressed,
      child: InputDecorator(
        decoration: InputDecoration(
          labelText: labelText,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            Text(valueText),
            Icon(
              Icons.arrow_drop_down,
            ),
          ],
        ),
      ),
    );
  }
}

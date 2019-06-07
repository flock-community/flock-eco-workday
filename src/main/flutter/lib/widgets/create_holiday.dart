import 'package:flock_eco_holidays/holiday/holiday.dart';
import 'package:flock_eco_holidays/holiday/holiday_provider.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
class CreateHoliday extends StatelessWidget {
  const CreateHoliday({
    Key key,
  }) : super(key: key);

  @override
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
  final formKey = GlobalKey<FormState>();

  TextEditingController controller = TextEditingController(text: '');
  @override
  Widget build(BuildContext context) {
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
            },
            style: Theme.of(context).textTheme.display1.copyWith(fontSize: 20.0),
          ),
          DateTimePicker(
            labelText: 'From',
            selectedDate: fromDate,
            selectDate: (date) {
              setState(() {
                print(date);
                fromDate = date;
              });
            },
          ),
          DateTimePicker(
            labelText: 'To',
            selectedDate: toDate,
            selectDate: (date) {
              setState(() {
                toDate = date;
              });
            },
          ),
          Padding(
            padding: EdgeInsets.symmetric(vertical: 16.0),
            child: RaisedButton(
              onPressed: () async {
                if (formKey.currentState.validate()) {
                  Scaffold.of(context).showSnackBar(SnackBar(content: Text('Adding holiday...')));
                  await Provider.of<HolidayProvider>(context).add(
                    Holiday(
                      name: controller.text,
                      fromDate: fromDate,
                      toDate: toDate,
                    ),
                  );
                  Navigator.of(context).pop();
                }
              },
              child: Text('Submit'),
            ),
          ),
        ],
      ),
    );
  }
}

class DateTimePicker extends StatelessWidget {
  const DateTimePicker({
    Key key,
    this.labelText,
    this.selectedDate,
    this.selectDate,
  }) : super(key: key);

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
                firstDate: DateTime(2015, 8),
                lastDate: DateTime(2101),
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

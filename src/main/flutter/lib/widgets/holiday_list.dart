import 'package:flock_eco_holidays/holiday/holiday_provider.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class HolidayList extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    var holidays = Provider.of<HolidayProvider>(context);
    return RefreshIndicator(
      onRefresh: () async {
        holidays.get();
      },
      child: ListView(
        children: <Widget>[
          for (var holiday in holidays.all)
            Dismissible(
              onDismissed: (_) async {
                await holidays.delete(holiday);
              },
              direction: DismissDirection.endToStart,
              key: Key(holidays.all.indexOf(holiday).toString()),
              child: ListTile(
                title: Text(holiday.description),
                leading: Icon(Icons.wb_sunny, color: Colors.orange[200]),
                subtitle: Text(holiday.formatHoliday()),
              ),
              background: Container(
                color: Colors.red,
              ),
              secondaryBackground: Container(
                color: Colors.red,
                child: Row(
                  children: [
                    Spacer(),
                    Padding(
                      padding: EdgeInsets.symmetric(horizontal: 20),
                      child: Icon(Icons.delete, color: Colors.white),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}

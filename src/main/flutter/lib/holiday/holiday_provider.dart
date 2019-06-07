import 'package:flock_eco_holidays/app.dart';
import 'package:flock_eco_holidays/holiday/holiday.dart';
import 'package:flutter/material.dart';

class HolidayProvider with ChangeNotifier {
  List<Holiday> _holidays;

  HolidayProvider(this._holidays);

  List<Holiday> get holidays => _holidays;

  set holidays(List<Holiday> holidays) {
    this._holidays = holidays;
    notifyListeners();
  }

  Future<void> add(Holiday holiday) async {
    var dbHoliday = await app.holidayService.add(holiday);
    holidays.add(dbHoliday);
    notifyListeners();
  }

  void delete(Holiday holiday) async {
    await app.holidayService.delete(holiday);
    holidays.remove(holiday);
    notifyListeners();
  }

  Future get() async {
    _holidays = await app.holidayService.get();
    notifyListeners();
  }
}

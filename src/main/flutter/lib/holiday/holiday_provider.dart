import 'package:flock_eco_holidays/app.dart';
import 'package:flock_eco_holidays/holiday/holiday.dart';
import 'package:flutter/material.dart';

class HolidayProvider with ChangeNotifier {
  HolidayProvider(this._holidays);

  List<Holiday> _holidays;

  List<Holiday> get all => _holidays;

  Future<void> get() async {
    _holidays = await app.holidayService.get();
    notifyListeners();
  }

  Future<void> add(Holiday holiday) async {
    var dbHoliday = await app.holidayService.add(holiday);
    _holidays.add(dbHoliday);
    notifyListeners();
  }

  Future<void> delete(Holiday holiday) async {
    await app.holidayService.delete(holiday);
    _holidays.remove(holiday);
    notifyListeners();
  }
}

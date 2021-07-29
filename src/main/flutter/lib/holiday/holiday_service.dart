import 'dart:convert';

import 'package:flock_eco_holidays/app.dart';
import 'package:flock_eco_holidays/holiday/holiday.dart';
import 'package:flock_eco_holidays/holiday/holiday_input.dart';
import 'package:uuid/uuid.dart';

class HolidayService {
  Future<List<Holiday>> get() async {
    var response = await app.request.get('holidays');
    print(response.body);
    var iterable = json.decode(response.body) as Iterable;
    return iterable.map((it) => Holiday.fromJson(it)).toList();
  }

  Future<Holiday> add(HolidayInput holiday) async {
    var response = await app.request.post('holidays', holiday);
    print(response.body);
    return Holiday.fromJson(json.decode(response.body));
  }

  Future<Holiday> delete(Holiday holiday) async {
    await app.request.delete('holidays/${holiday.id}');
    return holiday;
  }
}

class HolidayServiceMock implements HolidayService {
  List<Holiday> holidays = [];

  @override
  Future<Holiday> add(HolidayInput holiday) async {
//    var newHoliday = holiday.copy()..id = holidays.length + 1;
//    holidays.add(newHoliday);
//    return newHoliday;
  }

  @override
  Future<Holiday> delete(Holiday holiday) async {
    holidays = holidays.where((it) => it.id != holiday.id);
    return holiday;
  }

  @override
  Future<List<Holiday>> get() async {
    return holidays;
  }
}

import 'dart:convert';

import 'package:flock_eco_holidays/app.dart';
import 'package:flock_eco_holidays/holiday/holiday.dart';

const url = 'https://flock-community.appspot.com/api/';

class HolidayService {
  Future<List<Holiday>> get() async {
    var response = await app.request.get(url + 'holidays');
    var iterable = json.decode(response.body) as Iterable;
    return iterable.map((it) => Holiday.fromJson(it)).toList();
  }

  Future<Holiday> add(Holiday holiday) async {
    var response = await app.request.post(url + 'holidays', holiday);
    return Holiday.fromJson(json.decode(response.body));
  }

  Future<Holiday> delete(Holiday holiday) async {
    await app.request.delete(url + 'holidays/${holiday.id}');
    return holiday;
  }
}

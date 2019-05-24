import 'dart:convert';

import 'package:flock_eco_holidays/holiday.dart';
import 'package:flutter/material.dart';
import 'package:google_sign_in/google_sign_in.dart';
import "package:http/http.dart" as http;

const url = 'https://flock-community.appspot.com/api/';

class Api {
  GoogleSignInAccount currentUser;

  Future<List<Holiday>> allHolidays() async {
    var response = await http.get(url + 'holidays', headers: await currentUser.authHeaders);
    return json.decode(response.body).map((it) => Holiday.fromJson(it)).toList();
  }

  Future<Holiday> addHoliday(Holiday holiday) async {
    var response = await http.post(url + 'holidays',
        headers: {
          ...await currentUser.authHeaders,
          'Content-Type': 'application/json',
        },
        body: json.encode(holiday));

    return Holiday.fromJson(json.decode(response.body));
  }

  Future<Holiday> deleteHoliday(Holiday holiday) async {
    await http.delete(url + 'holidays/${holiday.id}', headers: {
      ...await currentUser.authHeaders,
      'Content-Type': 'application/json',
    });
    return holiday;
  }
}

var api = new Api();

class HolidayProvider with ChangeNotifier {
  List<Holiday> _holidays;

  List<Holiday> get holidays => _holidays;

  set holidays(List<Holiday> holidays) {
    this.holidays = holidays;
    notifyListeners();
  }

  HolidayProvider(this._holidays);

  void setHolidays(List<Holiday> holidays) {
    this.holidays = holidays;
    notifyListeners();
  }

  void add(Holiday holiday) {
    holidays.add(holiday);
    notifyListeners();
  }

  void delete(Holiday holiday) {
    holidays.remove(holiday);
    notifyListeners();
  }
}

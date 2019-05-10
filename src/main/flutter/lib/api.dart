import 'dart:convert';

import 'package:flock_eco_holidays/holiday.dart';
import "package:http/http.dart" as http;

class Api {
  Future<List<Holiday>> allHolidays (currentUser) async {
    var response = await http.get(
      'http://localhost:8080/api/holidays',
      headers: await currentUser.authHeaders,
    );

    return (json.decode(response.body) as List).map((it) => Holiday.fromJson(it));
  }
}

var api = new Api();

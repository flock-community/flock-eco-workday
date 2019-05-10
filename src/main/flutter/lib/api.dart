import 'dart:convert';

import 'package:flock_eco_holidays/holiday.dart';
import "package:http/http.dart" as http;

const url = 'http://6b81cfd4.ngrok.io/api/';

class Api {
  Future<List<Holiday>> allHolidays(currentUser) async {
    var response = await http.get(url + 'holidays', headers: await currentUser.authHeaders);
    var list = json.decode(response.body) as List<dynamic>;
    return list.map((it) => Holiday.fromJson(it)).toList();
  }

  Future<void> addHoliday(currentUser, Holiday holiday) async {
    var response = await http.post(url + 'holidays', headers: await currentUser.authHeaders, body: holiday.toJson());
    print(response);
  }
}

var api = new Api();

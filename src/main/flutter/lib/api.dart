import 'dart:convert';

import 'package:flock_eco_holidays/holiday.dart';
import 'package:google_sign_in/google_sign_in.dart';
import "package:http/http.dart" as http;

const url = 'http://de5ad3db.ngrok.io/api/';
//const url = 'https://flock-community.appspot.com/api/';

class Api {
  Future<List<Holiday>> allHolidays(currentUser) async {
    var response = await http.get(url + 'holidays', headers: await currentUser.authHeaders);
    var list = json.decode(response.body) as List<dynamic>;
    return list.map((it) => Holiday.fromJson(it)).toList();
  }

  Future<void> addHoliday(GoogleSignInAccount currentUser, Holiday holiday) async {
    print(holiday);
    var headers2 = await currentUser.authHeaders;
    var map = {
      ...headers2,
      'Content-Type': 'application/json',
    };
    var response = await http.post(url + 'holidays', headers: map, body: json.encode(holiday));
    print(response.body);
  }
}

var api = new Api();

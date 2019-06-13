import 'dart:convert';

import 'package:flock_eco_holidays/app.dart';
import "package:http/http.dart" as http;

const apiUrl = 'https://flock-community.appspot.com/api/';

class RequestService {
  Future<http.Response> get(String url) async {
    return await http.get(
      apiUrl + url,
      headers: {
        ...await app.users.currentUser.authHeaders,
      },
    );
  }

  Future<http.Response> post(String url, Object body) async {
    return await http.post(
      apiUrl + url,
      headers: {
        ...await app.users.currentUser.authHeaders,
        'Content-Type': 'application/json',
      },
      body: json.encode(body),
    );
  }

  Future<http.Response> delete(String url) async {
    return await http.delete(
      apiUrl + url,
      headers: {
        ...await app.users.currentUser.authHeaders,
        'Content-Type': 'application/json',
      },
    );
  }
}

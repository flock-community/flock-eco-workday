import 'dart:convert';

import 'package:flock_eco_holidays/app.dart';
import "package:http/http.dart" as http;

class RequestService {
  Future<http.Response> get(String url) async {
    return await http.get(
      url,
      headers: {
        ...await app.users.authHeaders,
      },
    );
  }

  Future<http.Response> post(String url, Object body) async {
    return await http.post(
      url,
      headers: {
        ...await app.users.authHeaders,
        'Content-Type': 'application/json',
      },
      body: json.encode(body),
    );
  }

  Future<http.Response> delete(String url) async {
    return await http.delete(
      url,
      headers: {
        ...await app.users.authHeaders,
        'Content-Type': 'application/json',
      },
    );
  }
}

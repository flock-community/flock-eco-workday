import 'package:google_sign_in/google_sign_in.dart';

import 'package:flock_eco_holidays/holiday/holiday_service.dart';
import 'package:flock_eco_holidays/services/request_service.dart';
import 'package:flock_eco_holidays/user/user_service.dart';

var app = App();

class App {
  UserService users = new UserService();
  RequestService request = new RequestService();
  HolidayService holidayService = new HolidayService();
  GoogleSignIn googleSingIn = GoogleSignIn(scopes: ['email']);
}

class AppMock implements App {
  UserService users = new UserServiceMock();
  RequestService request = new RequestService();
  HolidayService holidayService = new HolidayServiceMock();
  GoogleSignIn googleSingIn = GoogleSignIn(scopes: ['email']);
}

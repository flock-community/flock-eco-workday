import 'package:flock_eco_holidays/app.dart';
import 'package:flutter/widgets.dart';
import 'package:google_sign_in/google_sign_in.dart';

class UserProvider with ChangeNotifier {
  GoogleSignInAccount _currentUser;

  GoogleSignInAccount get currentUser => _currentUser;

  set currentUser(GoogleSignInAccount currentUser) {
    app.users.currentUser = currentUser;
    _currentUser = currentUser;
    notifyListeners();
  }
}
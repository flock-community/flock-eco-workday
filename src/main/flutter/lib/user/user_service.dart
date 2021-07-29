import 'package:google_sign_in/google_sign_in.dart';

class UserService {
  GoogleSignInAccount currentUser;
}

class UserServiceMock implements UserService {
  GoogleSignInAccount currentUser = UserMock();
}

class UserMock implements GoogleSignInAccount {
  Future<Map<String, String>> get authHeaders async => {};

  Future<GoogleSignInAuthentication> get authentication => null;

  Future<void> clearAuthCache() {
    return null;
  }

  String get displayName => 'Kasper Peulen';

  String get email => 'kasperpeulen@gmail.com';

  String get id => '0';
  String get photoUrl => '';

}
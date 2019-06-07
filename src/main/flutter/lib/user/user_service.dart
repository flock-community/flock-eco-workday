import 'package:google_sign_in/google_sign_in.dart';

class UserService {
  GoogleSignInAccount currentUser;

  Future<Map<String, String>> get authHeaders => currentUser.authHeaders;
}

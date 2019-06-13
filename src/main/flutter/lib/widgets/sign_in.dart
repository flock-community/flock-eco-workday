import 'package:flock_eco_holidays/app.dart';
import 'package:flock_eco_holidays/user/user_provider.dart';
import 'package:flutter/material.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:provider/provider.dart';

class SignIn extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    var users = Provider.of<UserProvider>(context);
    return ConstrainedBox(
      constraints: BoxConstraints.expand(),
      child: () {
        if ((users.currentUser != null)) {
          return Column(
            children: [
              ListTile(
                leading: GoogleUserCircleAvatar(
                  identity: users.currentUser,
                ),
                title: Text(users.currentUser.displayName ?? ''),
                subtitle: Text(users.currentUser.email ?? ''),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 20),
                child: Text("Signed in successfully."),
              ),
              RaisedButton(
                child: Text('SIGN OUT'),
                onPressed: () {
                  app.googleSingIn.disconnect();
                },
              ),
            ],
          );
        } else {
          return Column(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: <Widget>[
              Text("You are not currently signed in."),
              RaisedButton(
                child: Text('SIGN IN'),
                onPressed: () async {
                  try {
                    await app.googleSingIn.signIn();
                  } catch (error) {
                    print(error);
                  }
                },
              ),
            ],
          );
        }
      }(),
    );
  }
}

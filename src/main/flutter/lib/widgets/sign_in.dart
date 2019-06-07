import 'package:flock_eco_holidays/app.dart';
import 'package:flock_eco_holidays/user/user_provider.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class SignIn extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    var userProvider = Provider.of<UserProvider>(context);

    return ConstrainedBox(
      constraints: BoxConstraints.expand(),
      child: () {
        if ((userProvider.currentUser != null)) {
          return Column(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              ListTile(
                title: Text(userProvider.currentUser.displayName ?? ''),
                subtitle: Text(userProvider.currentUser.email ?? ''),
              ),
              Text("Signed in successfully."),
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


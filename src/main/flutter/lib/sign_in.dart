import 'dart:async';

import 'package:flock_eco_holidays/api.dart';
import 'package:flock_eco_holidays/create_holiday.dart';
import 'package:flutter/material.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:provider/provider.dart';
import 'holiday.dart';

GoogleSignIn googleSingIn = GoogleSignIn(scopes: ['email']);

void main() {
  runApp(
    ChangeNotifierProvider<HolidaysModel>(
      builder: (_) => HolidaysModel([]),
      child: MaterialApp(
        title: 'Google Sign  In',
        home: SignInDemo(),
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          primarySwatch: Colors.yellow,
        ),
      ),
    ),
  );
}

class SignInDemo extends StatefulWidget {
  @override
  State createState() => MyApp();
}

enum Page { SignIn, Holidays }

class MyApp extends State<SignInDemo> {
  GoogleSignInAccount currentUser;
  String contactText;
  List<Holiday> holidays;
  Page page = Page.Holidays;

  @override
  void initState() {
    super.initState();
    holidays = [];

    googleSingIn.onCurrentUserChanged.listen((GoogleSignInAccount account) {
      setState(() {
        currentUser = account;
        api.currentUser = currentUser;
        api.allHolidays().then((holidays) {
          Provider.of<HolidaysModel>(context).setHolidays(holidays);
        });
      });
    });
    googleSingIn.signInSilently();
  }

  Future<void> _handleSignIn() async {
    try {
      await googleSingIn.signIn();
    } catch (error) {
      print(error);
    }
  }

  Future<void> _handleSignOut() async {
    googleSingIn.disconnect();
  }

  Widget _buildBody() {
    if (currentUser != null) {
      print([1, holidays]);
      return Column(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: <Widget>[
          ListTile(
            title: Text(currentUser.displayName ?? ''),
            subtitle: Text(currentUser.email ?? ''),
          ),
          Text("Signed in successfully."),
          Text(contactText ?? ''),
          RaisedButton(
            child: Text('SIGN OUT'),
            onPressed: _handleSignOut,
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
            onPressed: _handleSignIn,
          ),
        ],
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          title: Text('Flock Holidays'),
        ),
        body: () {
          switch (page) {
            case Page.SignIn:
              return ConstrainedBox(constraints: BoxConstraints.expand(), child: _buildBody());
            case Page.Holidays:
              return Holidays();
          }
        }(),
        floatingActionButton: FloatingActionButton(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => CreateHoliday(),
                ),
              );
            },
            child: Icon(Icons.add)),
        drawer: Drawer(
          child: ListView(
            // Important: Remove any padding from the ListView.
            padding: EdgeInsets.zero,
            children: <Widget>[
              DrawerHeader(
                child: Text('Flock Holidays', style: TextStyle(fontSize: 23)),
                decoration: BoxDecoration(
                  color: Colors.yellow,
                ),
              ),
              ListTile(
                title: Text('Sign in'),
                leading: Icon(Icons.person_outline),
                onTap: () {
                  setState(() {
                    page = Page.SignIn;
                    Navigator.pop(context);
                  });
                },
              ),
              ListTile(
                title: Text('Holidays'),
                leading: Icon(Icons.wb_sunny),
                onTap: () {
                  setState(() {
                    page = Page.Holidays;
                    Navigator.pop(context);
                  });
                },
              ),
            ],
          ),
        ));
  }
}

class Holidays extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    var holidays = Provider.of<HolidaysModel>(context).holidays;
    return RefreshIndicator(
      onRefresh: () async {
        await api.allHolidays().then((holidays) {
          Provider.of<HolidaysModel>(context).setHolidays(holidays);
          print(holidays);
        });
      },
      child: ListView(
        children: <Widget>[
          for (var holiday in holidays)
            Dismissible(
              onDismissed: (_) async {
                await api.deleteHoliday(holiday);
                Provider.of<HolidaysModel>(context).delete(holiday);
                Scaffold.of(context)
                    .showSnackBar(SnackBar(content: Text("Holiday ${holiday.name} deleted")));
              },
              direction: DismissDirection.endToStart,
              key: Key(holidays.indexOf(holiday).toString()),
              child: ListTile(
                title: Text(holiday.name),
                leading: Icon(Icons.wb_sunny, color: Colors.orange[200]),
                subtitle: Text(holiday.formatHoliday()),
              ),
              background: Container(
                color: Colors.red,
              ),
              secondaryBackground: Container(
                color: Colors.red,
                child: Row(
                  children: [
                    Spacer(),
                    Padding(
                      padding: EdgeInsets.symmetric(horizontal: 20),
                      child: Icon(Icons.delete, color: Colors.white),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}

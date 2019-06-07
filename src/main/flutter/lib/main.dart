import 'dart:async';

import 'package:flock_eco_holidays/api.dart';
import 'package:flock_eco_holidays/create_holiday.dart';
import 'package:flutter/material.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:provider/provider.dart';

GoogleSignIn googleSingIn = GoogleSignIn(scopes: ['email']);

void main() {
  runApp(
    ChangeNotifierProvider<HolidayProvider>(
      builder: (_) => HolidayProvider([]),
      child: MaterialApp(
        title: 'Google Sign  In',
        home: SignInDemo(),
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
  Page page = Page.Holidays;

  @override
  void initState() {
    super.initState();

    googleSingIn.onCurrentUserChanged.listen((GoogleSignInAccount account) {
      setState(() {
        currentUser = account;
        api.currentUser = currentUser;

      });
    });
    googleSingIn.signInSilently();
  }

  Widget _buildBody() {
    if (currentUser != null) {
      return Column(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          ListTile(
            title: Text(currentUser.displayName ?? ''),
            subtitle: Text(currentUser.email ?? ''),
          ),
          Text("Signed in successfully."),
          RaisedButton(
            child: Text('SIGN OUT'),
            onPressed: () {
              googleSingIn.disconnect();
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
                await googleSingIn.signIn();
              } catch (error) {
                print(error);
              }
            },
          ),
        ],
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (currentUser != null) {
      var holidayProvider = Provider.of<HolidayProvider>(context);

      api.allHolidays().then((holidays) {
        holidayProvider.setHolidays(holidays);
      });
    }
    return Scaffold(
        appBar: AppBar(
          title: Text('Flock Holidays'),
        ),
        body: () {
          switch (page) {
            case Page.Holidays:
              return HolidayList();
            case Page.SignIn:
              return ConstrainedBox(constraints: BoxConstraints.expand(), child: _buildBody());

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

class HolidayList extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    var holidayProvider = Provider.of<HolidayProvider>(context);
    return RefreshIndicator(
      onRefresh: () async {
        holidayProvider.setHolidays(await api.allHolidays());
      },
      child: ListView(
        children: <Widget>[
          for (var holiday in holidayProvider.holidays)
            Dismissible(
              onDismissed: (_) async {
                holidayProvider.delete(await api.deleteHoliday(holiday));
                Scaffold.of(context).showSnackBar(
                  SnackBar(content: Text("Holiday ${holiday.name} deleted")),
                );
              },
              direction: DismissDirection.endToStart,
              key: Key(holidayProvider.holidays.indexOf(holiday).toString()),
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

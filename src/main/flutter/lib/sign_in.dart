// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import 'dart:async';
import 'dart:convert' show json;

import 'package:flock_eco_holidays/api.dart';
import "package:http/http.dart" as http;
import 'package:flutter/material.dart';
import 'package:google_sign_in/google_sign_in.dart';

import 'holiday.dart';

GoogleSignIn googleSingIn = GoogleSignIn(
  scopes: <String>[
    'email',
    'https://www.googleapis.com/auth/contacts.readonly',
  ],
);

void main() {
  runApp(
    MaterialApp(
      title: 'Google Sign In',
      home: SignInDemo(),
      theme: ThemeData(
        primarySwatch: Colors.yellow,
      ),
    ),
  );
}

class SignInDemo extends StatefulWidget {
  @override
  State createState() => SignInDemoState();
}

enum Page { SignIn, Holidays }

class SignInDemoState extends State<SignInDemo> {
  GoogleSignInAccount currentUser;
  String contactText;
  List<Holiday> holidays;
  Page page = Page.SignIn;

  @override
  void initState() {
    super.initState();
    holidays = [];

    googleSingIn.onCurrentUserChanged.listen((GoogleSignInAccount account) {
      setState(() {
        currentUser = account;
        api.allHolidays(currentUser).then((holidays) {
          setState(() {
            this.holidays = holidays;
          });
        });
      });
      if (currentUser != null) {
        _handleGetContact();
      }
    });
    googleSingIn.signInSilently();
  }

  Future<void> _handleGetContact() async {
    setState(() {
      contactText = "Loading contact info...";
    });
    final http.Response response = await http.get(
      'https://people.googleapis.com/v1/people/me/connections'
      '?requestMask.includeField=person.names',
      headers: await currentUser.authHeaders,
    );
    if (response.statusCode != 200) {
      setState(() {
        contactText = "People API gave a ${response.statusCode} "
            "response. Check logs for details.";
      });
      print('People API ${response.statusCode} response: ${response.body}');
      return;
    }
    final Map<String, dynamic> data = json.decode(response.body);
    final String namedContact = _pickFirstNamedContact(data);
    setState(() {
      if (namedContact != null) {
        contactText = "I see you know $namedContact!";
      } else {
        contactText = "No contacts to display.";
      }
    });
  }

  Future<void> _callApi() async {
    var holidays = await api.allHolidays(currentUser);
    setState(() {
      this.holidays = holidays;
    });
    print(holidays);
  }

  String _pickFirstNamedContact(Map<String, dynamic> data) {
    final List<dynamic> connections = data['connections'];
    final Map<String, dynamic> contact = connections?.firstWhere(
      (dynamic contact) => contact['names'] != null,
      orElse: () => null,
    );
    if (contact != null) {
      final Map<String, dynamic> name = contact['names'].firstWhere(
        (dynamic name) => name['displayName'] != null,
        orElse: () => null,
      );
      if (name != null) {
        return name['displayName'];
      }
    }
    return null;
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
          const Text("Signed in successfully."),
          Text(contactText ?? ''),
          RaisedButton(
            child: const Text('SIGN OUT'),
            onPressed: _handleSignOut,
          ),
          RaisedButton(
            child: const Text('REFRESH'),
            onPressed: _handleGetContact,
          ),
          RaisedButton(
            child: const Text('CALL API'),
            onPressed: _callApi,
          ),
          RaisedButton(
            child: const Text('ADD HOLIDAY'),
            onPressed: () => api.addHoliday(
                  currentUser,
                  Holiday(
                    name: 'my holiday',
                    fromDate: DateTime.now(),
                    toDate: DateTime.now(),
                  ),
                ),
          ),
        ],
      );
    } else {
      print(2);
      return Column(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: <Widget>[
          const Text("You are not currently signed in."),
          RaisedButton(
            child: const Text('SIGN IN'),
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
          title: const Text('Flock Holidays'),
        ),
        body: page == Page.Holidays
            ? Holidays(holidays: holidays)
            : ConstrainedBox(
                constraints: const BoxConstraints.expand(),
                child: _buildBody(),
              ),
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
  const Holidays({
    Key key,
    @required this.holidays,
  }) : super(key: key);

  final List<Holiday> holidays;

  @override
  Widget build(BuildContext context) {
    return ListView(
      children: <Widget>[
        for (var holiday in holidays)
          Dismissible(
            key: Key(holidays.indexOf(holiday).toString()),
            child: ListTile(
              title: Text(holiday.name),
              leading: Icon(Icons.wb_sunny, color: Colors.orange[200]),
              subtitle: Text(holiday.formatHoliday()),
            ),
            background: Container(
              color: Colors.white,
            ),
            secondaryBackground: Container(
              color: Colors.red,
              child: Icon(Icons.cancel),
            ),
          ),
      ],
    );
  }
}

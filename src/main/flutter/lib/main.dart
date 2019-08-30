import 'package:flock_eco_holidays/user/user_provider.dart';
import 'package:flock_eco_holidays/widgets/my_scaffold.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'holiday/holiday_provider.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({
    Key key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider<UserProvider>(
      builder: (_) => UserProvider(),
      child: ChangeNotifierProvider<HolidayProvider>(
        builder: (_) => HolidayProvider([]),
        child: MaterialApp(
          title: 'Google Sign  In',
          home: MyScaffold(),
          theme: ThemeData(
            primarySwatch: Colors.amber,
          ),
        ),
      ),
    );
  }
}

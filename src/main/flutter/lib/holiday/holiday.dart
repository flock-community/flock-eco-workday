import 'package:flock_eco_holidays/day_off/day_off.dart';
import 'package:json_annotation/json_annotation.dart';
import 'package:intl/intl.dart';
part 'holiday.g.dart';

@JsonSerializable()
class Holiday {
  Holiday({this.id, this.description, this.from, this.to, this.dayOff = const <DayOff>{}});

  int id;
  String description;
  DateTime from;
  DateTime to;
  Set<DayOff> dayOff;

  factory Holiday.fromJson(Map<String, dynamic> json) => _$HolidayFromJson(json);

  Map<String, dynamic> toJson() => _$HolidayToJson(this);

  Holiday copy() {
    return Holiday.fromJson(this.toJson());
  }

  String formatHoliday() {
    return 'from ${DateFormat('yyyy-MM-dd').format(from)} until ${DateFormat('yyyy-MM-dd').format(to)}';
  }

  String toString() => toJson().toString();
}


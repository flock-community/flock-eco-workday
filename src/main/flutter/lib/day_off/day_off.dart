import 'package:json_annotation/json_annotation.dart';
part 'day_off.g.dart';

enum DayType { HOLIDAY, SICK_DAY, EVENT_DAY }

@JsonSerializable()
class DayOff {
  DayOff({this.id, this.type, this.date, this.hours});

  int id;
  DayType type;
  DateTime date;
  int hours;

  factory DayOff.fromJson(Map<String, dynamic> json) => _$DayOffFromJson(json);

  Map<String, dynamic> toJson() => _$DayOffToJson(this);

  DayOff copy() {
    return DayOff.fromJson(this.toJson());
  }

  String toString() => toJson().toString();
}

import 'package:json_annotation/json_annotation.dart';

part 'holiday_input.g.dart';

@JsonSerializable()
class HolidayInput {
  HolidayInput({this.description, this.from, this.to, this.dayOff}) {
    dayOff ??= List.filled(to.difference(from).inDays + 1, 8);
  }

  String description;
  DateTime from;
  DateTime to;
  List<int> dayOff;

  factory HolidayInput.fromJson(Map<String, dynamic> json) => _$HolidayInputFromJson(json);

  Map<String, dynamic> toJson() => _$HolidayInputToJson(this);

  String toString() => toJson().toString();
}

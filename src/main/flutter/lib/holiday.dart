import 'package:json_annotation/json_annotation.dart';
part 'holiday.g.dart';

@JsonSerializable()
class Holiday {
  Holiday({this.id, this.name, this.fromDate, this.toDate});

  final int id;
  final String name;
  final DateTime fromDate;
  final DateTime toDate;


  factory Holiday.fromJson(Map<String, dynamic> json) => _$HolidayFromJson(json);

  Map<String, dynamic> toJson() => _$HolidayToJson(this);
}


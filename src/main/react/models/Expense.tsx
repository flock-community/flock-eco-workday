import dayjs, { Dayjs } from "dayjs";
import { Person } from "../clients/PersonClient";
import { Status } from "./Status";

export enum ExpenseType {
  TRAVEL = "TRAVEL",
  COST = "COST",
}

export class Expense {
  constructor(
    public id: string,
    public date: Dayjs,
    public description: string,
    public person: Person,
    public status: Status,
    public amount: number,
    public files: any[],
    public expenseType: ExpenseType
  ) {}
}

export class CostExpense extends Expense {
  constructor(
    id: string,
    date: Dayjs,
    description: string,
    person: Person,
    status: Status,
    amount: number,
    files: any[]
  ) {
    super(
      id,
      date,
      description,
      person,
      status,
      amount,
      files,
      ExpenseType.COST
    );
  }

  public static fromJson(json: any): CostExpense {
    return new CostExpense(
      json.id,
      dayjs(json.date),
      json.description,
      json.person,
      Status[json.status],
      json.costDetails?.amount,
      json.costDetails?.files
    );
  }
}

export class TravelExpense extends Expense {
  constructor(
    id: string,
    date: Dayjs,
    description: string,
    person: Person,
    status: Status,
    files: any[],
    public allowance: number,
    public distance: number
  ) {
    super(
      id,
      date,
      description,
      person,
      status,
      allowance * distance,
      files,
      ExpenseType.TRAVEL
    );
  }

  public static fromJson(json: any): TravelExpense {
    return new TravelExpense(
      json.id,
      dayjs(json.date),
      json.description,
      json.person,
      Status[json.status],
      json.files,
      json.travelDetails?.allowance,
      json.travelDetails?.distance
    );
  }
}

import {CostExpense, TravelExpense} from "../../models/Expense";
import {Dayjs} from "dayjs";
import {Status} from "../../models/Status";
import {Person} from "../../clients/PersonClient";

function getMonthStringFromDate(date: Dayjs): string {
    return date.format('MMMM');
}

export function createTestCostExpense(id: string, date: Dayjs, status: Status = Status.REQUESTED, amount: number = 120): CostExpense {
    const dateMonth = getMonthStringFromDate(date);
    return new CostExpense(id, date, `Cost expense ${dateMonth}`, {} as Person, status, amount, []);
}

export function createTestTravelExpense(id: string, date: Dayjs, status: Status = Status.REQUESTED,
                                        distance: number = 120, allowance: number = 0.23): TravelExpense {
    const dateMonth = getMonthStringFromDate(date);
    return new TravelExpense(id, date, `Travel expense ${dateMonth}`, {} as Person, status, [], allowance, distance);
}

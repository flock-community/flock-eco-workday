endpoint GetTodoAll GET /api/todos -> {
  200 -> Todo[]
}

type Todo {
  id: UUID?,
  todoType: TodoType?,
  personId: UUID?,
  personName: String?,
  description: String?
}
enum TodoType {
  WORKDAY, SICKDAY, HOLIDAY, PAID_PARENTAL_LEAVE, UNPAID_PARENTAL_LEAVE, EXPENSE, PLUSDAY, PAID_LEAVE
}

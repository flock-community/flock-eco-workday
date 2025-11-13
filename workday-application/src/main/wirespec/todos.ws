endpoint GetTodoAll GET /api/todos -> {
  200 -> Todo[]
}

type Todo {
  id: UUID?,
  todoType: TodoTodoType?,
  personId: UUID?,
  personName: String?,
  description: String?
}
enum TodoTodoType {
  WORKDAY, SICKDAY, HOLIDAY, PAID_PARENTAL_LEAVE, UNPAID_PARENTAL_LEAVE, EXPENSE, PLUSDAY
}

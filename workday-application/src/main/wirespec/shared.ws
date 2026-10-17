type Error {
 message: String
}

// Identity of a stored entity: its database id and its public code
part Identified {
  id: Integer?,
  code: String?
}

// A period from a start date up to an end date
part Period {
  from: String?,
  to: String?
}

// Hours booked over a period, in total and per day
part BookedHours {
  ...Period,
  hours: Number?,
  days: Number[]?
}

// Query parameters of a paged list
part Paging {
  page: Integer32?,
  size: Integer32?
}

// Query parameters of a paged list, sorted on one or more comma separated fields
part SortedPaging {
  ...Paging,
  sort: String?
}

// Response header with the total number of elements of a paged list
part TotalCount {
  `x-total`: Integer32
}

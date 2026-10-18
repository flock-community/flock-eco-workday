type Error {
 message: String
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

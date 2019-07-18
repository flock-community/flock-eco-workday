import React, {useEffect, useState} from "react";
import HolidayClient from "./HolidayClient";
import {Card, Typography} from "@material-ui/core";

export function HolidayList({value, refresh, onClickRow}) {

  const [list, setList] = useState([])

  useEffect(() => {
    HolidayClient.fetchAll()
      .then(res => setList(res))
  }, [value, refresh])

  function handleClickRow(item) {
    return function(ev){
      onClickRow && onClickRow(item)
    }
  }

  function renderItem(item) {
    return (<Card onClick={handleClickRow(item)} key={`holiday-list-item-${item.id}`}>
      <Typography>{item.from} - {item.to}</Typography>
      <Typography>{item.description}</Typography>
    </Card>)
  }

  return list.map(renderItem)

}

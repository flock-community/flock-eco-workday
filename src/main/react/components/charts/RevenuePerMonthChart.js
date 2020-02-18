import React, {useEffect, useState} from "react"
import BarChart from "recharts/es6/chart/BarChart"
import CartesianGrid from "recharts/es6/cartesian/CartesianGrid"
import XAxis from "recharts/es6/cartesian/XAxis"
import YAxis from "recharts/es6/cartesian/YAxis"
import Legend from "recharts/es6/component/Legend"
import Tooltip from "recharts/es6/component/Tooltip"
import Bar from "recharts/es6/cartesian/Bar"
import ResponsiveContainer from "recharts/es6/component/ResponsiveContainer"
import PropTypes from "prop-types"
import {AggregationClient} from "../../clients/AggregationClient"

export function RevenuePerMonthChart({year}) {
  const [state, setState] = useState({})

  useEffect(() => {
    const date = new Date()
    AggregationClient.revenuePerMonthByYear(year || date.getFullYear()).then(res =>
      setState(res)
    )
  }, [])

  const data = Object.keys(state).map(key => ({
    name: key,
    value: state[key],
  }))

  return (
    <ResponsiveContainer>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip formatter={value => new Intl.NumberFormat("en").format(value)} />
        <Legend />
        <Bar dataKey="value" fill="#3f51b5" />
      </BarChart>
    </ResponsiveContainer>
  )
}

RevenuePerMonthChart.propTypes = {
  year: PropTypes.number,
}

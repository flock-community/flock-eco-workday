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

export function TotalPerMonthChart({year}) {
  const [state, setState] = useState(null)

  useEffect(() => {
    const date = new Date()
    AggregationClient.totalPerMonthByYear(year || date.getFullYear()).then(res =>
      setState(res)
    )
  }, [])

  if (!state) return null

  const data =
    state &&
    state.map(it => ({
      name: it.yearMonth,
      value: it.actualRevenue,
    }))

  const height = 50 + data.length * 50
  return (
    <ResponsiveContainer height={height}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis dataKey="value" />
        <Tooltip formatter={value => new Intl.NumberFormat("en").format(value)} />
        <Legend />
        <Bar dataKey="value" fill="#3f51b5" />
      </BarChart>
    </ResponsiveContainer>
  )
}

TotalPerMonthChart.propTypes = {
  year: PropTypes.number,
}

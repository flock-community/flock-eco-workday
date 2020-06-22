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
import {AlignedLoader} from "@flock-community/flock-eco-core/src/main/react/components/AlignedLoader"
import {AggregationClient} from "../../clients/AggregationClient"

export function HoursPerMonthChart({year}) {
  const [state, setState] = useState(null)

  useEffect(() => {
    const date = new Date()
    AggregationClient.totalPerMonthByYear(year || date.getFullYear()).then(res =>
      setState(res)
    )
  }, [])

  if (!state) return <AlignedLoader />

  return (
    <ResponsiveContainer>
      <BarChart data={state}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip formatter={value => new Intl.NumberFormat("en").format(value)} />
        <Legend />
        <Bar stackId="forcast" dataKey="forecastHoursGross" fill="#1de8b5" />
        <Bar stackId="actual" dataKey="actualHours" fill="#3f51b5" />
      </BarChart>
    </ResponsiveContainer>
  )
}

HoursPerMonthChart.propTypes = {
  year: PropTypes.number,
}

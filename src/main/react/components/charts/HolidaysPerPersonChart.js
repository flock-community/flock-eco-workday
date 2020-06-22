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

export function HolidaysPerPersonChart({year}) {
  const [state, setState] = useState(null)

  useEffect(() => {
    const date = new Date()
    AggregationClient.totalPerPersonByYear(year || date.getFullYear()).then(res =>
      setState(
        res
          .filter(it => it.holiDayBalance > 0 || it.holiDayUsed > 0)
          .map(it => ({
            ...it,
            holiDayAvailable:
              it.holiDayBalance > it.holiDayUsed
                ? it.holiDayBalance - it.holiDayUsed
                : 0,
            holiDayShortage:
              it.holiDayBalance && it.holiDayBalance < it.holiDayUsed
                ? it.holiDayUsed - it.holiDayBalance
                : 0,
          }))
      )
    )
  }, [])

  if (!state) return <AlignedLoader />

  const height = 50 + state.length * 50

  return (
    <ResponsiveContainer height={height}>
      <BarChart data={state} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis type="category" dataKey="name" width={150} />
        <Tooltip formatter={value => new Intl.NumberFormat("en").format(value)} />
        <Legend />
        <Bar stackId="used" dataKey="holiDayUsed" name="used" fill="#3f51b5" />
        <Bar
          stackId="used"
          dataKey="holiDayAvailable"
          name="available"
          fill="#9e9e9e"
        />
        <Bar stackId="used" dataKey="holiDayShortage" name="shortage" fill="#ef5350" />
      </BarChart>
    </ResponsiveContainer>
  )
}

HolidaysPerPersonChart.propTypes = {
  year: PropTypes.number,
  persons: PropTypes.object,
}

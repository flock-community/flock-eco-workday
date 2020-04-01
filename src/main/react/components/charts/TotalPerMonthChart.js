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
    state
      .map(it => ({
        name: it.yearMonth,
        actualRevenue: it.actualRevenue,
        actualCostContractService: it.actualCostContractService,
        actualCostContractManagement: it.actualCostContractManagement,
        actualCostContractExternal: it.actualCostContractExternal,
        actualCostContractInternal: it.actualCostContractInternal,
        actualCostContractInternalTax: it.actualCostContractInternal * 0.22,
        actualCostContractInternalHoliday: it.actualCostContractInternal / 12,
        actualCostContractInternalRetirement: it.actualCostContractInternal * 0.1,
        actualCostContractInternalTraining: (it.countContractInternal * 5000) / 12,
        actualCostContractInternalTravel: it.countContractInternal * 300,
        actualCostContractInternalInsurance: it.countContractInternal * 100,
      }))
      .map(it => ({
        ...it,
        actualCost: [
          it.actualCostContractService,
          it.actualCostContractManagement,
          it.actualCostContractExternal,
          it.actualCostContractInternal,
          it.actualCostContractInternalTax,
          it.actualCostContractInternalHoliday,
          it.actualCostContractInternalRetirement,
          it.actualCostContractInternalTraining,
          it.actualCostContractInternalTravel,
          it.actualCostContractInternalInsurance,
        ].reduce((acc, cur) => acc + cur),
      }))
      .map(it => ({
        ...it,
        margin: Math.abs(it.actualRevenue - it.actualCost),
      }))

  return (
    <ResponsiveContainer>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip formatter={value => new Intl.NumberFormat("en").format(value)} />
        <Legend />
        <Bar stackId="revenue" dataKey="actualRevenue" fill="#1de8b5" />
        <Bar stackId="cost" dataKey="actualCostContractExternal" fill="#3f51b5" />
        <Bar stackId="cost" dataKey="actualCostContractInternal" fill="#3f51b5" />
        <Bar stackId="cost" dataKey="actualCostContractInternalTax" fill="#3f51b5" />
        <Bar
          stackId="cost"
          dataKey="actualCostContractInternalHoliday"
          fill="#3f51b5"
        />
        <Bar
          stackId="cost"
          dataKey="actualCostContractInternalRetirement"
          fill="#3f51b5"
        />
        <Bar
          stackId="cost"
          dataKey="actualCostContractInternalTraining"
          fill="#3f51b5"
        />
        <Bar stackId="cost" dataKey="actualCostContractInternalTravel" fill="#3f51b5" />
        <Bar
          stackId="cost"
          dataKey="actualCostContractInternalInsurance"
          fill="#3f51b5"
        />
        <Bar stackId="cost" dataKey="actualCostContractManagement" fill="#3f51b5" />
        <Bar stackId="cost" dataKey="actualCostContractService" fill="#3f51b5" />
        <Bar stackId="cost" dataKey="margin" fill="gray" />
      </BarChart>
    </ResponsiveContainer>
  )
}

TotalPerMonthChart.propTypes = {
  year: PropTypes.number,
}

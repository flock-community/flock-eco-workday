import React, {useEffect, useState} from "react"
import {Pie, PieChart, ResponsiveContainer, Tooltip} from "recharts"
import PropTypes from "prop-types"
import {AggregationClient} from "../../clients/AggregationClient"

export function RevenuePerClientChart({year, clients}) {
  const [state, setState] = useState({})

  useEffect(() => {
    const date = new Date()
    AggregationClient.revenuePerClientByYear(year || date.getFullYear()).then(res =>
      setState(res)
    )
  }, [])

  const data = Object.keys(state).map(key => ({
    name: clients ? clients[key] : key,
    value: state[key],
  }))

  console.log(data)

  return (
    <ResponsiveContainer>
      <PieChart width={400} height={400}>
        <Pie
          data={data}
          valueKey="value"
          dataKey="value"
          nameKey="name"
          fill="#3f51b5"
          label
        />
        <Tooltip formatter={value => new Intl.NumberFormat("en").format(value)} />
      </PieChart>
    </ResponsiveContainer>
  )
}

RevenuePerClientChart.propTypes = {
  year: PropTypes.number,
  clients: PropTypes.object,
}

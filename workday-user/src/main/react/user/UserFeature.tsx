import React, {useState} from 'react'
import {UserTable} from './UserTable'
import {UserDialog} from './UserDialog'
import {Card} from '@material-ui/core'
import {UserToolbar} from './UserToolbar'

type UserFeatureProps = {
  enablePassword?: boolean
}

export function UserFeature({enablePassword}: UserFeatureProps) {
  const [searchState, setSearchState] = useState<string>('')

  const [dialogState, setDialogState] = useState({
    open: false,
    id: null,
  })

  const [reload, setReload] = useState(false)

  const handleRowClick = (item) => {
    setDialogState({
      open: true,
      id: item.id,
    })
  }

  const handleSearchChange = (search: string) => {
    setSearchState(search)
  }

  const handleNewClick = () => {
    setDialogState({
      open: true,
      id: null,
    })
  }

  const handleComplete = () => {
    setDialogState({
      open: false,
      id: null,
    })
    setReload(!reload)
  }

  return (
    <>
      <Card>
        <UserToolbar
          onAdd={handleNewClick}
          onSearchChange={handleSearchChange}
        />
        <UserTable
          reload={reload}
          search={searchState}
          onRowClick={handleRowClick}
        />
      </Card>
      <UserDialog
        open={dialogState.open}
        id={dialogState.id}
        onComplete={handleComplete}
        enablePassword={enablePassword}
      />
    </>
  )
}

import {storiesOf} from '@storybook/react'
import {UserTable} from '../../../main/react/user/UserTable'

storiesOf('User/UserTable', module).add('default', () => {
  return <UserTable />
})

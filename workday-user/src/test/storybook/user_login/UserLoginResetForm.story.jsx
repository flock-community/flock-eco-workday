import {storiesOf} from '@storybook/react'
import {UserLoginResetForm} from '../../../main/react/user_login/UserLoginResetForm'

const handleReset = (password) => {
  alert(password)
}
storiesOf('User/login/UserLoginResetForm', module).add('default', () => (
  <UserLoginResetForm onReset={handleReset} />
))

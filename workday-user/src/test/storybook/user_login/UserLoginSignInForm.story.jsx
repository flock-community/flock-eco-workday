import {storiesOf} from '@storybook/react'
import {UserLoginResetForm} from '../../../main/react/user_login/UserLoginResetForm'
import {UserLoginSignInForm} from '../../../main/react/user_login/UserLoginSignInForm'

const handleReset = (password) => {
  alert(password)
}
storiesOf('User/login/UserLoginSignInForm', module).add('default', () => (
  <UserLoginSignInForm />
))

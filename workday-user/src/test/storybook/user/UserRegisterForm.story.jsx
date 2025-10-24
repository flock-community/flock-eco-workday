import {storiesOf} from '@storybook/react'
import UserRegisterForm from '../../../main/react/user/UserRegisterForm'

const value = {
  name: 'Willem Veelenturf',
  email: 'willem.veelenturf@flock.community',
}

storiesOf('User/UserRegisterForm', module)
  .add('default', () => {
    return (
      <UserRegisterForm
        initialValues={{
          email: '123',
        }}
        onSubmit={(values) => {
          console.log(values)
        }}
      />
    )
  })

  .add('value', () => {
    return (
      <UserRegisterForm
        value={value}
        initialValues={{
          email: '123',
        }}
        onSubmit={(values) => {
          console.log(values)
        }}
      />
    )
  })

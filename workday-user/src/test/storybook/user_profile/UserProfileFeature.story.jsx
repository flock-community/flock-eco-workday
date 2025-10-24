import {storiesOf} from '@storybook/react'
import {UserProfileFeature} from '../../../main/react/user_profile/UserProfileFeature'

const user = {
  name: 'Willem Veelenturf',
  email: 'willem.veelenturf@gmail.com',
  authorities: ['Auth.A', 'Auth.B'],
}

storiesOf('User profile/UserProfileFeature', module).add('default', () => (
  <UserProfileFeature value={user} style={{height: 300}} />
))

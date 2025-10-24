import {storiesOf} from '@storybook/react'
import {UserFeature} from '../../../main/react/user/UserFeature'

storiesOf('User/UserFeature', module)
  .add('default', () => (
    <div style={{height: '400px'}}>
      <UserFeature />
    </div>
  ))

  .add('password', () => (
    <div style={{height: '400px'}}>
      <UserFeature enablePassword={true} />
    </div>
  ))

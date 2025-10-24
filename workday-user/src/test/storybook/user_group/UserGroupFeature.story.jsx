import {storiesOf} from '@storybook/react'
import {UserGroupFeature} from '../../../main/react/user_group/UserGroupFeature'

storiesOf('User group/UserGroupFeature', module).add('default', () => (
  <div style={{height: '400px'}}>
    <UserGroupFeature />
  </div>
))

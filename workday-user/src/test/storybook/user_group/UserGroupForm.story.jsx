import {storiesOf} from '@storybook/react'
import {
  USER_GROUP_FORM_ID,
  UserGroupForm,
} from '../../../main/react/user_group/UserGroupForm'
import Button from '@material-ui/core/Button'

storiesOf('User group/UserGroupForm', module).add('default', () => (
  <>
    <UserGroupForm onSummit={console.log} />
    <Button type="submit" form={USER_GROUP_FORM_ID}>
      Submit
    </Button>
  </>
))

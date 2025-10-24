import {storiesOf} from '@storybook/react'
import {UserAutocomplete} from '../../../main/react/user/UserAutocomplete'

storiesOf('User/UserAutocomplete', module)
  .add('default', () => <UserAutocomplete />)
  .add('value', () => (
    <UserAutocomplete value={['319da15f-99b5-47dc-9df2-f131efa5aa7d']} />
  ))

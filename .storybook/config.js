import { configure } from '@storybook/react';

function loadStories() {
  require('../src/test/storybook/index.js');
}

configure(loadStories, module);

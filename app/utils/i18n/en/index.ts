import { common } from './common';
import { store } from './store';
import { dashboard } from './dashboard';
import { landing } from './landing';
import { chat } from './chat';
import { admin } from './admin';

export const en = {
  ...common,
  ...store,
  ...dashboard,
  ...landing,
  ...chat,
  ...admin,
};

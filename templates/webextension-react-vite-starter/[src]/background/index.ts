import reloadOnUpdate from 'virtual:reload-on-update-in-background-script';

import { registerMessageListener } from '@/background/messageHandler';

reloadOnUpdate('background');

/**
 * Extension reloading is necessary because the browser automatically caches the css.
 * If you do not use the css of the content script, please delete it.
 */
reloadOnUpdate('content/style.scss');

registerMessageListener();

console.log('background loaded');

// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

Sentry.init({
	dsn: 'https://983f777ba77848138577dff8df83c8be@pb.cartes.app/2',

	// Setting this option to true will print useful information to the console while you're setting up Sentry.
	debug: false,
})

export enum AppRoute {
  Work      = 'work',
  Statement = 'statement',
  Events    = 'events',
  Contact   = 'contact',
}

export const APP_ROUTE_PATHS: Record<AppRoute, string> = {
  [AppRoute.Work]:      '/',
  [AppRoute.Statement]: '/statement',
  [AppRoute.Events]:    '/events',
  [AppRoute.Contact]:   '/contact',
};

export function getAppRoute(route: AppRoute): string {
  return APP_ROUTE_PATHS[route];
}

export const NAV_TABS: { route: AppRoute; label: string }[] = [
  { route: AppRoute.Work,      label: 'Body of Work'     },
  { route: AppRoute.Statement, label: 'Artist Statement' },
  { route: AppRoute.Events,    label: 'Events'           },
  { route: AppRoute.Contact,   label: 'Contact'          },
];

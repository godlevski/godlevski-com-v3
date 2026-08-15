import type { AgnosticEvent } from '../event/AgnosticEvent';

export function log(event: Pick<AgnosticEvent, 'uid'>, msg: string) {
  console.log(`[${event.uid.slice(0, 8)}] ${msg}`);
}

export function logError(event: Pick<AgnosticEvent, 'uid'>, msg: string) {
  console.error(`[${event.uid.slice(0, 8)}] ${msg}`);
}

export interface ArtProject {
  id: string;
  title: string;       // project / series title
  place: string;       // venue or location
  date: string;        // YYYY-MM-DD or YYYY
  description?: string;
}

export const projects: ArtProject[] = [
  {
    id: 'p1',
    title: 'Freedom of a Canary',
    place: 'Personal Exhibition',
    date: '2009',
    description: 'Explores the concept of freedom and the role of barriers in achieving it.',
  },
  {
    id: 'p2',
    title: 'State of Energy',
    place: 'Pool Art Fair, Miami',
    date: '2012',
    description: 'Dissects the emotional expression of the body through twisting and layering light. Selected venues in New York featuring pieces from "State of Energy" series.',
  },
];

export interface ArtEvent {
  id: string;
  title: string;        // venue / place
  dateStart: string;    // YYYY-MM-DD
  dateEnd?: string;     // YYYY-MM-DD, omit for single-day
  description?: string;
}

export const events: ArtEvent[] = [
  {
    id: 'e1',
    title: 'Hairpin Art Center',
    dateStart: '2023-04-08',
    dateEnd: '2023-04-19',
  },
  {
    id: 'e2',
    title: 'Lewis Ginter Botanical Gardens (CAC)',
    dateStart: '2023-08-01',
    dateEnd: '2023-10-31',
  },
  {
    id: 'e3',
    title: 'Union Street Gallery',
    dateStart: '2024-06-08',
    description: 'Personal exhibit.',
  },
  {
    id: 'e4',
    title: 'Gallery B612',
    dateStart: '2024-06-22',
    dateEnd: '2024-07-21',
  },
  {
    id: 'e5',
    title: 'Fulton Street Collective',
    dateStart: '2025-08-01',
  },
];

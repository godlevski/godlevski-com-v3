import { events, ArtEvent, projects, ArtProject } from '../../data/events';

function fmt(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function fmtProject(d: string) {
  // accept bare year (e.g. "2022") or full date
  return d.length === 4 ? d : fmt(d);
}

export default function EventsPage() {
  return (
    <div className="page-panel">
      {events.length === 0 ? (
        <p className="page-placeholder">No upcoming events.</p>
      ) : (
        <ul className="events-list">
          {[...events].reverse().map((ev: ArtEvent) => {
            const dateStr = ev.dateEnd
              ? `${fmt(ev.dateStart)} – ${fmt(ev.dateEnd)}`
              : fmt(ev.dateStart);
            return (
              <li key={ev.id} className="event-item">
                <span className="event-date">{dateStr}</span>
                <span className="event-title">{ev.title}</span>
                {ev.description && <span className="event-desc">{ev.description}</span>}
              </li>
            );
          })}
        </ul>
      )}

      {projects.length > 0 && (
        <section className="projects-section">
          <h2 className="projects-heading">Prior Projects</h2>
          <ul className="events-list">
            {[...projects].reverse().map((pr: ArtProject) => (
              <li key={pr.id} className="event-item project-item">
                <span className="event-date">{fmtProject(pr.date)}</span>
                <span className="event-title">{pr.title}</span>
                <span className="project-place">{pr.place}</span>
                {pr.description && <span className="event-desc">{pr.description}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

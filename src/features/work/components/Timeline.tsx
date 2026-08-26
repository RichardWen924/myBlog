import experience from '../../../data/experience';
import type { ExperienceItem } from '../../../data/experience';

interface TimelineProps {
  items?: ExperienceItem[];
}

function formatPeriod(start: string, end?: string) {
  return `${start} — ${end ?? 'Present'}`;
}

export default function Timeline({ items = experience }: TimelineProps) {
  return (
    <ol className="work-timeline" aria-label="Work and study timeline">
      {items.map((item, index) => (
        <li
          className="work-timeline__item"
          data-work-timeline-item
          data-work-reveal="timeline-item"
          key={`${item.startDate}-${item.title}`}
        >
          <span className="work-timeline__index">{String(index + 1).padStart(2, '0')}</span>
          <time className="work-timeline__date" dateTime={item.startDate}>
            {formatPeriod(item.startDate, item.endDate)}
          </time>
          <span className="work-timeline__marker" aria-hidden="true" />
          <div className="work-timeline__content">
            <h3>{item.title}</h3>
            <p>{item.organization}{item.location ? ` · ${item.location}` : ''}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

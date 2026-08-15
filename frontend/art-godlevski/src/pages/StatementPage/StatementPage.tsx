import { artistStatement } from '../../data/statement';

export default function StatementPage() {
  return (
    <div className="page-panel">
      <div className="statement-body">
        {artistStatement.paragraphs.map((p, i) => (
          <p key={i} className="statement-p">{p}</p>
        ))}
      </div>
    </div>
  );
}

function AdminStatCard({ title, value, note }) {
  return (
    <article className="admin-stat-card">
      <p className="admin-stat-title">{title}</p>
      <h3>{value}</h3>
      <span>{note}</span>
    </article>
  );
}

export default AdminStatCard;

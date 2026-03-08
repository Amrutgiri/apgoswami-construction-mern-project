import AdminStatCard from '../components/AdminStatCard';

const stats = [
  { title: 'Total Projects', value: '48', note: '+4 this month' },
  { title: 'Active Leads', value: '126', note: '22 high priority' },
  { title: 'Pending Approvals', value: '9', note: 'Need review today' },
  { title: 'Media Assets', value: '384', note: 'Last upload 2h ago' },
];

function DashboardPage() {
  return (
    <section>
      <div className="admin-stat-grid">
        {stats.map((item) => (
          <AdminStatCard key={item.title} title={item.title} value={item.value} note={item.note} />
        ))}
      </div>
    </section>
  );
}

export default DashboardPage;

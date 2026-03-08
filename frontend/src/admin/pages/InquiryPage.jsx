import { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import AdminDataTable from '../components/AdminDataTable';
import { toastError, toastSuccess } from '../utils/alerts';
import { getAdminToken } from '../utils/auth';

function InquiryPage() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const token = getAdminToken();
      const response = await fetch(`${API_BASE_URL}/api/inquiries`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok || !result?.success) {
        toastError(result?.message || 'Failed to fetch inquiries');
        return;
      }

      const mappedRows = result.data.map((item) => ({
        id: item._id,
        fullName: item.fullName,
        email: item.email,
        phone: item.phone,
        service: item.service,
        message: item.message,
        status: item.status,
        createdAt: new Date(item.createdAt).toLocaleString(),
      }));

      setInquiries(mappedRows);
    } catch {
      toastError('Unable to connect server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const markAsSeen = async (row) => {
    try {
      const token = getAdminToken();
      const response = await fetch(`${API_BASE_URL}/api/inquiries/${row.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 1 }),
      });

      const result = await response.json();

      if (!response.ok || !result?.success) {
        toastError(result?.message || 'Failed to update inquiry');
        return;
      }

      setInquiries((prev) =>
        prev.map((item) => (item.id === row.id ? { ...item, status: 1 } : item)),
      );
      toastSuccess('Inquiry marked as seen');
    } catch {
      toastError('Unable to connect server. Please try again.');
    }
  };

  const viewMessage = (row) => {
    Swal.fire({
      title: `Inquiry from ${row.fullName}`,
      html: `
        <div style="text-align:left">
          <p style="margin-bottom:8px;"><strong>Email:</strong> ${row.email}</p>
          <p style="margin-bottom:8px;"><strong>Phone:</strong> ${row.phone}</p>
          <p style="margin-bottom:8px;"><strong>Service:</strong> ${row.service}</p>
          <p style="margin-bottom:0;"><strong>Message:</strong><br/>${row.message}</p>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Close',
      confirmButtonColor: '#0b096c',
    });
  };

  const columns = useMemo(
    () => [
      { key: 'fullName', label: 'Name', sortable: true },
      { key: 'email', label: 'Email', sortable: true },
      { key: 'phone', label: 'Phone', sortable: false },
      { key: 'service', label: 'Service', sortable: true },
      {
        key: 'message',
        label: 'Message',
        sortable: false,
        render: (value) =>
          value.length > 40 ? <span title={value}>{value.slice(0, 40)}...</span> : value,
      },
      {
        key: 'status',
        label: 'Status',
        sortable: true,
        render: (value) => (
          <span className={`admin-badge ${value === 1 ? 'seen' : 'unseen'}`}>
            {value === 1 ? 'Seen' : 'Unseen'}
          </span>
        ),
      },
      { key: 'createdAt', label: 'Created At', sortable: true },
      {
        key: 'actions',
        label: 'Actions',
        render: (_, row) => (
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary admin-icon-btn"
              onClick={() => viewMessage(row)}
              title="View full message"
              aria-label="View full message"
            >
              <span aria-hidden="true">👁</span>
            </button>
            {row.status === 0 ? (
              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                onClick={() => markAsSeen(row)}
              >
                Mark Seen
              </button>
            ) : (
              <span className="text-muted">Seen</span>
            )}
          </div>
        ),
      },
    ],
    [],
  );

  if (loading) {
    return (
      <section className="admin-card">
        <p className="mb-0">Loading inquiries...</p>
      </section>
    );
  }

  return <AdminDataTable title="Inquiry Module" columns={columns} rows={inquiries} pageSize={7} />;
}

export default InquiryPage;

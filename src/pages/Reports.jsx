import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import './Reports.css';
import { AuthContext } from '../context/AuthContext';
import useWindowWidth from '../hooks/useWindowWidth';

export default function Reports() {
  const { user } = useContext(AuthContext);
  const [logs, setLogs] = useState([]);
  const width = useWindowWidth();
  const isMobile = width <= 768;

  const BASE_URL = 'https://olbqku3sei.execute-api.us-east-1.amazonaws.com';

  useEffect(() => {
    fetchLogs();
  });

  const fetchLogs = () => {
    axios
      .get(`${BASE_URL}/getlogs`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      })
      .then((res) => {
        const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
        const sortedLogs = data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setLogs(sortedLogs);
      })
      .catch((err) => {
        console.error("Error fetching logs:", err);
        alert('❌ Failed to fetch reports');
      });
  };

  const formatDate = (isoDate) => {
    if (!isoDate) return '';
    return new Date(isoDate).toISOString().slice(0, 19).replace('T', ' ');
  };

  const downloadCSV = () => {
    if (!logs.length) return;

    const csvRows = [
      ['#', 'Action', 'Product', 'Quantity', 'Date', 'User'],
      ...logs.map((log, index) => [
        index + 1,
        log.action,
        log.product,
        log.quantity,
        formatDate(log.date),
        log.user,
      ])
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([decodeURIComponent(escape(csvContent))], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory_report.csv';
    a.click();
  };

  return (
    <div className="report-container">
      <div className="report-header">
        <h2>📊 Inventory Activity Report</h2>
      </div>

      <div className='report-download'>
        <p>Download the full activity report as a CSV file for offline analysis.</p>
        <button className="download-btn" onClick={downloadCSV}>⬇️ Export CSV</button>
      </div>

      {logs.length === 0 ? (
        <p>No activity records found.</p>
      ) : isMobile ? (
        <div className="report-mobile-list">
          {logs.map((log, i) => (
            <div key={log.id || i} className="report-card">
              <p><span className="label">S.NO:</span> {i + 1}</p>
              <p><span className="label">Action:</span> <span className={`action ${log.action?.toLowerCase()}`}>{log.action}</span></p>
              <p><span className="label">Product:</span> {log.product}</p>
              <p><span className="label">Quantity:</span> {log.quantity}</p>
              <p><span className="label">Time:</span> {formatDate(log.date)}</p>
              <p><span className="label">User:</span> {log.user}</p>
            </div>
          ))}
        </div>
      ) : (
        <table className="report-table">
          <thead>
            <tr>
              <th>S.NO</th>
              <th>Action</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Date</th>
              <th>User</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, i) => (
              <tr key={log.id || i}>
                <td>{i + 1}</td>
                <td className={`action ${log.action?.toLowerCase()}`}>{log.action}</td>
                <td>{log.product}</td>
                <td>{log.quantity}</td>
                <td>{formatDate(log.date)}</td>
                <td>{log.user}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

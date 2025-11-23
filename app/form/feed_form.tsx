'use client'
import React, { useState, useEffect } from 'react';

// Sample data - Cattle with their calves defined in data structure
const cattleData = [
  {
    id: 'C001',
    name: 'Bessie',
    children: [
      { id: 'C001-1', name: 'Bessie Jr.' },
      { id: 'C001-2', name: 'Little Bess' }
    ]
  },
  {
    id: 'C002',
    name: 'Molly',
    children: [
      { id: 'C002-1', name: 'Molly Calf' }
    ]
  },
  {
    id: 'C003',
    name: 'Daisy',
    children: [
      { id: 'C003-1', name: 'Daisy Jr.' },
      { id: 'C003-2', name: 'Little Daisy' }
    ]
  },
  {
    id: 'C004',
    name: 'Rosie',
    children: []
  }
];

interface FeedingFormProps {
  initialDate?: string;
}

interface FeedRecord {
  animalId: string;
  session: string;
  feedType: string;
  quantity: number;
}

export default function FeedingForm({ initialDate }: FeedingFormProps) {
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });
  const [feedInputs, setFeedInputs] = useState<{ [key: string]: number }>({});
  const [totals, setTotals] = useState({
    morningHari: 0,
    morningBhusa: 0,
    morningChokar: 0,
    morningSupplement: 0,
    eveningHari: 0,
    eveningBhusa: 0,
    eveningChokar: 0,
    eveningSupplement: 0,
    grandTotal: 0
  });

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setDate(initialDate || today);

    // Initialize all inputs to 0
    const initialInputs: { [key: string]: number } = {};
    cattleData.forEach(cattle => {
      ['morning', 'evening'].forEach(session => {
        ['hari', 'bhusa', 'chokar', 'supplement'].forEach(feedType => {
          initialInputs[`${cattle.id}-${session}-${feedType}`] = 0;
        });
      });
      cattle.children.forEach(child => {
        ['morning', 'evening'].forEach(session => {
          ['hari', 'bhusa', 'chokar', 'supplement'].forEach(feedType => {
            initialInputs[`${child.id}-${session}-${feedType}`] = 0;
          });
        });
      });
    });
    setFeedInputs(initialInputs);
  }, [initialDate]);

  useEffect(() => {
    updateSummary();
  }, [feedInputs]);

  const updateSummary = () => {
    const feedTypes = ['hari', 'bhusa', 'chokar', 'supplement'];
    const sessions = ['morning', 'evening'];

    let grandTotal = 0;
    const newTotals: any = {};

    feedTypes.forEach(feedType => {
      let morningTotal = 0;
      let eveningTotal = 0;

      sessions.forEach(session => {
        Object.keys(feedInputs).forEach(key => {
          if (key.includes(`-${session}-${feedType}`)) {
            const value = feedInputs[key] || 0;
            if (session === 'morning') {
              morningTotal += value;
            } else {
              eveningTotal += value;
            }
          }
        });
      });

      const capitalizedFeedType = feedType.charAt(0).toUpperCase() + feedType.slice(1);
      newTotals[`morning${capitalizedFeedType}`] = morningTotal;
      newTotals[`evening${capitalizedFeedType}`] = eveningTotal;

      grandTotal += morningTotal + eveningTotal;
    });

    newTotals.grandTotal = grandTotal;
    setTotals(newTotals);
  };

  const handleInputChange = (inputId: string, value: string) => {
    setFeedInputs(prev => ({
      ...prev,
      [inputId]: parseFloat(value) || 0
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);

    const feedData = {
      date,
      records: [] as FeedRecord[]
    };

    Object.keys(feedInputs).forEach(inputId => {
      const value = feedInputs[inputId] || 0;
      if (value > 0) {
        const [animalId, session, feedType] = inputId.split('-');
        feedData.records.push({
          animalId,
          session,
          feedType,
          quantity: value
        });
      }
    });

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Feed Data:', feedData);

      setAlert({
        show: true,
        message: '🎉 Feeding record saved successfully!',
        type: 'success'
      });

      // Reset form
      setTimeout(() => {
        const resetInputs: { [key: string]: number } = {};
        Object.keys(feedInputs).forEach(key => {
          resetInputs[key] = 0;
        });
        setFeedInputs(resetInputs);
      }, 1500);

    } catch (error) {
      setAlert({
        show: true,
        message: '❌ Failed to save record. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(() => {
        setAlert(prev => ({ ...prev, show: false }));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [alert.show]);

  const renderTableFeedInputs = (animalId: string, session: string) => {
    const feedTypes = ['hari', 'bhusa', 'chokar', 'supplement'];
    
    return feedTypes.map(feedType => {
      const inputId = `${animalId}-${session}-${feedType}`;
      return (
        <td key={inputId}>
          <input
            type="number"
            className="feed-input"
            id={inputId}
            value={feedInputs[inputId] || 0}
            onChange={(e) => handleInputChange(inputId, e.target.value)}
            min="0"
            step="0.01"
          />
        </td>
      );
    });
  };

  return (
    <>
      <style jsx>{`
        :root {
          --color-background: #fcfcf9;
          --color-surface: #fffffe;
          --color-text: #13343b;
          --color-text-secondary: #626c71;
          --color-primary: #218085;
          --color-primary-hover: #1d7480;
          --color-border: rgba(94, 82, 64, 0.2);
          --color-card-border: rgba(94, 82, 64, 0.12);
          --color-secondary: rgba(94, 82, 64, 0.12);
          --color-secondary-hover: rgba(94, 82, 64, 0.2);
          --color-success-rgb: 33, 128, 141;
          --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
          --radius-base: 8px;
          --radius-xl: 16px;
        }

        @media (prefers-color-scheme: dark) {
          :root {
            --color-background: #1f2121;
            --color-surface: #262828;
            --color-text: #f5f5f5;
            --color-text-secondary: rgba(167, 169, 169, 0.7);
            --color-primary: #32b8c6;
            --color-primary-hover: #2da6b2;
            --color-border: rgba(119, 124, 124, 0.3);
            --color-card-border: rgba(119, 124, 124, 0.2);
            --color-secondary: rgba(119, 124, 124, 0.15);
            --color-secondary-hover: rgba(119, 124, 124, 0.25);
            --color-success-rgb: 50, 184, 198;
          }
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .page-container {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, var(--color-background) 0%, var(--color-secondary) 100%);
          color: var(--color-text);
          padding: 20px;
          min-height: 100vh;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .header {
          text-align: center;
          margin-bottom: 32px;
          animation: fadeIn 0.8s ease;
        }

        .header h1 {
          font-size: 2.5rem;
          background: linear-gradient(135deg, #218085 0%, #32b8c6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 8px;
        }

        .header p {
          color: var(--color-text-secondary);
          font-size: 1.1rem;
        }

        .card {
          background: var(--color-surface);
          border-radius: var(--radius-xl);
          border: 1px solid var(--color-card-border);
          box-shadow: var(--shadow-md);
          padding: 24px;
          margin-bottom: 24px;
          animation: slideUp 0.6s ease;
        }

        .card-header {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 2px solid var(--color-border);
        }

        .card-header svg {
          width: 32px;
          height: 32px;
          margin-right: 12px;
          color: var(--color-primary);
        }

        .card-header h2 {
          font-size: 1.5rem;
          font-weight: 600;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          font-size: 0.875rem;
          color: var(--color-text);
        }

        .form-control {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-base);
          font-size: 1rem;
          background: var(--color-surface);
          color: var(--color-text);
          transition: all 0.2s ease;
        }

        .form-control:focus {
          outline: 2px solid var(--color-primary);
          border-color: var(--color-primary);
        }

        .feeding-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 800px;
        }

        .feeding-table th,
        .feeding-table td {
          padding: 12px;
          text-align: center;
          border: 1px solid var(--color-border);
        }

        .feeding-table thead {
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .feeding-table th {
          background: var(--color-primary);
          color: white;
          font-weight: 600;
        }

        .feeding-table .cattle-name-cell {
          text-align: left;
          font-weight: 600;
          background: var(--color-secondary);
          position: sticky;
          left: 0;
          z-index: 50;
        }

        .feeding-table .cattle-row {
          background: rgba(139, 92, 246, 0.05);
        }

        .feeding-table .calf-row {
          background: var(--color-surface);
        }

        .feeding-table .calf-name-cell {
          padding-left: 30px;
          text-align: left;
          font-weight: 500;
          font-size: 0.9rem;
          color: var(--color-text-secondary);
        }

        .feeding-table input[type="number"] {
          width: 80px;
          padding: 6px 8px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-base);
          background: var(--color-surface);
          color: var(--color-text);
          text-align: center;
          font-size: 0.9rem;
        }

        .feeding-table input[type="number"]:focus {
          outline: 2px solid var(--color-primary);
          border-color: var(--color-primary);
        }

        .feeding-table tbody tr:hover {
          background: var(--color-secondary-hover);
        }

        .session-header {
          background: var(--color-secondary);
          font-size: 0.85rem;
          font-weight: 500;
        }

        .feed-icon {
          display: inline-block;
          margin-right: 4px;
          font-size: 1.1rem;
        }

        .summary-section {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: var(--color-surface);
          border-top: 2px solid var(--color-primary);
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
          z-index: 1000;
          padding: 12px 20px 70px 20px;
        }

        .summary-table {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          border-collapse: collapse;
        }

        .summary-table th,
        .summary-table td {
          padding: 8px 12px;
          text-align: center;
          border: 1px solid var(--color-border);
          font-size: 0.85rem;
        }

        .summary-table th {
          background: var(--color-secondary);
          font-weight: 600;
          color: var(--color-text);
        }

        .summary-table .total-row {
          background: var(--color-primary);
          color: white;
          font-weight: 700;
        }

        .summary-table .sub-header {
          background: var(--color-secondary);
          font-size: 0.75rem;
          font-weight: 500;
        }

        .btn {
          padding: 12px 24px;
          border: none;
          border-radius: var(--radius-base);
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-primary {
          position: fixed;
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #218085 0%, #32b8c6 100%);
          color: white;
          width: calc(100% - 40px);
          max-width: 1200px;
          padding: 16px;
          font-size: 1.1rem;
          z-index: 1001;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateX(-50%) translateY(-2px);
          box-shadow: 0 10px 20px rgba(33, 128, 133, 0.3);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .alert {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 16px 24px;
          border-radius: var(--radius-base);
          background: white;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          z-index: 1000;
          display: none;
          animation: slideInRight 0.3s ease;
        }

        .alert.show {
          display: block;
        }

        .alert.success {
          background: rgba(var(--color-success-rgb), 0.15);
          border-left: 4px solid var(--color-primary);
          color: var(--color-primary);
        }

        .alert.error {
          background: rgba(192, 21, 47, 0.15);
          border-left: 4px solid #c0152f;
          color: #c0152f;
        }

        .loader {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-right: 8px;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .content-wrapper {
          padding-bottom: 220px;
        }

        @media (max-width: 768px) {
          .header h1 {
            font-size: 2rem;
          }

          .summary-table {
            font-size: 0.75rem;
          }

          .summary-table th,
          .summary-table td {
            padding: 6px 8px;
          }

          .btn-primary {
            font-size: 1rem;
            padding: 14px;
          }

          .content-wrapper {
            padding-bottom: 250px;
          }
        }
      `}</style>

      <div className="page-container">
        <div className="container content-wrapper">
          <div className="header">
            <h1>🐄 Cattle Feeding Record</h1>
            <p>Track daily feed for your cattle and their children</p>
          </div>

          <form id="feedingForm" onSubmit={handleSubmit}>
            {/* Date Selection */}
            <div className="card">
              <div className="card-header">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <h2>Select Date</h2>
              </div>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  id="feedDate"
                  className="form-control"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>

            {/* Feeding Details */}
            <div className="card">
              <div className="card-header">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                </svg>
                <h2>Feeding Details</h2>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="feeding-table" id="feedingTable">
                  <thead>
                    <tr>
                      <th rowSpan={2} style={{ minWidth: '150px' }}>Cattle / Calf Name</th>
                      <th colSpan={4} className="session-header">🌅 Morning Feed (kg)</th>
                      <th colSpan={4} className="session-header">🌆 Evening Feed (kg)</th>
                    </tr>
                    <tr>
                      <th><span className="feed-icon">🌿</span>Hari Hari</th>
                      <th><span className="feed-icon">🌾</span>Bhusa</th>
                      <th><span className="feed-icon">🥣</span>Chokar</th>
                      <th><span className="feed-icon">💊</span>Supplement</th>
                      <th><span className="feed-icon">🌿</span>Hari Hari</th>
                      <th><span className="feed-icon">🌾</span>Bhusa</th>
                      <th><span className="feed-icon">🥣</span>Chokar</th>
                      <th><span className="feed-icon">💊</span>Supplement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cattleData.map(cattle => (
                      <React.Fragment key={cattle.id}>
                        <tr className="cattle-row">
                          <td className="cattle-name-cell">🐄 {cattle.name}</td>
                          {renderTableFeedInputs(cattle.id, 'morning')}
                          {renderTableFeedInputs(cattle.id, 'evening')}
                        </tr>
                        {cattle.children.map(child => (
                          <tr key={child.id} className="calf-row">
                            <td className="calf-name-cell">└─ 👶 {child.name}</td>
                            {renderTableFeedInputs(child.id, 'morning')}
                            {renderTableFeedInputs(child.id, 'evening')}
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </form>
        </div>

        {/* Fixed Summary Section at Bottom */}
        <div className="summary-section">
          <table className="summary-table">
            <thead>
              <tr>
                <th rowSpan={2}>Total Feed Summary</th>
                <th colSpan={4} className="sub-header">🌅 Morning Feed (kg)</th>
                <th colSpan={4} className="sub-header">🌆 Evening Feed (kg)</th>
                <th rowSpan={2}>📊 Total (kg)</th>
              </tr>
              <tr>
                <th>🌿</th>
                <th>🌾</th>
                <th>🥣</th>
                <th>💊</th>
                <th>🌿</th>
                <th>🌾</th>
                <th>🥣</th>
                <th>💊</th>
              </tr>
            </thead>
            <tbody>
              <tr className="total-row">
                <td>TOTAL</td>
                <td>{totals.morningHari.toFixed(2)}</td>
                <td>{totals.morningBhusa.toFixed(2)}</td>
                <td>{totals.morningChokar.toFixed(2)}</td>
                <td>{totals.morningSupplement.toFixed(2)}</td>
                <td>{totals.eveningHari.toFixed(2)}</td>
                <td>{totals.eveningBhusa.toFixed(2)}</td>
                <td>{totals.eveningChokar.toFixed(2)}</td>
                <td>{totals.eveningSupplement.toFixed(2)}</td>
                <td>{totals.grandTotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Fixed Submit Button */}
        <button
          type="submit"
          form="feedingForm"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="loader"></span> Saving...
            </>
          ) : (
            'SAVE FEEDING RECORD'
          )}
        </button>

        {alert.show && (
          <div className={`alert ${alert.type} show`}>
            {alert.message}
          </div>
        )}
      </div>
    </>
  );
}

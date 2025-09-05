import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Medications.css';

const Medications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [medications, setMedications] = useState([
    {
      id: 1,
      name: 'Vitamin D',
      dosage: '1000 IU',
      frequency: 'Daily',
      time: 'Morning',
      type: 'supplement',
      status: 'active'
    },
    {
      id: 2,
      name: 'Iron Supplement',
      dosage: '65mg',
      frequency: 'Daily',
      time: 'Evening',
      type: 'supplement',
      status: 'active'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: 'Daily',
    time: 'Morning',
    type: 'medication',
    notes: ''
  });

  const handleAddMedication = (e) => {
    e.preventDefault();
    const medication = {
      id: Date.now(),
      ...newMedication,
      status: 'active'
    };
    setMedications([...medications, medication]);
    setNewMedication({
      name: '',
      dosage: '',
      frequency: 'Daily',
      time: 'Morning',
      type: 'medication',
      notes: ''
    });
    setShowAddForm(false);
  };

  const toggleMedicationStatus = (id) => {
    setMedications(medications.map(med => 
      med.id === id 
        ? { ...med, status: med.status === 'active' ? 'inactive' : 'active' }
        : med
    ));
  };

  const deleteMedication = (id) => {
    setMedications(medications.filter(med => med.id !== id));
  };

  const getStatusColor = (status) => {
    return status === 'active' ? '#4ecdc4' : '#ff6b9d';
  };

  return (
    <div className="medications-container">
      <div className="medications-header">
        <button className="back-button" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>Medications & Supplements</h1>
        <p>Track your medications, supplements, and health routines</p>
      </div>

      <div className="medications-content">
        <div className="medications-actions">
          <button 
            className="add-medication-btn"
            onClick={() => setShowAddForm(true)}
          >
            + Add Medication
          </button>
        </div>

        <div className="medications-grid">
          {medications.map(medication => (
            <div 
              key={medication.id} 
              className={`medication-card ${medication.status}`}
            >
              <div className="medication-header">
                <div className="medication-info">
                  <h3>{medication.name}</h3>
                  <span className="medication-type">{medication.type}</span>
                </div>
                <div className="medication-status">
                  <span 
                    className="status-dot"
                    style={{ backgroundColor: getStatusColor(medication.status) }}
                  ></span>
                  <span className="status-text">{medication.status}</span>
                </div>
              </div>

              <div className="medication-details">
                <div className="detail-item">
                  <span className="detail-label">Dosage:</span>
                  <span className="detail-value">{medication.dosage}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Frequency:</span>
                  <span className="detail-value">{medication.frequency}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Time:</span>
                  <span className="detail-value">{medication.time}</span>
                </div>
              </div>

              <div className="medication-actions">
                <button 
                  className="action-btn"
                  onClick={() => toggleMedicationStatus(medication.id)}
                >
                  {medication.status === 'active' ? 'Pause' : 'Resume'}
                </button>
                <button 
                  className="action-btn secondary"
                  onClick={() => deleteMedication(medication.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {medications.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">💊</div>
            <h3>No medications added yet</h3>
            <p>Start tracking your medications and supplements to stay on top of your health routine.</p>
            <button 
              className="add-medication-btn"
              onClick={() => setShowAddForm(true)}
            >
              Add Your First Medication
            </button>
          </div>
        )}
      </div>

      {/* Add Medication Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add New Medication</h3>
              <button 
                className="close-button"
                onClick={() => setShowAddForm(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleAddMedication} className="medication-form">
              <div className="form-group">
                <label>Medication/Supplement Name</label>
                <input
                  type="text"
                  value={newMedication.name}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Vitamin D, Ibuprofen"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Dosage</label>
                  <input
                    type="text"
                    value={newMedication.dosage}
                    onChange={(e) => setNewMedication(prev => ({ ...prev, dosage: e.target.value }))}
                    placeholder="e.g., 1000 IU, 500mg"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <select
                    value={newMedication.type}
                    onChange={(e) => setNewMedication(prev => ({ ...prev, type: e.target.value }))}
                  >
                    <option value="medication">Medication</option>
                    <option value="supplement">Supplement</option>
                    <option value="vitamin">Vitamin</option>
                    <option value="herbal">Herbal</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Frequency</label>
                  <select
                    value={newMedication.frequency}
                    onChange={(e) => setNewMedication(prev => ({ ...prev, frequency: e.target.value }))}
                  >
                    <option value="Daily">Daily</option>
                    <option value="Twice Daily">Twice Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="As Needed">As Needed</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Time of Day</label>
                  <select
                    value={newMedication.time}
                    onChange={(e) => setNewMedication(prev => ({ ...prev, time: e.target.value }))}
                  >
                    <option value="Morning">Morning</option>
                    <option value="Afternoon">Afternoon</option>
                    <option value="Evening">Evening</option>
                    <option value="Bedtime">Bedtime</option>
                    <option value="With Meals">With Meals</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Notes (Optional)</label>
                <textarea
                  value={newMedication.notes}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any special instructions or side effects to watch for..."
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-button"
                >
                  Add Medication
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Medications;


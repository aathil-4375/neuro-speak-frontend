// frontend/src/pages/Home.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import bgImage from '../assets/left-container.jpg';
import { UserPlus, Search, UserMinus, UserCog, X, Eye, EyeOff } from 'lucide-react';
import { patientService } from '../services/patients';
import { useToast } from '../contexts/ToastContext';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-2xl shadow-lg w-96 p-6 relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
        <div className="space-y-3">{children}</div>
      </div>
    </div>
  );
};

const Home = () => {
  const [modalOpen, setModalOpen] = useState(null);
  const [patients, setPatients] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  
  const [form, setForm] = useState({
    fullName: '',
    patientId: '',
    gender: '',
    password: '',
    confirmPassword: '',
  });

  const [search, setSearch] = useState({
    patientId: '',
  });

  const [searchResults, setSearchResults] = useState([]);
  const [updateData, setUpdateData] = useState(null);
  const [updateForm, setUpdateForm] = useState({});

  const fetchPatients = useCallback(async () => {
    try {
      const response = await patientService.getAllPatients();
      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
      showError('Failed to fetch patients');
    }
  }, [showError]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const openModal = (type) => setModalOpen(type);
  
  const closeModal = () => {
    setModalOpen(null);
    setForm({
      fullName: '',
      patientId: '',
      gender: '',
      password: '',
      confirmPassword: '',
    });
    setSearch({ patientId: '' });
    setSearchResults([]);
    setUpdateData(null);
    setUpdateForm({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleAdd = async () => {
    if (!form.fullName || !form.patientId || !form.gender) {
      showError('Please fill in all required fields');
      return;
    }

    if (form.password && form.password !== form.confirmPassword) {
      showError('Passwords do not match!');
      return;
    }
    
    try {
      const patientData = {
        full_name: form.fullName,
        patient_id: form.patientId,
        gender: form.gender,
        first_clinic_date: new Date().toISOString().split('T')[0] // Add today's date
      };
      
      console.log('Sending patient data:', patientData);
      
      const response = await patientService.createPatient(patientData);
      console.log('Add patient response:', response);
      
      await fetchPatients();
      closeModal();
      showSuccess('Patient added successfully!');
    } catch (error) {
      console.error('Error creating patient:', error.response?.data || error);
      showError(error.response?.data?.detail || error.response?.data?.error || 'Failed to add patient. Please try again.');
    }
  };

  const handleSearch = async () => {
    if (!search.patientId) {
      showError('Please enter Patient ID to search');
      return;
    }
    
    try {
      const response = await patientService.searchPatients(search.patientId);
      if (response.data && response.data.length > 0) {
        const patient = response.data[0];
        navigate('/home/patient', { state: { patient } });
      } else {
        showError('Patient not found');
      }
    } catch (error) {
      console.error('Error searching patients:', error);
      showError('Search failed. Please try again.');
    }
  };

  const handleUpdate = async () => {
    try {
      const patientData = {
        full_name: updateForm.full_name,
        gender: updateForm.gender,
        patient_id: updateData.patient_id // Include patient_id in case backend needs it
      };
      
      console.log('Updating patient:', patientData);
      
      await patientService.updatePatient(updateData.patient_id, patientData);
      await fetchPatients();
      closeModal();
      showSuccess('Patient updated successfully!');
    } catch (error) {
      console.error('Error updating patient:', error.response?.data || error);
      showError(error.response?.data?.error || error.response?.data?.detail || 'Failed to update patient. Please try again.');
    }
  };

  const handleRemove = async () => {
    if (!search.patientId) {
      showError('Please enter Patient ID to remove');
      return;
    }
    
    try {
      await patientService.deletePatient(search.patientId);
      await fetchPatients();
      closeModal();
      showSuccess('Patient removed successfully!');
    } catch (error) {
      console.error('Error removing patient:', error);
      showError('Failed to remove patient. Please try again.');
    }
  };

  const handlePatientSelect = (patient) => {
    navigate('/home/patient', { state: { patient } });
  };

  return (
    <>
      <NavBar />
      <div
        className="w-full bg-no-repeat bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-black bg-opacity-50 px-4 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Add', icon: <UserPlus />, type: 'Add' },
              { label: 'Search', icon: <Search />, type: 'Search' },
              { label: 'Update', icon: <UserCog />, type: 'Update' },
              { label: 'Remove', icon: <UserMinus />, type: 'Remove' },
            ].map(({ label, icon, type }) => (
              <button
                key={type}
                className="w-36 h-36 flex flex-col items-center justify-center rounded-xl bg-custom-blue text-white hover:bg-white hover:text-custom-blue transition text-base font-medium"
                onClick={() => openModal(type)}
              >
                <div className="w-8 h-8 mb-2">{icon}</div>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Display all patients */}
        {patients.length > 0 && (
          <div className="mx-auto max-w-6xl px-4 pb-10">
            <h2 className="text-2xl font-bold text-white mb-4">All Patients</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {patients.map((patient, index) => (
                <div 
                  key={index} 
                  className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-lg transition"
                  onClick={() => handlePatientSelect(patient)}
                >
                  <p><strong>Name:</strong> {patient.full_name}</p>
                  <p><strong>ID:</strong> {patient.patient_id}</p>
                  <p><strong>Gender:</strong> {patient.gender}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Modal isOpen={modalOpen === 'Add'} onClose={closeModal} title="Add Patient">
        <input
          placeholder="Full Name"
          className="w-full border rounded-lg p-2"
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
        />
        <input
          placeholder="Patient ID"
          className="w-full border rounded-lg p-2"
          value={form.patientId}
          onChange={(e) => setForm({ ...form, patientId: e.target.value })}
        />
        <select
          className="w-full border rounded-lg p-2"
          value={form.gender}
          onChange={(e) => setForm({ ...form, gender: e.target.value })}
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
        {/* Password fields are optional for patients */}
        <div className="relative">
          <input
            placeholder="Password (Optional)"
            type={showPassword ? "text" : "password"}
            className="w-full border rounded-lg p-2 pr-10"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <div className="relative">
          <input
            placeholder="Confirm Password (Optional)"
            type={showConfirmPassword ? "text" : "password"}
            className="w-full border rounded-lg p-2 pr-10"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <button
          className="w-full bg-custom-blue text-white py-2 rounded-lg hover:bg-white hover:text-custom-blue border border-custom-blue transition"
          onClick={handleAdd}
        >
          Add Patient
        </button>
      </Modal>

      {/* Search Modal */}
      <Modal isOpen={modalOpen === 'Search'} onClose={closeModal} title="Search Patient">
        <input
          placeholder="Patient ID"
          className="w-full border rounded-lg p-2"
          value={search.patientId}
          onChange={(e) => setSearch({ ...search, patientId: e.target.value })}
        />
        <button
          className="w-full bg-custom-blue text-white py-2 rounded-lg hover:bg-white hover:text-custom-blue border border-custom-blue transition"
          onClick={handleSearch}
        >
          Search
        </button>
        {searchResults.map((p, index) => (
          <div 
            key={index} 
            className="border p-3 rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100 transition"
            onClick={() => handlePatientSelect(p)}
          >
            <p><strong>Name:</strong> {p.full_name}</p>
            <p><strong>Gender:</strong> {p.gender}</p>
          </div>
        ))}
      </Modal>

      {/* Update Modal */}
      <Modal isOpen={modalOpen === 'Update'} onClose={closeModal} title="Update Patient">
        {!updateData ? (
          <>
            <input
              placeholder="Patient ID"
              className="w-full border rounded-lg p-2"
              value={search.patientId}
              onChange={(e) => setSearch({ ...search, patientId: e.target.value })}
            />
            <button
              className="w-full bg-custom-blue text-white py-2 rounded-lg hover:bg-white hover:text-custom-blue border border-custom-blue transition"
              onClick={async () => {
                if (!search.patientId) {
                  showError('Please enter Patient ID');
                  return;
                }
                try {
                  const response = await patientService.getPatient(search.patientId);
                  setUpdateData(response.data);
                  setUpdateForm(response.data);
                } catch (error) {
                  showError('Patient not found');
                }
              }}
            >
              Find
            </button>
          </>
        ) : (
          <>
            <input
              placeholder="Full Name"
              className="w-full border rounded-lg p-2"
              value={updateForm.full_name || ''}
              onChange={(e) => setUpdateForm({ ...updateForm, full_name: e.target.value })}
            />
            <select
              className="w-full border rounded-lg p-2"
              value={updateForm.gender}
              onChange={(e) => setUpdateForm({ ...updateForm, gender: e.target.value })}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            <button
              className="w-full bg-custom-blue text-white py-2 rounded-lg hover:bg-white hover:text-custom-blue border border-custom-blue transition"
              onClick={handleUpdate}
            >
              Update
            </button>
          </>
        )}
      </Modal>

      {/* Remove Modal */}
      <Modal isOpen={modalOpen === 'Remove'} onClose={closeModal} title="Remove Patient">
        <input
          placeholder="Patient ID"
          className="w-full border rounded-lg p-2"
          value={search.patientId}
          onChange={(e) => setSearch({ ...search, patientId: e.target.value })}
        />
        <button
          className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-white hover:text-red-600 border border-red-600 transition"
          onClick={handleRemove}
        >
          Confirm Remove
        </button>
      </Modal>
    </>
  );
};

export default Home;
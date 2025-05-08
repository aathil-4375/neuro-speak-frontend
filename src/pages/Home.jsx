// frontend/src/pages/Home.jsx - Enhanced Version
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { UserPlus, Search, UserMinus, UserCog, X, Eye, EyeOff, Users, PlusCircle, Clipboard, PieChart } from 'lucide-react';
import { patientService } from '../services/patients';
import { useToast } from '../contexts/ToastContext';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-96 p-6 relative border border-gray-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold text-gray-800 mb-6">{title}</h2>
        <div className="space-y-4">{children}</div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, color }) => (
  <div className={`bg-gradient-to-br ${color} rounded-xl shadow-md p-5`}>
    <div className="flex items-center justify-between">
      <div className="w-12 h-12 bg-white bg-opacity-30 rounded-lg flex items-center justify-center">
        {icon}
      </div>
      <div className="text-right">
        <p className="text-white text-opacity-90 text-sm font-medium">{title}</p>
        <p className="text-white text-2xl font-bold">{value}</p>
      </div>
    </div>
  </div>
);

const PatientCard = ({ patient, onClick }) => (
  <div 
    onClick={onClick}
    className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer group"
  >
    <div className="p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-custom-blue rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-lg">{patient.full_name.charAt(0)}</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 group-hover:text-custom-blue transition-colors">
              {patient.full_name}
            </h3>
            <p className="text-sm text-gray-500">ID: {patient.patient_id}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium 
          ${patient.gender === 'Male' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}`}>
          {patient.gender}
        </div>
      </div>
    </div>
    <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">First Visit: {new Date(patient.first_clinic_date).toLocaleDateString()}</span>
        <button className="text-custom-blue text-sm font-medium hover:underline">
          View Details
        </button>
      </div>
    </div>
  </div>
);

const ActionButton = ({ icon, label, onClick, color = "from-custom-blue to-indigo-600" }) => (
  <button
    onClick={onClick}
    className={`w-full flex flex-col items-center justify-center py-8 rounded-xl bg-gradient-to-r ${color} text-white hover:shadow-lg transition duration-300 transform hover:scale-105`}
  >
    <div className="bg-white bg-opacity-20 rounded-full p-3 mb-3">
      {icon}
    </div>
    <span className="font-medium">{label}</span>
  </button>
);

const Home = () => {
  const [modalOpen, setModalOpen] = useState(null);
  const [patients, setPatients] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    male: 0,
    female: 0,
    recent: 0
  });
  
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
      setLoading(true);
      const response = await patientService.getAllPatients();
      setPatients(response.data);
      
      // Calculate stats
      const maleCount = response.data.filter(p => p.gender === 'Male').length;
      const femaleCount = response.data.filter(p => p.gender === 'Female').length;
      
      // Calculate patients added in the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentPatients = response.data.filter(p => {
        const firstVisit = new Date(p.first_clinic_date);
        return firstVisit >= thirtyDaysAgo;
      }).length;
      
      setStats({
        total: response.data.length,
        male: maleCount,
        female: femaleCount,
        recent: recentPatients
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching patients:', error);
      showError('Failed to fetch patients');
      setLoading(false);
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
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-custom-blue to-indigo-700 rounded-2xl shadow-lg mb-8">
          <div className="px-8 py-10 text-white">
            <h1 className="text-3xl font-bold mb-2">Welcome to NeuroSpeak</h1>
            <p className="text-white text-opacity-90 max-w-3xl">
              Your comprehensive platform for speech therapy management. Track patient progress, 
              manage phoneme practice, and visualize improvement over time.
            </p>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              <StatCard 
                icon={<Users className="w-6 h-6 text-custom-blue" />} 
                title="Total Patients" 
                value={stats.total} 
                color="from-blue-600 to-blue-800" 
              />
              <StatCard 
                icon={<PlusCircle className="w-6 h-6 text-green-600" />} 
                title="Recent Patients" 
                value={stats.recent} 
                color="from-green-500 to-green-700" 
              />
              <StatCard 
                icon={<Clipboard className="w-6 h-6 text-amber-600" />} 
                title="Male Patients" 
                value={stats.male} 
                color="from-amber-500 to-amber-700" 
              />
              <StatCard 
                icon={<PieChart className="w-6 h-6 text-purple-600" />} 
                title="Female Patients" 
                value={stats.female} 
                color="from-purple-500 to-purple-700" 
              />
            </div>
          </div>
        </div>
        
        {/* Actions Section */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-5">Patient Management</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ActionButton 
              icon={<UserPlus className="w-6 h-6" />} 
              label="Add Patient" 
              onClick={() => openModal('Add')} 
              color="from-custom-blue to-blue-700" 
            />
            <ActionButton 
              icon={<Search className="w-6 h-6" />} 
              label="Search Patient" 
              onClick={() => openModal('Search')} 
              color="from-green-500 to-green-700" 
            />
            <ActionButton 
              icon={<UserCog className="w-6 h-6" />} 
              label="Update Patient" 
              onClick={() => openModal('Update')} 
              color="from-amber-500 to-amber-700" 
            />
            <ActionButton 
              icon={<UserMinus className="w-6 h-6" />} 
              label="Remove Patient" 
              onClick={() => openModal('Remove')} 
              color="from-red-500 to-red-700" 
            />
          </div>
        </div>
        
        {/* Patient List Section */}
        {patients.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Your Patients</h2>
              <div className="text-sm text-gray-500">{patients.length} patients registered</div>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-pulse text-custom-blue">Loading patients...</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {patients.map((patient, index) => (
                  <PatientCard 
                    key={index} 
                    patient={patient} 
                    onClick={() => handlePatientSelect(patient)} 
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Modal isOpen={modalOpen === 'Add'} onClose={closeModal} title="Add Patient">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-custom-blue focus:border-custom-blue transition"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              placeholder="Enter patient's full name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient ID</label>
            <input
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-custom-blue focus:border-custom-blue transition"
              value={form.patientId}
              onChange={(e) => setForm({ ...form, patientId: e.target.value })}
              placeholder="Enter unique patient ID"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-custom-blue focus:border-custom-blue transition"
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          
          {/* Password fields are optional for patients */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password (Optional)</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full border border-gray-300 rounded-lg p-2.5 pr-10 focus:ring-2 focus:ring-custom-blue focus:border-custom-blue transition"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Create a password"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="w-full border border-gray-300 rounded-lg p-2.5 pr-10 focus:ring-2 focus:ring-custom-blue focus:border-custom-blue transition"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="Confirm password"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          
          <button
            className="w-full bg-gradient-to-r from-custom-blue to-indigo-600 text-white py-3 rounded-lg font-medium hover:from-indigo-600 hover:to-custom-blue transition shadow-md hover:shadow-lg"
            onClick={handleAdd}
          >
            Add Patient
          </button>
        </div>
      </Modal>

      {/* Search Modal */}
      <Modal isOpen={modalOpen === 'Search'} onClose={closeModal} title="Search Patient">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient ID</label>
            <input
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-custom-blue focus:border-custom-blue transition"
              value={search.patientId}
              onChange={(e) => setSearch({ ...search, patientId: e.target.value })}
              placeholder="Enter patient ID to search"
            />
          </div>
          
          <button
            className="w-full bg-gradient-to-r from-custom-blue to-indigo-600 text-white py-3 rounded-lg font-medium hover:from-indigo-600 hover:to-custom-blue transition shadow-md hover:shadow-lg"
            onClick={handleSearch}
          >
            Search Patient
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
        </div>
      </Modal>

      {/* Update Modal */}
      <Modal isOpen={modalOpen === 'Update'} onClose={closeModal} title="Update Patient">
        {!updateData ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Patient ID</label>
              <input
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-custom-blue focus:border-custom-blue transition"
                value={search.patientId}
                onChange={(e) => setSearch({ ...search, patientId: e.target.value })}
                placeholder="Enter patient ID to update"
              />
            </div>
            
            <button
              className="w-full bg-gradient-to-r from-custom-blue to-indigo-600 text-white py-3 rounded-lg font-medium hover:from-indigo-600 hover:to-custom-blue transition shadow-md hover:shadow-lg"
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
              Find Patient
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-custom-blue focus:border-custom-blue transition"
                value={updateForm.full_name || ''}
                onChange={(e) => setUpdateForm({ ...updateForm, full_name: e.target.value })}
                placeholder="Enter patient's full name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-custom-blue focus:border-custom-blue transition"
                value={updateForm.gender}
                onChange={(e) => setUpdateForm({ ...updateForm, gender: e.target.value })}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            
            <button
              className="w-full bg-gradient-to-r from-custom-blue to-indigo-600 text-white py-3 rounded-lg font-medium hover:from-indigo-600 hover:to-custom-blue transition shadow-md hover:shadow-lg"
              onClick={handleUpdate}
            >
              Update Patient
            </button>
          </div>
        )}
      </Modal>

      {/* Remove Modal */}
      <Modal isOpen={modalOpen === 'Remove'} onClose={closeModal} title="Remove Patient">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient ID</label>
            <input
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-custom-blue focus:border-custom-blue transition"
              value={search.patientId}
              onChange={(e) => setSearch({ ...search, patientId: e.target.value })}
              placeholder="Enter patient ID to remove"
            />
          </div>
          
          <div className="bg-red-50 text-red-800 p-3 rounded-lg text-sm">
            <p>Warning: This action cannot be undone. The patient and all associated data will be permanently removed.</p>
          </div>
          
          <button
            className="w-full bg-gradient-to-r from-red-500 to-red-700 text-white py-3 rounded-lg font-medium hover:from-red-600 hover:to-red-800 transition shadow-md hover:shadow-lg"
            onClick={handleRemove}
          >
            Confirm Removal
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Home;
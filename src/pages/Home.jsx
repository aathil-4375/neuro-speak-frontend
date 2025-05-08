// frontend/src/pages/Home.jsx - Enhanced Version
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { 
  UserPlus, 
  Search, 
  UserMinus, 
  UserCog, 
  X, 
  Eye, 
  EyeOff,
  Shield,
  Clock,
  Users,
  Sparkles,
  Calendar
} from 'lucide-react';
import { patientService } from '../services/patients';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-96 p-6 relative border border-gray-100">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold text-gray-800 mb-6">{title}</h2>
        <div className="space-y-4">{children}</div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, bgColor }) => {
  return (
    <div className={`${bgColor} rounded-xl p-6 flex items-center shadow-md`}>
      <div className="p-3 bg-white bg-opacity-30 rounded-lg mr-4">
        {icon}
      </div>
      <div>
        <p className="text-white text-opacity-90 text-sm font-medium">{title}</p>
        <p className="text-white text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
};

const Home = () => {
  const [modalOpen, setModalOpen] = useState(null);
  const [patients, setPatients] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  const [stats, setStats] = useState({
    totalPatients: 0,
    activeTreatments: 0,
    completedTreatments: 0,
    upcomingAppointments: 0
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { user } = useAuth();
  
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
  const [loading, setLoading] = useState(true);

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      const response = await patientService.getAllPatients();
      setPatients(response.data);
      
      // Set recent patients (last 5)
      setRecentPatients(response.data.slice(0, 5));
      
      // Set mock stats based on patient data
      setStats({
        totalPatients: response.data.length,
        activeTreatments: Math.floor(response.data.length * 0.7),
        completedTreatments: Math.floor(response.data.length * 0.3),
        upcomingAppointments: Math.floor(response.data.length * 0.5)
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

  const actionCards = [
    { label: 'Add Patient', icon: <UserPlus className="w-6 h-6" />, type: 'Add', color: 'from-emerald-500 to-teal-600' },
    { label: 'Search Patient', icon: <Search className="w-6 h-6" />, type: 'Search', color: 'from-blue-500 to-indigo-600' },
    { label: 'Update Patient', icon: <UserCog className="w-6 h-6" />, type: 'Update', color: 'from-amber-500 to-orange-600' },
    { label: 'Remove Patient', icon: <UserMinus className="w-6 h-6" />, type: 'Remove', color: 'from-rose-500 to-red-600' }
  ];

  if (loading) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-lg text-gray-600">Loading dashboard...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.first_name || 'Doctor'}</h1>
            <p className="text-gray-600 mt-1">Here's what's happening with your patients today.</p>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              icon={<Users className="w-6 h-6 text-blue-500" />} 
              title="Total Patients" 
              value={stats.totalPatients} 
              bgColor="bg-gradient-to-r from-blue-500 to-indigo-600" 
            />
            <StatCard 
              icon={<Sparkles className="w-6 h-6 text-amber-500" />} 
              title="Active Treatments" 
              value={stats.activeTreatments} 
              bgColor="bg-gradient-to-r from-amber-500 to-orange-600" 
            />
            <StatCard 
              icon={<Shield className="w-6 h-6 text-emerald-500" />} 
              title="Completed Treatments" 
              value={stats.completedTreatments} 
              bgColor="bg-gradient-to-r from-emerald-500 to-teal-600" 
            />
            <StatCard 
              icon={<Calendar className="w-6 h-6 text-purple-500" />} 
              title="Upcoming Appointments" 
              value={stats.upcomingAppointments} 
              bgColor="bg-gradient-to-r from-purple-500 to-violet-600" 
            />
          </div>

          {/* Actions Section */}
          <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {actionCards.map((card) => (
                <button
                  key={card.type}
                  className={`p-6 rounded-xl bg-gradient-to-r ${card.color} text-white shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1`}
                  onClick={() => openModal(card.type)}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-3">
                      {card.icon}
                    </div>
                    <span className="font-medium text-white">{card.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Patients Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">Recent Patients</h2>
                  <button 
                    onClick={() => navigate('/patients')} 
                    className="text-sm text-custom-blue hover:text-indigo-700 font-medium"
                  >
                    View All
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b border-gray-200">
                        <th className="pb-3 text-sm font-medium text-gray-500">Patient Name</th>
                        <th className="pb-3 text-sm font-medium text-gray-500">ID</th>
                        <th className="pb-3 text-sm font-medium text-gray-500">Gender</th>
                        <th className="pb-3 text-sm font-medium text-gray-500">First Visit</th>
                        <th className="pb-3 text-sm font-medium text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {recentPatients.map((patient, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 pr-4">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gradient-to-r from-custom-blue to-indigo-600 rounded-full flex items-center justify-center text-white font-medium">
                                {patient.full_name.charAt(0)}
                              </div>
                              <span className="ml-2 font-medium text-gray-900">{patient.full_name}</span>
                            </div>
                          </td>
                          <td className="py-3 pr-4 text-gray-700">{patient.patient_id}</td>
                          <td className="py-3 pr-4 text-gray-700">{patient.gender}</td>
                          <td className="py-3 pr-4 text-gray-700">{patient.first_clinic_date || 'N/A'}</td>
                          <td className="py-3">
                            <button 
                              onClick={() => handlePatientSelect(patient)}
                              className="px-3 py-1 bg-custom-blue text-white text-sm rounded-md hover:bg-indigo-700 transition-colors"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Today's Schedule Section */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Today's Schedule</h2>
                <div className="space-y-4">
                  {patients.slice(0, 3).map((patient, index) => (
                    <div key={index} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{patient.full_name}</h3>
                          <p className="text-sm text-gray-500 mt-1">Therapy Session</p>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-1" />
                          {index === 0 ? '9:00 AM' : index === 1 ? '11:30 AM' : '2:15 PM'}
                        </div>
                      </div>
                      <div className="mt-3 flex justify-between">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium">
                          {index === 0 ? 'Speech Therapy' : index === 1 ? 'Assessment' : 'Follow-up'}
                        </span>
                        <button 
                          onClick={() => handlePatientSelect(patient)}
                          className="text-sm text-custom-blue hover:text-indigo-700 font-medium"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                  {patients.length === 0 && (
                    <div className="text-center py-6 text-gray-500">
                      <p>No appointments scheduled for today</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* All Patients Section */}
          {patients.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">All Patients</h2>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search patients..."
                    className="pl-9 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-custom-blue focus:border-custom-blue"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {patients.map((patient, index) => (
                  <div
                    key={index}
                    onClick={() => handlePatientSelect(patient)}
                    className="bg-gray-50 hover:bg-gray-100 p-4 rounded-xl border border-gray-200 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-custom-blue to-indigo-600 rounded-full flex items-center justify-center text-white font-medium">
                        {patient.full_name.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <h3 className="font-medium text-gray-900">{patient.full_name}</h3>
                        <p className="text-sm text-gray-500">ID: {patient.patient_id}</p>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Gender: {patient.gender}</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs font-medium">
                        Active
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      <Modal isOpen={modalOpen === 'Add'} onClose={closeModal} title="Add New Patient">
        <input
          placeholder="Full Name"
          className="w-full border rounded-lg p-3 bg-gray-50 focus:ring-2 focus:ring-custom-blue focus:border-custom-blue"
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
        />
        <input
          placeholder="Patient ID"
          className="w-full border rounded-lg p-3 bg-gray-50 focus:ring-2 focus:ring-custom-blue focus:border-custom-blue"
          value={form.patientId}
          onChange={(e) => setForm({ ...form, patientId: e.target.value })}
        />
        <select
          className="w-full border rounded-lg p-3 bg-gray-50 focus:ring-2 focus:ring-custom-blue focus:border-custom-blue"
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
            className="w-full border rounded-lg p-3 pr-10 bg-gray-50 focus:ring-2 focus:ring-custom-blue focus:border-custom-blue"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <div className="relative">
          <input
            placeholder="Confirm Password (Optional)"
            type={showConfirmPassword ? "text" : "password"}
            className="w-full border rounded-lg p-3 pr-10 bg-gray-50 focus:ring-2 focus:ring-custom-blue focus:border-custom-blue"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <button
          className="w-full bg-gradient-to-r from-custom-blue to-indigo-600 text-white py-3 rounded-lg hover:from-indigo-600 hover:to-custom-blue transition-all font-medium"
          onClick={handleAdd}
        >
          Add Patient
        </button>
      </Modal>

      {/* Search Modal */}
      <Modal isOpen={modalOpen === 'Search'} onClose={closeModal} title="Search Patient">
        <input
          placeholder="Enter Patient ID"
          className="w-full border rounded-lg p-3 bg-gray-50 focus:ring-2 focus:ring-custom-blue focus:border-custom-blue"
          value={search.patientId}
          onChange={(e) => setSearch({ ...search, patientId: e.target.value })}
        />
        <button
          className="w-full bg-gradient-to-r from-custom-blue to-indigo-600 text-white py-3 rounded-lg hover:from-indigo-600 hover:to-custom-blue transition-all font-medium"
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
              placeholder="Enter Patient ID"
              className="w-full border rounded-lg p-3 bg-gray-50 focus:ring-2 focus:ring-custom-blue focus:border-custom-blue"
              value={search.patientId}
              onChange={(e) => setSearch({ ...search, patientId: e.target.value })}
            />
            <button
              className="w-full bg-gradient-to-r from-custom-blue to-indigo-600 text-white py-3 rounded-lg hover:from-indigo-600 hover:to-custom-blue transition-all font-medium"
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
          </>
        ) : (
          <>
            <input
              placeholder="Full Name"
              className="w-full border rounded-lg p-3 bg-gray-50 focus:ring-2 focus:ring-custom-blue focus:border-custom-blue"
              value={updateForm.full_name || ''}
              onChange={(e) => setUpdateForm({ ...updateForm, full_name: e.target.value })}
            />
            <select
              className="w-full border rounded-lg p-3 bg-gray-50 focus:ring-2 focus:ring-custom-blue focus:border-custom-blue"
              value={updateForm.gender}
              onChange={(e) => setUpdateForm({ ...updateForm, gender: e.target.value })}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            <button
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3 rounded-lg hover:from-orange-600 hover:to-amber-500 transition-all font-medium"
              onClick={handleUpdate}
            >
              Update Patient
            </button>
          </>
        )}
      </Modal>

      {/* Remove Modal */}
      <Modal isOpen={modalOpen === 'Remove'} onClose={closeModal} title="Remove Patient">
        <input
          placeholder="Enter Patient ID"
          className="w-full border rounded-lg p-3 bg-gray-50 focus:ring-2 focus:ring-custom-blue focus:border-custom-blue"
          value={search.patientId}
          onChange={(e) => setSearch({ ...search, patientId: e.target.value })}
        />
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm">
          <p className="font-medium">Warning: This action cannot be undone</p>
          <p className="mt-1">Removing a patient will permanently delete all their records and therapy progress.</p>
        </div>
        <button
          className="w-full bg-gradient-to-r from-rose-500 to-red-600 text-white py-3 rounded-lg hover:from-red-600 hover:to-rose-500 transition-all font-medium"
          onClick={handleRemove}
        >
          Confirm Remove
        </button>
      </Modal>
    </>
  );
};

export default Home;
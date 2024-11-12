import React, { useState, useEffect } from 'react';
import { db } from '../../firebase-config';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import Swal from 'sweetalert2';
import { Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './NewEmployee.scss';

const NewEmployee = () => {
  const [employees, setEmployees] = useState([]);
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [citizenId, setCitizenId] = useState('');
  const [role, setRole] = useState('default'); // State for role

  useEffect(() => {
    const fetchEmployees = async () => {
      const employeeCollection = collection(db, 'employee');
      const employeeSnapshot = await getDocs(employeeCollection);
      const employeeList = employeeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEmployees(employeeList);
    };

    fetchEmployees();
  }, []);

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (name && surname && email && phone && position && citizenId) {
      try {
        const docRef = await addDoc(collection(db, 'employee'), {
          name,
          surname,
          email,
          phone,
          position,
          citizenId,
          role // Add role to the employee data
        });

        setEmployees(prevEmployees => [
          ...prevEmployees,
          { id: docRef.id, name, surname, email, phone, position, citizenId, role }
        ]);

        setName('');
        setSurname('');
        setEmail('');
        setPhone('');
        setPosition('');
        setCitizenId('');
        setRole('default'); // Reset role

        Swal.fire({
          icon: 'success',
          title: 'Create Success',
          showConfirmButton: false,
          timer: 1500
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `Error adding employee: ${error.message}`,
        });
      }
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: 'Please fill in all fields.',
      });
    }
  };

  return (
    <div className="employee-page">
      <h1>CREATE NEW EMPLOYEE</h1>
      <div className="form-container">
        <form onSubmit={handleAddEmployee}>
          <div className="row mt-3">
            <h2>USER PROFILE</h2>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="name" className="form-label">Name</label>
              <input
                type="text"
                className="form-control"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="surname" className="form-label">Surname</label>
              <input
                type="text"
                className="form-control"
                id="surname"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="phone" className="form-label">Phone</label>
              <input
                type="text"
                className="form-control"
                id="phone"
                value={phone}
                maxLength="10"
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="citizenId" className="form-label">Citizen ID</label>
              <input
                type="text"
                className="form-control"
                id="citizenId"
                value={citizenId}
                maxLength="13"
                onChange={(e) => setCitizenId(e.target.value)}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="position" className="form-label">Position</label>
              <select
                id="position"
                className="form-select"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                required
              >
                <option value="">Select position</option>
                <option value="Developer">Developer</option>
                <option value="Tester">Tester</option>
                <option value="Business Analyst">Business Analyst</option>
              </select>
            </div>
          </div>
          <div className="row mt-3">
            <h2>SELECT ROLE</h2>
          </div>
          <div className="form-group">
            <div className="form-check">
              <input
                type="radio"
                className="form-check-input"
                id="roleDefault"
                name="role"
                value="default"
                checked={role === 'default'}
                onChange={(e) => setRole(e.target.value)}
              />
              <label htmlFor="roleDefault" className="form-check-label">Default</label>
            </div>
            <div className="form-check">
              <input
                type="radio"
                className="form-check-input"
                id="roleAdmin"
                name="role"
                value="admin"
                checked={role === 'admin'}
                onChange={(e) => setRole(e.target.value)}
              />
              <label htmlFor="roleAdmin" className="form-check-label">Admin</label>
            </div>
            <div className="form-check">
              <input
                type="radio"
                className="form-check-input"
                id="roleEmployee"
                name="role"
                value="employee"
                checked={role === 'employee'}
                onChange={(e) => setRole(e.target.value)}
              />
              <label htmlFor="roleEmployee" className="form-check-label">Employee</label>
            </div>
          </div>
          <div className="button-group">
            <Button variant="primary" type="submit">
              Submit
            </Button>
            <Button variant="secondary" type="button" onClick={() => {/* Add functionality for cancel button */ }}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewEmployee;

import React, { useState, useEffect } from 'react';
import { db } from '../../firebase-config';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Employee.scss';

const Employee = () => {
  const [employees, setEmployees] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      const employeeCollection = collection(db, 'employee');
      const employeeSnapshot = await getDocs(employeeCollection);
      const employeeList = employeeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEmployees(employeeList);
    };

    fetchEmployees();
  }, []);

  const handleDeleteEmployee = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, 'employee', id));
        setEmployees(prevEmployees => prevEmployees.filter(employee => employee.id !== id));
        Swal.fire(
          'Deleted!',
          'The employee has been deleted.',
          'success'
        );
      } catch (error) {
        Swal.fire(
          'Error!',
          'An error occurred while deleting the employee.',
          'error'
        );
      }
    }
  };

  const filteredEmployees = employees.filter(employee => {
    if (filter === 'ALL') return true;
    return employee.position === filter;
  });


  return (
    <div className="employee-page">
      <h1>EMPLOYEE  MANAGEMENT</h1>
      <div className="filter">
        <label htmlFor="positionFilter">Filter by Position:</label>
        <select id="positionFilter" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="ALL">ALL</option>
          <option value="Developer">Developer</option>
          <option value="Tester">Tester</option>
          <option value="Business Analyst">Business Analyst</option>
        </select>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Surname</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Position</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredEmployees.map(employee => (
            <tr key={employee.id}>
              <td>{employee.name}</td>
              <td>{employee.surname}</td>
              <td>{employee.email}</td>
              <td>{employee.phone}</td>
              <td>{employee.position}</td>
              <td>
                <div className="action-buttons">
                  <button className="btn edit" onClick={() => console.log('Edit employee', employee.id)} >
                    <FontAwesomeIcon icon={faPenToSquare} />
                  </button>
                  <button className="btn delete" onClick={() => handleDeleteEmployee(employee.id)} >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="6">Total Employees: {filteredEmployees.length}</td>
          </tr>
        </tfoot>
      </table>

    </div>
  );
};

export default Employee;

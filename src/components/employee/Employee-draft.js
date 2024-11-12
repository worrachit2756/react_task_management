import React, { useState, useEffect } from 'react';
import { db } from '../../firebase-config';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Employee.scss';

const Employee = () => {
  const [employees, setEmployees] = useState([]);
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
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

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (name && surname && email && phone && position) {
      try {
        const docRef = await addDoc(collection(db, 'employee'), {
          name,
          surname,
          email,
          phone,
          position
        });

        setEmployees(prevEmployees => [
          ...prevEmployees,
          { id: docRef.id, name, surname, email, phone, position }
        ]);

        setName('');
        setSurname('');
        setEmail('');
        setPhone('');
        setPosition('');

        Swal.fire({
          icon: 'success',
          title: 'Create Success',
          showConfirmButton: false,
          timer: 1500
        });

        handleClose(); // Close modal after adding employee
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

  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  return (
    <div className="employee-page">
      <h1>Employee Page</h1>
      <div className="filter-container">
        <label htmlFor="positionFilter">Filter by Position:</label>
        <select
          id="positionFilter"
          className="form-control"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
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
                  <button
                    className="btn edit"
                    onClick={() => console.log('Edit employee', employee.id)}
                  >
                    <FontAwesomeIcon icon={faPenToSquare} />
                  </button>
                  <button
                    className="btn delete"
                    onClick={() => handleDeleteEmployee(employee.id)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Button variant="primary" onClick={handleShow}>
        Add New Employee
      </Button>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Employee</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleAddEmployee}>
            <div className="mb-3">
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
            <div className="mb-3">
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
            <div className="mb-3">
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
            <div className="mb-3">
              <label htmlFor="phone" className="form-label">Phone</label>
              <input
                type="text"
                className="form-control"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
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
            <Button variant="primary" type="submit">
              Add Employee
            </Button>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Employee;

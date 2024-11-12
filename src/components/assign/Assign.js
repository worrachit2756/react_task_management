import React, { useState, useEffect } from 'react';
import { db } from '../../firebase-config';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Assign.scss';

const Assign = () => {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [detail, setDetail] = useState('');
  const [owner, setOwner] = useState('');
  const [createdAt, setCreatedAt] = useState(new Date().toISOString().split('T')[0]);
  const [deadline, setDeadline] = useState('');
  const [state, setState] = useState('Assign');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [filterState, setFilterState] = useState('all');

  useEffect(() => {
    const fetchTasks = async () => {
      const taskCollection = collection(db, 'task');
      const taskSnapshot = await getDocs(taskCollection);
      const taskList = taskSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTasks(taskList);
    };

    const fetchEmployees = async () => {
      const employeeCollection = collection(db, 'employee');
      const employeeSnapshot = await getDocs(employeeCollection);
      const employeeList = employeeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEmployees(employeeList);
    };

    fetchTasks();
    fetchEmployees();
  }, []);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (detail && owner && createdAt && deadline && state) {
      try {
        if (editingTaskId) {
          const taskDocRef = doc(db, 'task', editingTaskId);
          await updateDoc(taskDocRef, {
            detail, owner, created_at: createdAt, dead_line: deadline, state
          });
          setTasks(prevTasks => 
            prevTasks.map(task => 
              task.id === editingTaskId ? { id: editingTaskId, detail, owner, created_at: createdAt, dead_line: deadline, state } : task
            )
          );
          setEditingTaskId(null);
        } else {
          const docRef = await addDoc(collection(db, 'task'), {
            detail, owner, created_at: createdAt, dead_line: deadline, state
          });
          setTasks(prevTasks => [
            ...prevTasks, { id: docRef.id, detail, owner, created_at: createdAt, dead_line: deadline, state }
          ]);
        }

        setDetail('');
        setOwner('');
        setCreatedAt(new Date().toISOString().split('T')[0]);
        setDeadline('');
        setState('Assign');

        Swal.fire({
          icon: 'success',
          title: editingTaskId ? 'Update Success' : 'Create Success',
          showConfirmButton: false,
          timer: 1500
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `Error ${editingTaskId ? 'updating' : 'adding'} task: ${error.message}`,
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

  const handleDeleteTask = async (id) => {
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
        await deleteDoc(doc(db, 'task', id));
        setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
        Swal.fire('Deleted!', 'The task has been deleted.', 'success');
      } catch (error) {
        Swal.fire('Error!', 'An error occurred while deleting the task.', 'error');
      }
    }
  };

  const handleEditTask = (task) => {
    setEditingTaskId(task.id);
    setDetail(task.detail);
    setOwner(task.owner);
    setCreatedAt(task.created_at);
    setDeadline(task.dead_line);
    setState(task.state);
  };

  const filteredTasks = tasks.filter(task => 
    filterState === 'all' || task.state.toLowerCase() === filterState.toLowerCase()
  );

  return (
    <div className="assign-page">
      <h1>Assign Page</h1>
      <div className="filter-container">
        <label htmlFor="filterState">Filter by State:</label>
        <select id="filterState" className="form-control" value={filterState} onChange={(e) => setFilterState(e.target.value)}>
          <option value="All">All</option>
          <option value="Assign">Assign</option>
          <option value="Pending">Pending</option>
          <option value="Tester">Tester</option>
          <option value="Complete">Complete</option>
        </select>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Detail</th>
            <th>Owner</th>
            <th>Created At</th>
            <th>Deadline</th>
            <th>State</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredTasks.map(task => (
            <tr key={task.id}>
              <td>{task.detail}</td>
              <td>{task.owner}</td>
              <td>{task.created_at}</td>
              <td>{task.dead_line}</td>
              <td>{task.state}</td>
              <td>
                <div className="action-buttons">
                  <button className="btn edit" onClick={() => handleEditTask(task)}>
                    <FontAwesomeIcon icon={faPenToSquare} />
                  </button>
                  <button className="btn delete" onClick={() => handleDeleteTask(task.id)}>
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="form-container">
        <h2>{editingTaskId ? 'Edit Task' : 'Add New Task'}</h2>
        <form className="form-inline" onSubmit={handleAddTask}>
          <div className="form-group">
            <label htmlFor="detail">Detail:</label>
            <input type="text" id="detail" className="form-control" value={detail} onChange={(e) => setDetail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="owner">Owner:</label>
            <select id="owner" className="form-control" value={owner} onChange={(e) => setOwner(e.target.value)} required>
              <option value="">Select owner</option>
              {employees.map(employee => (
                <option key={employee.id} value={employee.name}>{employee.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="createdAt">Created At:</label>
            <input type="date" id="createdAt" className="form-control" value={createdAt} onChange={(e) => setCreatedAt(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="deadline">Deadline:</label>
            <input type="date" id="deadline" className="form-control" value={deadline} onChange={(e) => setDeadline(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="state">State:</label>
            <select id="state" className="form-control" value={state} onChange={(e) => setState(e.target.value)} required>
              <option value="Assign">Assign</option>
              <option value="Pending">Pending</option>
              <option value="Tester">Tester</option>
              <option value="Complete">Complete</option>
            </select>
          </div>
          <button type="submit">{editingTaskId ? 'Update Task' : 'Add Task'}</button>
          <button type="button" onClick={() => {
            setDetail('');
            setOwner('');
            setCreatedAt(new Date().toISOString().split('T')[0]);
            setDeadline('');
            setState('Assign');
            setEditingTaskId(null);
          }}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default Assign;

import React, { useState, useEffect } from 'react';
import { db } from '../../firebase-config';
import { collection, getDocs, updateDoc, doc, addDoc, query, where } from 'firebase/firestore';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAdd, faBell, faXmark } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import emailjs from 'emailjs-com';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Dashboard.scss';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [isTaskExpired, setIsTaskExpired] = useState(false);
  const [columns, setColumns] = useState({
    'Assign': [],
    'Pending': [],
    'Complete': [],
    'Tester': [],
    'Delayed': []  // เพิ่มคอลัมน์ใหม่ที่นี่
  });
  const [employees, setEmployees] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [newTask, setNewTask] = useState({
    detail: '',
    owner: '',
    created_at: new Date().toISOString().split('T')[0],
    dead_line: '',
    state: '',
  });
  const [editingTask, setEditingTask] = useState(null);
  const [editFormData, setEditFormData] = useState({
    detail: '',
    owner: '',
    created_at: '',
    dead_line: '',
    state: ''
  });

  useEffect(() => {
    const fetchTasks = async () => {
      const taskCollection = collection(db, 'task');
      const taskSnapshot = await getDocs(taskCollection);
      const taskList = taskSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTasks(taskList);
      initializeColumns(taskList);
    };

    const fetchEmployees = async () => {
      const employeeCollection = collection(db, 'employee');
      const employeeSnapshot = await getDocs(employeeCollection);
      const employeeList = employeeSnapshot.docs.map(doc => doc.data().name);
      setEmployees(employeeList);
    };

    fetchTasks();
    fetchEmployees();
  }, []);

  const initializeColumns = (tasks) => {
    const columnsTemp = {
      'Assign': [],
      'Pending': [],
      'Complete': [],
      'Tester': [],
      'Delayed': []  // เพิ่มคอลัมน์ใหม่ที่นี่
    };

    const today = new Date().toISOString().split('T')[0]; // วันปัจจุบันในรูปแบบ 'YYYY-MM-DD'

    tasks.forEach(task => {
      if (task.dead_line < today && task.state !== 'Complete') {
        columnsTemp['Delayed'].push(task); // เพิ่มไปยังคอลัมน์ Delayed
      } else {
        columnsTemp[task.state].push(task); // เพิ่มไปยังคอลัมน์ที่เกี่ยวข้อง
      }
    });

    setColumns(columnsTemp);
  };

  const onDragEnd = async (result) => {
    const onDragEnd = async (result) => {
      const { destination, source, draggableId } = result;

      if (!destination) {
        return;
      }

      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      ) {
        return;
      }

      const startColumn = columns[source.droppableId];
      const endColumn = columns[destination.droppableId];
      const movedTask = startColumn.find(task => task.id === draggableId);

      const updatedStart = startColumn.filter(task => task.id !== draggableId);
      const updatedEnd = [...endColumn, movedTask];

      const updatedColumns = {
        ...columns,
        [source.droppableId]: updatedStart,
        [destination.droppableId]: updatedEnd
      };

      setColumns(updatedColumns);

      // Update Firestore
      const taskDoc = doc(db, 'task', draggableId);
      await updateDoc(taskDoc, {
        state: destination.droppableId
      });
    };

    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const startColumn = columns[source.droppableId];
    const endColumn = columns[destination.droppableId];
    const movedTask = startColumn.find(task => task.id === draggableId);

    // Remove from start column
    const updatedStart = startColumn.filter(task => task.id !== draggableId);

    // Add to end column
    const updatedEnd = [...endColumn, movedTask];

    // Update columns state
    setColumns({
      ...columns,
      [source.droppableId]: updatedStart,
      [destination.droppableId]: updatedEnd
    });

    // Update Firestore
    try {
      await updateDoc(doc(db, 'task', draggableId), {
        state: destination.droppableId
      });
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  const handleOwnerChange = (event) => {
    const selected = event.target.value;
    setSelectedOwner(selected);

    if (selected) {
      const filteredTasks = tasks.filter(task => task.owner === selected);
      initializeColumns(filteredTasks);
    } else {
      initializeColumns(tasks);
    }
  };

  const handleAddCardClick = (state) => {
    setNewTask({
      ...newTask,
      state: state
    });
    setIsFormVisible(true);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setNewTask(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const newTaskData = {
        ...newTask,
        created_at: newTask.created_at,
        dead_line: newTask.dead_line
      };
      await addDoc(collection(db, 'task'), newTaskData);
      setTasks(prevTasks => [...prevTasks, newTaskData]);
      initializeColumns([...tasks, newTaskData]);
      setNewTask({
        detail: '',
        owner: '',
        created_at: new Date().toISOString().split('T')[0],
        dead_line: '',
        state: ''
      });
      setIsFormVisible(false);

      // แสดงการแจ้งเตือนความสำเร็จ
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Task has been added successfully.',
        confirmButtonText: 'OK'
      });
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const handleCardClick = (task) => {
    const today = new Date().toISOString().split('T')[0];
    const isTaskExpired = task.dead_line < today;

    setEditingTask(task);
    setEditFormData({
      detail: task.detail,
      owner: task.owner,
      created_at: task.created_at,
      dead_line: task.dead_line,
      state: task.state
    });
    setIsTaskExpired(isTaskExpired);
  };


  const handleEditFormChange = (event) => {
    const { name, value } = event.target;
    setEditFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    try {
      await updateDoc(doc(db, 'task', editingTask.id), {
        ...editFormData,
        created_at: editFormData.created_at,
        dead_line: editFormData.dead_line
      });
      // Update local state
      const updatedTasks = tasks.map(task =>
        task.id === editingTask.id ? { ...task, ...editFormData, created_at: editFormData.created_at, dead_line: editFormData.dead_line } : task
      );
      setTasks(updatedTasks);
      initializeColumns(updatedTasks);
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Task has been updated successfully.',
        confirmButtonText: 'OK'
      });
      setEditingTask(null);
    } catch (error) {
      console.error("Error updating document: ", error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to update task.',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleNoticeClick = async (task) => {
    const email = await fetchOwnerEmail(task.owner);

    if (email) {
      // แสดงป๊อปอัพแบบโหลด (loading) ก่อน
      const loadingSwal = Swal.fire({
        title: 'Sending Notice...',
        text: 'Please wait while we send the notice.',
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          // สร้างการหมุนเองด้วย CSS
          Swal.showLoading();
        },
        customClass: {
          container: 'spinner-container',
          title: 'spinner-title'
        }
      });

      emailjs.send('service_o2vl6vm', 'template_mmh7osi', {
        to_name: task.owner,
        message: `${task.detail} is delayed.`,
        to_email: email
      }, 'KeA6jZnNx0_sOL_tT')
        .then(response => {
          // ปิดป๊อปอัพโหลด
          loadingSwal.close();

          // แสดงป๊อปอัพความสำเร็จ
          Swal.fire({
            icon: 'success',
            title: 'Notice',
            text: 'Send notice to ' + task.owner + ' success!',
            timer: 1500,
            timerProgressBar: true,
            showConfirmButton: false
          });
        })
        .catch(error => {
          // ปิดป๊อปอัพโหลด
          loadingSwal.close();

          alert('Failed to send email');
          console.error('EmailJS error:', error);
        });
    } else {
      alert('Owner email not found');
    }
  };

  const fetchOwnerEmail = async (ownerName) => {
    const employeeCollection = collection(db, 'employee');
    const q = query(employeeCollection, where('name', '==', ownerName));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return doc.data().email;
    }
    return null;
  };

  return (
    <div className="dashboard-page">
      <h1>TASK MANAGEMENT</h1>
      <div className="filter">
        <label htmlFor="ownerFilter">Filter by Owner:</label>
        <select id="ownerFilter" onChange={handleOwnerChange} value={selectedOwner}>
          <option value="">All Owners</option>
          {employees.map((employee, index) => (
            <option key={index} value={employee}>{employee}</option>
          ))}
        </select>
      </div>

      {isFormVisible && (
        <div className="form-container">
          {/* <h2>Add New Task</h2> */}
          <form onSubmit={handleSubmit}>
          <div className="back-button-container">
              <button className="back-button" onClick={() => setIsFormVisible(false)}><FontAwesomeIcon icon={faXmark} /></button>
            </div>
            <div className="form-group">
              <label htmlFor="detail">Detail:</label>
              <input
                type="text"
                id="detail"
                name="detail"
                value={newTask.detail}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="owner">Owner:</label>
              <select
                id="owner"
                name="owner"
                value={newTask.owner}
                onChange={handleFormChange}
                required
              >
                <option value="">Select Owner</option>
                {employees.map((employee, index) => (
                  <option key={index} value={employee}>{employee}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="created_at">Created At:</label>
              <input
                type="date"
                id="created_at"
                name="created_at"
                value={newTask.created_at}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="dead_line">Deadline:</label>
              <input
                type="date"
                id="dead_line"
                name="dead_line"
                value={newTask.dead_line}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="state">State:</label>
              <input
                type="text"
                id="state"
                name="state"
                value={newTask.state}
                readOnly
              />
            </div>
            <button type="submit">Add New Task</button>
          </form>
        </div>
      )}

      {editingTask && (
        <div className="form-container">
          {/* <h2>Edit Task</h2> */}
          <form onSubmit={handleEditSubmit}>
            <div className="back-button-container">
              <button className="back-button" onClick={() => setEditingTask(null)}><FontAwesomeIcon icon={faXmark} /></button>
            </div>
            <div className="form-group">
              <label htmlFor="editDetail">Detail:</label>
              <input
                type="text"
                id="editDetail"
                name="detail"
                value={editFormData.detail}
                onChange={handleEditFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="editOwner">Owner:</label>
              <select
                id="editOwner"
                name="owner"
                value={editFormData.owner}
                onChange={handleEditFormChange}
                required
              >
                {employees.map((employee, index) => (
                  <option key={index} value={employee}>{employee}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="editCreatedAt">Created At:</label>
              <input
                type="date"
                id="editCreatedAt"
                name="created_at"
                value={editFormData.created_at}
                onChange={handleEditFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="editDeadline">Deadline:</label>
              <input
                type="date"
                id="editDeadline"
                name="dead_line"
                value={editFormData.dead_line}
                onChange={handleEditFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="editState">State:</label>
              <input
                type="text"
                id="editState"
                name="state"
                value={editFormData.state}
                readOnly
              />
            </div>
            {isTaskExpired ? (
              <>
                <div className="button-container">
                  <button className="notice-button" onClick={() => handleNoticeClick(editingTask)}>
                    <FontAwesomeIcon icon={faBell} className="icon-spacing" />Send Notification
                  </button>
                </div>
              </>
            ) : (
              <>
                <button type="submit">Update Task</button>
              </>
            )}
          </form>
        </div>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="columns">
          {Object.keys(columns).map(column => (
            <Droppable key={column} droppableId={column}>
              {(provided) => (
                <div
                  className="column"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <h2>{column}</h2>
                  {columns[column].map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided) => (
                        <div
                          className="card"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          onClick={() => handleCardClick(task)}
                        >
                          <div className="card-body">
                            <h5 className="card-title">{task.detail}</h5>
                            <p className="card-text"><strong>Owner:</strong> {task.owner}</p>
                            <p className="card-text"><strong>Deadline:</strong> {task.dead_line}</p>
                            <p className="card-text"><strong>Created At:</strong> {task.created_at}</p>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  {column !== 'Delayed' && ( // ตรวจสอบว่าไม่ใช่คอลัมน์ Delayed
                    <button className="add-card-button" onClick={() => handleAddCardClick(column)}>
                      <FontAwesomeIcon icon={faAdd} />
                    </button>
                  )}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

    </div>
  );
};

export default Dashboard;

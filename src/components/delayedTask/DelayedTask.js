import React, { useState, useEffect } from 'react';
import { db } from '../../firebase-config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import emailjs from 'emailjs-com';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMailBulk } from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import './DelayedTask.scss';

const DelayedTask = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const taskCollection = collection(db, 'task');
      const taskSnapshot = await getDocs(taskCollection);
      const taskList = taskSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTasks(taskList);
    };

    fetchTasks();
  }, []);

  const isBeforeToday = (dateString) => {
    const today = new Date();
    const date = new Date(dateString);
    return date < today;
  };

  const calculateDelayedDays = (dateString) => {
    const today = new Date();
    const deadline = new Date(dateString);
    const timeDifference = today - deadline;
    const daysDelayed = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    return daysDelayed > 0 ? daysDelayed : 0;
  };

  const filteredTasks = tasks.filter(task => isBeforeToday(task.dead_line));

  // Function to fetch email of the owner
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

  // Function to handle the button click
  const handleNoticeClick = async (task) => {
    const email = await fetchOwnerEmail(task.owner);
    if (email) {
      // Send email using EmailJS
      emailjs.send('service_o2vl6vm', 'template_mmh7osi', {
        to_name: task.owner,
        message: `${task.detail} is delayed.`,
        to_email: email
      }, 'KeA6jZnNx0_sOL_tT')
      .then(response => {
        alert('Email sent successfully');
      })
      .catch(error => {
        alert('Failed to send email');
        console.error('EmailJS error:', error);
      });
    } else {
      alert('Owner email not found');
    }
  };

  return (
    <div className="delayed-page">
      <h1>Delayed Task</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Detail</th>
            <th>Owner</th>
            <th>Created At</th>
            <th>Deadline</th>
            <th>Delayed</th>
            <th>Notice</th>
          </tr>
        </thead>
        <tbody>
          {filteredTasks.map(task => (
            <tr key={task.id}>
              <td>{task.detail}</td>
              <td>{task.owner}</td>
              <td>{task.created_at}</td>
              <td>{task.dead_line}</td>
              <td>{calculateDelayedDays(task.dead_line)} days</td>
              <td>
                <button 
                  className="btn btn-primary" 
                  onClick={() => handleNoticeClick(task)}
                >
                  <FontAwesomeIcon icon={faMailBulk} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DelayedTask;

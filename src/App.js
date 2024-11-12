import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar/Sidebar';
import Home from './components/home/Home';
import Employee from './components/employee/Employee';
import NewEmployee from './components/employee/NewEmployee';
import Assign from './components/assign/Assign';
import DelayedTask from './components/delayedTask/DelayedTask';
import Dashboard from './components/dashboard/Dashboard';
import './App.scss'; // นำเข้าไฟล์ SCSS ใหม่

function App() {
  return (
    <Router>
      <div className="app">
        <div className="stars">
          {[...Array(50)].map((_, index) => (
            <div key={index} className="star"></div>
          ))}
        </div>
        <Sidebar />
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/employee" element={<Employee />} />
            <Route path="/employee/NewEmployee" element={<NewEmployee />} />
            <Route path="/assign" element={<Assign />} />
            <Route path="/delayed-task" element={<DelayedTask />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

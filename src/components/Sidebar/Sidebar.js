import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.scss';

const Sidebar = () => {
  const [isActive, setIsActive] = useState(false);

  const handleToggle = () => {
    setIsActive(!isActive);
  };

  return (
    <div className="navigation">
      <div className="navigation__toggle" onClick={handleToggle}>
        <div className={`navigation__icon ${isActive ? 'transformed' : ''}`}>
          <span></span>
        </div>
      </div>
      <nav className={isActive ? 'navigation--active' : ''}>
        <div className="navigation__brand">
          <b>T</b>est <b>m</b>anagement
        </div>
        <ul>
          <li><Link to="/">home</Link></li>
          <li className="has-submenu">
            <Link to="/employee">employee</Link>
            <ul className="submenu">
              <li><Link to="/employee">Management</Link></li>
              <li><Link to="/employee/NewEmployee">New employee</Link></li>
            </ul>
          </li>
          <li><Link to="/assign">assign</Link></li>
          <li><Link to="/delayed-task">delayed task</Link></li>
          <li><Link to="/dashboard">Dashboard</Link></li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;

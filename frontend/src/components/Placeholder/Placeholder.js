import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Placeholder.module.css';

const Placeholder = ({ title = "Coming Soon" }) => {
  return (
    <div className={styles.placeholderContainer}>
      <h2>{title}</h2>
      <p>This section is under construction. Please check back later!</p>
      <Link to="/admin/1st-Year/1st-Sem" className={styles.backButton}>
        Back to Main
      </Link>
    </div>
  );
};

export default Placeholder;

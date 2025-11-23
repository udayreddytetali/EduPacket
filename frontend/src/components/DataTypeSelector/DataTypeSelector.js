import React from 'react';
import styles from './DataTypeSelector.module.css';

const DataTypeSelector = ({ value, onChange }) => {
  return (
    <select
      className={styles.selector}
      value={value}
      onChange={onChange}
      aria-label="Select Data Type"
    >
      <option value="">-- Choose Data Type --</option>
  <option value="model-papers">Model Papers</option>
      <option value="pdfs">PDFs</option>
    </select>
  );
};

export default DataTypeSelector;

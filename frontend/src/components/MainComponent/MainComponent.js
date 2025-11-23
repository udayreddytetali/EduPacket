import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './MainComponent.css';

import YearSelection from '../YearSelection/YearSelection';
import SemesterTabs from '../SemesterTabs/SemesterTabs';
import GroupSelector from '../GroupSelector/GroupSelector';
import DataTypeSelector from '../DataTypeSelector/DataTypeSelector';
import SubjectSelection from '../SubjectSelection/SubjectSelection';

const years = [
  { value: '1st-Year', label: '1st Year' },
  { value: '2nd-Year', label: '2nd Year' },
  { value: '3rd-Year', label: '3rd Year' },
];

const semestersByYear = {
  '1st-Year': [ { value: '1st-Sem', label: '1st Sem' }, { value: '2nd-Sem', label: '2nd Sem' } ],
  '2nd-Year': [ { value: '3rd-Sem', label: '3rd Sem' }, { value: '4th-Sem', label: '4th Sem' } ],
  '3rd-Year': [ { value: '5th-Sem', label: '5th Sem' }, { value: '6th-Sem', label: '6th Sem' } ],
};

const groups = [
  { value: 'BSC-AI', label: 'BSC AI' },
  { value: 'BSC-Data-Science', label: 'BSC Data Science' },
  { value: 'BSC-Computer-Science', label: 'BSC Computer Science' },
  { value: 'BCA', label: 'BCA' },
  { value: 'BBA', label: 'BBA' },
  { value: 'BCom', label: 'B.Com' },
];

const MainComponent = () => {
  const params = useParams();
  const navigate = useNavigate();

  const [selectedYear, setSelectedYear] = useState(params.year || years[0].value);
  const [selectedSemester, setSelectedSemester] = useState(params.semester || semestersByYear[params.year]?.[0]?.value || semestersByYear[years[0].value][0].value);
  const [selectedGroup, setSelectedGroup] = useState(params.group || '');
  const [selectedDataType, setSelectedDataType] = useState(params.dataType || '');
  const [isSidebarVisible, setSidebarVisible] = useState(true);

  // Sync semester options when year changes (if URL param exists)
  useEffect(() => {
    if (params.year && semestersByYear[params.year]) {
      if (!params.semester || !semestersByYear[params.year].some(s => s.value === params.semester)) {
        setSelectedSemester(semestersByYear[params.year][0].value);
      }
    }
  }, [params.year, params.semester]);

  // Update URL when selections change
  useEffect(() => {
    // Build path string and encode URI components to handle spaces
    let path = `/${encodeURIComponent(selectedYear)}/${encodeURIComponent(selectedSemester)}`;
    if (selectedGroup) path += `/${encodeURIComponent(selectedGroup)}`;
    if (selectedDataType) path += `/${encodeURIComponent(selectedDataType)}`;

    if (window.location.pathname !== path) {
      navigate(path, { replace: true });
    }
  }, [selectedYear, selectedSemester, selectedGroup, selectedDataType, navigate]);

  const handleYearClick = (yearValue) => {
    setSelectedYear(yearValue);
    const semesters = semestersByYear[yearValue] || [];
    setSelectedSemester(semesters[0]?.value || '');
    setSelectedGroup('');
    setSelectedDataType('');
  };

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  return (
    <div className="main">
      <aside className={`sidebar ${isSidebarVisible ? 'visible' : 'hidden'}`}>
  <YearSelection years={years} selectedYear={selectedYear} onYearClick={handleYearClick} />

        {isSidebarVisible && (
          <button
            className="sidebar-toggle-btn"
            onClick={toggleSidebar}
            aria-label="Hide Years"
            aria-expanded={isSidebarVisible}
            type="button"
          >
            Hide Years
          </button>
        )}
      </aside>

      <section className={`content ${isSidebarVisible ? '' : 'expanded'}`}>
        <div className="semester-toggle-row">
          {!isSidebarVisible && (
            <button
              className="show-years-btn"
              onClick={toggleSidebar}
              aria-label="Show Years"
              type="button"
            />
          )}

          <SemesterTabs
            semesters={semestersByYear[selectedYear] || []}
            selectedSemester={selectedSemester}
            onSemesterClick={setSelectedSemester}
          />
        </div>

        <div className="form-row">
          <GroupSelector
            groups={groups}
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
          />
          <DataTypeSelector
            value={selectedDataType}
            onChange={(e) => setSelectedDataType(e.target.value)}
          />
        </div>

        <div className="content-remaining-area">
          {console.log('[MainComponent] Rendering SubjectSelection with:', { selectedGroup, selectedDataType, selectedYear, selectedSemester })}
          <SubjectSelection
            group={selectedGroup}
            dataType={selectedDataType}
            year={selectedYear}
            semester={selectedSemester}
          />
        </div>
      </section>
    </div>
  );
};

export default MainComponent;

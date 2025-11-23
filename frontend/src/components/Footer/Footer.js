import React, { useState, useEffect } from "react";
import { ReactComponent as ClipboardListIcon } from "../../assests/icons/ClipboardList.svg";
import { ReactComponent as FileTextIcon } from "../../assests/icons/FileText.svg";
import { ReactComponent as BriefcaseIcon } from "../../assests/icons/Briefcase.svg";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Footer.module.css";

const notificationsData = {
  examination: [],
  circulars: [],
  jobs: [],
};

const Footer = () => {
  const navigate = useNavigate();

  // Start with examination active and its content shown
  const [expandedSection, setExpandedSection] = useState("examination");
  // Removed unused activeNotification state

  // Only change expanded section if new button clicked (no toggle off)
  const handleSectionClick = (section) => {
    if (section !== expandedSection) {
      setExpandedSection(section);
      // setActiveNotification removed
    }
  };

  const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

  const [recentNotices, setRecentNotices] = useState({
    examination: [],
    circulars: [],
    jobs: [],
  });

  useEffect(() => {
    async function fetchAll() {
      try {
        const [examRes, circRes, jobsRes] = await Promise.all([
          fetch('/api/examination'),
          fetch('/api/circulars'),
          fetch('/api/jobs'),
        ]);
        const [examData, circData, jobsData] = await Promise.all([
          examRes.json(),
          circRes.json(),
          jobsRes.json(),
        ]);
        setRecentNotices({
          examination: (examData || []).slice(-3).reverse(),
          circulars: (circData || []).slice(-3).reverse(),
          jobs: (jobsData || []).slice(-3).reverse(),
        });
      } catch (err) {
        setRecentNotices({ examination: [], circulars: [], jobs: [] });
      }
    }
    fetchAll();
  }, []);

  const activeNotices = recentNotices[expandedSection] || [];

  // Removed handleNotificationClick since setActiveNotification is gone

  const handleViewAllClick = () => {
    navigate(`/${expandedSection}`);
  };

  return (
    <footer className={styles["main-footer"]}>
      <div className={styles["footer-top"]}>
        <h1>Important Information</h1>
      </div>

      <div className={styles["footer-links-row"]}>
        <button
          className={`${styles["footer-link"]} ${
            expandedSection === "examination" ? styles.sectionActive : ""
          }`}
          onClick={() => handleSectionClick("examination")}
          type="button"
          aria-expanded={expandedSection === "examination"}
        >
          <ClipboardListIcon className={styles["footer-icon"]} aria-hidden="true" />
          Examination
        </button>

        <button
          className={`${styles["footer-link"]} ${
            expandedSection === "circulars" ? styles.sectionActive : ""
          }`}
          onClick={() => handleSectionClick("circulars")}
          type="button"
          aria-expanded={expandedSection === "circulars"}
        >
          <FileTextIcon className={styles["footer-icon"]} aria-hidden="true" />
          Circulars
        </button>

        <button
          className={`${styles["footer-link"]} ${
            expandedSection === "jobs" ? styles.sectionActive : ""
          }`}
          onClick={() => handleSectionClick("jobs")}
          type="button"
          aria-expanded={expandedSection === "jobs"}
        >
          <BriefcaseIcon className={styles["footer-icon"]} aria-hidden="true" />
          Jobs
        </button>
      </div>

      <div className={styles["notification-preview"]}>
        {activeNotices.length > 0 && activeNotices.slice(0, 3).map((notice, idx) => (
          <button
            key={idx}
            className={styles["notification-link"]}
            title={notice.title}
            onClick={() => {
              if (notice.link) {
                window.open(notice.link, '_blank');
              } else if (notice.fileUrl) {
                window.open(notice.fileUrl, '_blank');
              }
            }}
            type="button"
          >
            {notice && notice.title ?
              (notice.title.length > 110 ? notice.title.substring(0, 110) + "..." : notice.title)
              : ''}
            <span className={styles["arrow"]} aria-hidden="true">
              &rarr;
            </span>
          </button>
        ))}
        <button
          className={styles["view-more-btn"]}
          onClick={handleViewAllClick}
          type="button"
        >
          View All {capitalize(expandedSection)}{" "}
          <span className={styles["arrow"]} aria-hidden="true">
            &rarr;
          </span>
        </button>
      </div>

      <div className={styles["footer-bottom"]}>© 2025 EduPacket. All rights reserved.</div>
    </footer>
  );
};

export default Footer;

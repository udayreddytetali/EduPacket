To apply mobile styles for Restore Deleted, Deleted PDFs, Deleted Subjects, and NotificationList sections:

1. Import the CSS file in each relevant component file:
   import './mobile-fixes.css';

2. Add the following class names to the main container/table elements:
   - restore-deleted-container, restore-deleted-table
   - deleted-pdf-container, deleted-pdf-table
   - deleted-subject-container, deleted-subject-table
   - notification-list-container, notification-list-table

3. For NotificationList, also add notification-list-heading and notification-list-pagination classes to heading and pagination elements.

This will ensure all admin and notification management views are styled for mobile devices (max-width: 600px) without changing the structure or logic of the components.
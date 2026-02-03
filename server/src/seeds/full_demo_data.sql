-- Full demo data set for screenshots (safe to re-run)
-- Password for all demo users: Password@123

-- Departments
INSERT INTO department (deptname)
VALUES
  ('Information Technology'),
  ('Computer Engineering'),
  ('Electronics & Telecommunication'),
  ('Electronics & Computer Science')
ON CONFLICT DO NOTHING;

-- Divisions (A/B/C) per department
INSERT INTO division (departmentid, divisionname)
SELECT d.departmentid, v.divisionname
FROM department d
JOIN (VALUES ('A'), ('B'), ('C')) AS v(divisionname) ON TRUE
ON CONFLICT DO NOTHING;

-- Courses
INSERT INTO course (departmentid, coursecode, coursename)
SELECT d.departmentid, c.coursecode, c.coursename
FROM department d
JOIN (VALUES
  ('IT101','Data Structures'),
  ('IT102','Database Management'),
  ('IT201','Operating Systems'),
  ('CE101','Algorithms'),
  ('CE102','Software Engineering'),
  ('ET101','Signals & Systems'),
  ('EC101','Computer Networks')
) AS c(coursecode, coursename) ON TRUE
WHERE d.deptname = 'Information Technology'
ON CONFLICT DO NOTHING;

-- Users
INSERT INTO "USER" (username, email, passwordhash, "Role", contact_no)
VALUES
  ('Admin One', 'admin@college.local', '$2b$10$pvB7PtTnAYu0qJwBhWa.X.y6fvV7wcA5ZIS.L3fWcqKn21esqiV4q', 'Admin', '9999990001'),
  ('Prof. Mehta', 'faculty@college.local', '$2b$10$pvB7PtTnAYu0qJwBhWa.X.y6fvV7wcA5ZIS.L3fWcqKn21esqiV4q', 'Faculty', '9999990002'),
  ('Aarav Patel', 'student1@college.local', '$2b$10$pvB7PtTnAYu0qJwBhWa.X.y6fvV7wcA5ZIS.L3fWcqKn21esqiV4q', 'Student', '9999990003'),
  ('Isha Sharma', 'student2@college.local', '$2b$10$pvB7PtTnAYu0qJwBhWa.X.y6fvV7wcA5ZIS.L3fWcqKn21esqiV4q', 'Student', '9999990004')
ON CONFLICT DO NOTHING;

-- Admin
INSERT INTO admin (userid, name, email)
SELECT u.userid, u.username, u.email
FROM "USER" u
WHERE u.email = 'admin@college.local'
ON CONFLICT DO NOTHING;

-- Faculty
INSERT INTO faculty (userid, departmentid, name, email, designation)
SELECT u.userid, d.departmentid, u.username, u.email, 'Assistant Professor'
FROM "USER" u
JOIN department d ON d.deptname = 'Information Technology'
WHERE u.email = 'faculty@college.local'
ON CONFLICT DO NOTHING;

-- Students
INSERT INTO student (userid, divisionid, name, email, rollnumber, yearofstudy)
SELECT u.userid, dv.divisionid, u.username, u.email, 'IT-21-001', 3
FROM "USER" u
JOIN department d ON d.deptname = 'Information Technology'
JOIN division dv ON dv.departmentid = d.departmentid AND dv.divisionname = 'A'
WHERE u.email = 'student1@college.local'
ON CONFLICT DO NOTHING;

INSERT INTO student (userid, divisionid, name, email, rollnumber, yearofstudy)
SELECT u.userid, dv.divisionid, u.username, u.email, 'IT-21-002', 3
FROM "USER" u
JOIN department d ON d.deptname = 'Information Technology'
JOIN division dv ON dv.departmentid = d.departmentid AND dv.divisionname = 'A'
WHERE u.email = 'student2@college.local'
ON CONFLICT DO NOTHING;

-- Class Sessions (timetable)
INSERT INTO class_session (courseid, facultyid, divisionid, dayofweek, starttime, endtime, roomno)
SELECT c.courseid, f.facultyid, d.divisionid, 1, '09:00', '10:00', 'L-101'
FROM course c
JOIN faculty f ON f.email = 'faculty@college.local'
JOIN division d ON d.divisionname = 'A'
JOIN department dep ON dep.departmentid = d.departmentid AND dep.deptname = 'Information Technology'
WHERE c.coursecode = 'IT101'
AND NOT EXISTS (
  SELECT 1 FROM class_session cs
  WHERE cs.courseid = c.courseid AND cs.divisionid = d.divisionid AND cs.dayofweek = 1 AND cs.starttime = '09:00'
);

INSERT INTO class_session (courseid, facultyid, divisionid, dayofweek, starttime, endtime, roomno)
SELECT c.courseid, f.facultyid, d.divisionid, 3, '11:00', '12:00', 'L-102'
FROM course c
JOIN faculty f ON f.email = 'faculty@college.local'
JOIN division d ON d.divisionname = 'A'
JOIN department dep ON dep.departmentid = d.departmentid AND dep.deptname = 'Information Technology'
WHERE c.coursecode = 'IT102'
AND NOT EXISTS (
  SELECT 1 FROM class_session cs
  WHERE cs.courseid = c.courseid AND cs.divisionid = d.divisionid AND cs.dayofweek = 3 AND cs.starttime = '11:00'
);

-- Internship postings
INSERT INTO internship (companyname, jobtitle, description, stipend, applicationdeadline)
VALUES
  ('OpenWave Labs', 'Backend Intern', 'Node.js + PostgreSQL APIs', 25000, CURRENT_DATE + INTERVAL '45 days'),
  ('PixelForge', 'Frontend Intern', 'React + Tailwind UI work', 20000, CURRENT_DATE + INTERVAL '30 days')
ON CONFLICT DO NOTHING;

-- Student Course enrollment
INSERT INTO student_course (studentid, courseid)
SELECT s.studentid, c.courseid
FROM student s
JOIN "USER" u ON s.userid = u.userid
JOIN course c ON c.coursecode IN ('IT101', 'IT102')
WHERE u.email IN ('student1@college.local', 'student2@college.local')
ON CONFLICT DO NOTHING;

-- Attendance records (demo)
INSERT INTO attendance (sessionid, studentid, date, status)
SELECT cs.sessionid, s.studentid, CURRENT_DATE - INTERVAL '1 day', 'P'
FROM class_session cs
JOIN student s ON TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM attendance a
  WHERE a.sessionid = cs.sessionid AND a.studentid = s.studentid AND a.date = CURRENT_DATE - INTERVAL '1 day'
);

-- Reminders
INSERT INTO reminders (userid, title, date, note, department, division)
SELECT u.userid, 'Mid-Sem Exams', CURRENT_DATE + INTERVAL '10 days', 'Prepare chapter 1-5', 'INFT', 'A'
FROM "USER" u WHERE u.email = 'faculty@college.local'
ON CONFLICT DO NOTHING;

INSERT INTO reminders (userid, title, date, note, department, division)
SELECT u.userid, 'Fee Payment Deadline', CURRENT_DATE + INTERVAL '15 days', 'Pay via dashboard to generate receipt', 'ALL', 'ALL'
FROM "USER" u WHERE u.email = 'admin@college.local'
ON CONFLICT DO NOTHING;

-- Documents
INSERT INTO documents (user_id, s3_key, file_name, mime_type, label, status)
SELECT u.userid, 'documents/demo/college-id.png', 'college-id.png', 'image/png', 'Student ID', 'verified'
FROM "USER" u WHERE u.email = 'student1@college.local'
ON CONFLICT DO NOTHING;

-- Payments
INSERT INTO payments (user_id, amount, currency, razorpay_order_id, razorpay_payment_id, razorpay_signature, status)
SELECT u.userid, 1000, 'INR', 'order_demo_001', 'pay_demo_001', 'sig_demo_001', 'paid'
FROM "USER" u WHERE u.email = 'student1@college.local'
ON CONFLICT DO NOTHING;

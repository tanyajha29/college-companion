-- Demo data for screenshots (safe to re-run)
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
WHERE d.deptname IN ('Information Technology', 'Computer Engineering', 'Electronics & Telecommunication', 'Electronics & Computer Science')
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

-- Demo users (bcrypt hash for Password@123)
INSERT INTO "USER" (username, email, passwordhash, "Role", contact_no)
VALUES
  ('Admin One', 'admin@college.local', '$2b$10$pvB7PtTnAYu0qJwBhWa.X.y6fvV7wcA5ZIS.L3fWcqKn21esqiV4q', 'Admin', '9999990001'),
  ('Prof. Mehta', 'faculty@college.local', '$2b$10$pvB7PtTnAYu0qJwBhWa.X.y6fvV7wcA5ZIS.L3fWcqKn21esqiV4q', 'Faculty', '9999990002'),
  ('Aarav Patel', 'student1@college.local', '$2b$10$pvB7PtTnAYu0qJwBhWa.X.y6fvV7wcA5ZIS.L3fWcqKn21esqiV4q', 'Student', '9999990003'),
  ('Isha Sharma', 'student2@college.local', '$2b$10$pvB7PtTnAYu0qJwBhWa.X.y6fvV7wcA5ZIS.L3fWcqKn21esqiV4q', 'Student', '9999990004')
ON CONFLICT DO NOTHING;

-- Admin entry
INSERT INTO admin (userid, name, email)
SELECT u.userid, u.username, u.email
FROM "USER" u
WHERE u.email = 'admin@college.local'
ON CONFLICT DO NOTHING;

-- Faculty entry
INSERT INTO faculty (userid, departmentid, name, email, designation)
SELECT u.userid, d.departmentid, u.username, u.email, 'Assistant Professor'
FROM "USER" u
JOIN department d ON d.deptname = 'Information Technology'
WHERE u.email = 'faculty@college.local'
ON CONFLICT DO NOTHING;

-- Student entries
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

-- Internships
INSERT INTO internship (companyname, jobtitle, description, stipend, applicationdeadline)
VALUES
  ('OpenWave Labs', 'Backend Intern', 'Node.js + PostgreSQL APIs', 25000, CURRENT_DATE + INTERVAL '45 days'),
  ('PixelForge', 'Frontend Intern', 'React + Tailwind UI work', 20000, CURRENT_DATE + INTERVAL '30 days')
ON CONFLICT DO NOTHING;

-- Reminders (new table created by migration 007)
INSERT INTO reminders (userid, title, date, note, department, division)
SELECT u.userid, 'Mid-Sem Exams', CURRENT_DATE + INTERVAL '10 days', 'Prepare chapter 1-5', 'INFT', 'A'
FROM "USER" u WHERE u.email = 'faculty@college.local'
ON CONFLICT DO NOTHING;

INSERT INTO reminders (userid, title, date, note, department, division)
SELECT u.userid, 'Fee Payment Deadline', CURRENT_DATE + INTERVAL '15 days', 'Pay via dashboard to generate receipt', 'ALL', 'ALL'
FROM "USER" u WHERE u.email = 'admin@college.local'
ON CONFLICT DO NOTHING;

-- Documents (demo metadata only)
INSERT INTO documents (user_id, s3_key, file_name, mime_type, label, status)
SELECT u.userid, 'documents/demo/college-id.png', 'college-id.png', 'image/png', 'Student ID', 'verified'
FROM "USER" u WHERE u.email = 'student1@college.local'
ON CONFLICT DO NOTHING;

-- Payments (demo)
INSERT INTO payments (user_id, amount, currency, razorpay_order_id, razorpay_payment_id, razorpay_signature, status)
SELECT u.userid, 1000, 'INR', 'order_demo_001', 'pay_demo_001', 'sig_demo_001', 'paid'
FROM "USER" u WHERE u.email = 'student1@college.local'
ON CONFLICT DO NOTHING;

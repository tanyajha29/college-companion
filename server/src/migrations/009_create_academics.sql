CREATE TABLE IF NOT EXISTS department (
  departmentid SERIAL PRIMARY KEY,
  deptname TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS division (
  divisionid SERIAL PRIMARY KEY,
  departmentid INTEGER NOT NULL REFERENCES department(departmentid) ON DELETE CASCADE,
  divisionname TEXT NOT NULL,
  UNIQUE (departmentid, divisionname)
);

CREATE TABLE IF NOT EXISTS course (
  courseid SERIAL PRIMARY KEY,
  departmentid INTEGER NOT NULL REFERENCES department(departmentid) ON DELETE CASCADE,
  coursecode TEXT NOT NULL,
  coursename TEXT NOT NULL,
  UNIQUE (departmentid, coursecode)
);

CREATE TABLE IF NOT EXISTS admin (
  adminid SERIAL PRIMARY KEY,
  userid INTEGER NOT NULL REFERENCES "USER"(userid) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS faculty (
  facultyid SERIAL PRIMARY KEY,
  userid INTEGER NOT NULL REFERENCES "USER"(userid) ON DELETE CASCADE,
  departmentid INTEGER REFERENCES department(departmentid),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  designation TEXT
);

CREATE TABLE IF NOT EXISTS student (
  studentid SERIAL PRIMARY KEY,
  userid INTEGER NOT NULL REFERENCES "USER"(userid) ON DELETE CASCADE,
  divisionid INTEGER REFERENCES division(divisionid),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  rollnumber TEXT,
  yearofstudy INTEGER
);

CREATE TABLE IF NOT EXISTS class_session (
  sessionid SERIAL PRIMARY KEY,
  courseid INTEGER NOT NULL REFERENCES course(courseid),
  facultyid INTEGER NOT NULL REFERENCES faculty(facultyid),
  divisionid INTEGER NOT NULL REFERENCES division(divisionid),
  sessiondate DATE DEFAULT CURRENT_DATE,
  topic TEXT
);

CREATE TABLE IF NOT EXISTS student_course (
  id SERIAL PRIMARY KEY,
  studentid INTEGER NOT NULL REFERENCES student(studentid) ON DELETE CASCADE,
  courseid INTEGER NOT NULL REFERENCES course(courseid) ON DELETE CASCADE,
  UNIQUE (studentid, courseid)
);

CREATE TABLE IF NOT EXISTS attendance (
  attendanceid SERIAL PRIMARY KEY,
  sessionid INTEGER NOT NULL REFERENCES class_session(sessionid) ON DELETE CASCADE,
  studentid INTEGER NOT NULL REFERENCES student(studentid) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL,
  UNIQUE (sessionid, studentid, date)
);

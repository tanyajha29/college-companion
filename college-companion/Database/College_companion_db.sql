-- PostgreSQL database dump (pgAdmin-friendly)

-- Table creation
CREATE TABLE public.applications (
    app_id integer NOT NULL,
    student_id integer,
    career_id integer,
    application_date date NOT NULL,
    status character varying(20) NOT NULL,
    CONSTRAINT applications_status_check CHECK (status IN ('Applied', 'Shortlisted', 'Rejected', 'Selected'))
);
ALTER TABLE public.applications OWNER TO postgres;

CREATE SEQUENCE public.applications_app_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    CACHE 1;
ALTER SEQUENCE public.applications_app_id_seq OWNER TO postgres;
ALTER SEQUENCE public.applications_app_id_seq OWNED BY public.applications.app_id;
ALTER TABLE ONLY public.applications ALTER COLUMN app_id SET DEFAULT nextval('public.applications_app_id_seq'::regclass);
ALTER TABLE ONLY public.applications ADD CONSTRAINT applications_pkey PRIMARY KEY (app_id);

-- Attendance
CREATE TABLE public.attendance (
    attendance_id integer NOT NULL,
    student_id integer,
    course_id integer,
    attendance_date date NOT NULL,
    status character varying(10),
    CONSTRAINT attendance_status_check CHECK (status IN ('Present', 'Absent'))
);
ALTER TABLE public.attendance OWNER TO postgres;

CREATE SEQUENCE public.attendance_attendance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    CACHE 1;
ALTER SEQUENCE public.attendance_attendance_id_seq OWNER TO postgres;
ALTER SEQUENCE public.attendance_attendance_id_seq OWNED BY public.attendance.attendance_id;
ALTER TABLE ONLY public.attendance ALTER COLUMN attendance_id SET DEFAULT nextval('public.attendance_attendance_id_seq'::regclass);
ALTER TABLE ONLY public.attendance ADD CONSTRAINT attendance_pkey PRIMARY KEY (attendance_id);

-- Career Opportunities
CREATE TABLE public.career_opportunities (
    career_id integer NOT NULL,
    title character varying(100) NOT NULL,
    company character varying(100) NOT NULL,
    location character varying(100) NOT NULL,
    eligibility character varying(255) NOT NULL
);
ALTER TABLE public.career_opportunities OWNER TO postgres;

CREATE SEQUENCE public.career_opportunities_career_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    CACHE 1;
ALTER SEQUENCE public.career_opportunities_career_id_seq OWNER TO postgres;
ALTER SEQUENCE public.career_opportunities_career_id_seq OWNED BY public.career_opportunities.career_id;
ALTER TABLE ONLY public.career_opportunities ALTER COLUMN career_id SET DEFAULT nextval('public.career_opportunities_career_id_seq'::regclass);
ALTER TABLE ONLY public.career_opportunities ADD CONSTRAINT career_opportunities_pkey PRIMARY KEY (career_id);

-- Career
CREATE TABLE public.career (
    career_id integer NOT NULL,
    career_title character varying(100) NOT NULL,
    description text,
    eligibility character varying(200)
);
ALTER TABLE public.career OWNER TO postgres;

CREATE SEQUENCE public.career_career_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    CACHE 1;
ALTER SEQUENCE public.career_career_id_seq OWNER TO postgres;
ALTER SEQUENCE public.career_career_id_seq OWNED BY public.career.career_id;
ALTER TABLE ONLY public.career ALTER COLUMN career_id SET DEFAULT nextval('public.career_career_id_seq'::regclass);
ALTER TABLE ONLY public.career ADD CONSTRAINT career_pkey PRIMARY KEY (career_id);

-- Careers table
CREATE TABLE public.careers (
    career_id integer NOT NULL,
    student_id integer,
    opportunity character varying(100) NOT NULL,
    status character varying(20),
    CONSTRAINT careers_status_check CHECK (status IN ('Applied', 'Interviewed', 'Selected', 'Rejected'))
);
ALTER TABLE public.careers OWNER TO postgres;

CREATE SEQUENCE public.careers_career_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    CACHE 1;
ALTER SEQUENCE public.careers_career_id_seq OWNER TO postgres;
ALTER SEQUENCE public.careers_career_id_seq OWNED BY public.careers.career_id;
ALTER TABLE ONLY public.careers ALTER COLUMN career_id SET DEFAULT nextval('public.careers_career_id_seq'::regclass);
ALTER TABLE ONLY public.careers ADD CONSTRAINT careers_pkey PRIMARY KEY (career_id);

-- Courses
CREATE TABLE public.courses (
    course_id integer NOT NULL,
    course_name character varying(100) NOT NULL,
    dept_id integer
);
ALTER TABLE public.courses OWNER TO postgres;

CREATE SEQUENCE public.courses_course_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    CACHE 1;
ALTER SEQUENCE public.courses_course_id_seq OWNER TO postgres;
ALTER SEQUENCE public.courses_course_id_seq OWNED BY public.courses.course_id;
ALTER TABLE ONLY public.courses ALTER COLUMN course_id SET DEFAULT nextval('public.courses_course_id_seq'::regclass);
ALTER TABLE ONLY public.courses ADD CONSTRAINT courses_pkey PRIMARY KEY (course_id);

-- Departments
CREATE TABLE public.departments (
    dept_id integer NOT NULL,
    dept_name character varying(100) NOT NULL
);
ALTER TABLE public.departments OWNER TO postgres;

CREATE SEQUENCE public.departments_dept_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    CACHE 1;
ALTER SEQUENCE public.departments_dept_id_seq OWNER TO postgres;
ALTER SEQUENCE public.departments_dept_id_seq OWNED BY public.departments.dept_id;
ALTER TABLE ONLY public.departments ALTER COLUMN dept_id SET DEFAULT nextval('public.departments_dept_id_seq'::regclass);
ALTER TABLE ONLY public.departments ADD CONSTRAINT departments_pkey PRIMARY KEY (dept_id);
ALTER TABLE ONLY public.departments ADD CONSTRAINT departments_dept_name_key UNIQUE (dept_name);

-- Exams
CREATE TABLE public.exams (
    exam_id integer NOT NULL,
    course_id integer,
    exam_date date NOT NULL,
    exam_type character varying(20),
    CONSTRAINT exams_exam_type_check CHECK (exam_type IN ('Midterm','Final','Practical'))
);
ALTER TABLE public.exams OWNER TO postgres;

CREATE SEQUENCE public.exams_exam_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    CACHE 1;
ALTER SEQUENCE public.exams_exam_id_seq OWNER TO postgres;
ALTER SEQUENCE public.exams_exam_id_seq OWNED BY public.exams.exam_id;
ALTER TABLE ONLY public.exams ALTER COLUMN exam_id SET DEFAULT nextval('public.exams_exam_id_seq'::regclass);
ALTER TABLE ONLY public.exams ADD CONSTRAINT exams_pkey PRIMARY KEY (exam_id);

-- Students
CREATE TABLE public.students (
    student_id integer NOT NULL,
    user_id integer,
    name character varying(100) NOT NULL,
    dept_id integer,
    year integer,
    CONSTRAINT students_year_check CHECK (year BETWEEN 1 AND 4)
);
ALTER TABLE public.students OWNER TO postgres;

CREATE SEQUENCE public.students_student_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    CACHE 1;
ALTER SEQUENCE public.students_student_id_seq OWNER TO postgres;
ALTER SEQUENCE public.students_student_id_seq OWNED BY public.students.student_id;
ALTER TABLE ONLY public.students ALTER COLUMN student_id SET DEFAULT nextval('public.students_student_id_seq'::regclass);
ALTER TABLE ONLY public.students ADD CONSTRAINT students_pkey PRIMARY KEY (student_id);
ALTER TABLE ONLY public.students ADD CONSTRAINT students_user_id_key UNIQUE (user_id);

-- Timetable
CREATE TABLE public.timetable (
    timetable_id integer NOT NULL,
    user_id integer NOT NULL,
    day character varying(10) NOT NULL,
    "time" time NOT NULL,
    subject character varying(100) NOT NULL,
    location character varying(100)
);
ALTER TABLE public.timetable OWNER TO postgres;

CREATE SEQUENCE public.timetable_timetable_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    CACHE 1;
ALTER SEQUENCE public.timetable_timetable_id_seq OWNER TO postgres;
ALTER SEQUENCE public.timetable_timetable_id_seq OWNED BY public.timetable.timetable_id;
ALTER TABLE ONLY public.timetable ALTER COLUMN timetable_id SET DEFAULT nextval('public.timetable_timetable_id_seq'::regclass);
ALTER TABLE ONLY public.timetable ADD CONSTRAINT timetable_pkey PRIMARY KEY (timetable_id);

-- Users
CREATE TABLE public.users (
    user_id integer NOT NULL,
    username character varying(50) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(20) NOT NULL,
    email character varying(255) NOT NULL,
    contact_no character varying(15),
    dept_id integer,
    CONSTRAINT users_role_check CHECK (role IN ('student','staff','admin'))
);
ALTER TABLE public.users OWNER TO postgres;

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    CACHE 1;
ALTER SEQUENCE public.users_user_id_seq OWNER TO postgres;
ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;
ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);
ALTER TABLE ONLY public.users ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);
ALTER TABLE ONLY public.users ADD CONSTRAINT unique_email UNIQUE (email);
ALTER TABLE ONLY public.users ADD CONSTRAINT users_username_key UNIQUE (username);

-- =====================
-- INSERT DATA (pgAdmin-friendly)
-- =====================

INSERT INTO public.applications (app_id, student_id, career_id, application_date, status) VALUES
(1, 1, 1, '2025-08-22', 'Applied'),
(2, 2, 2, '2025-08-23', 'Shortlisted'),
(3, 3, 3, '2025-08-24', 'Rejected');

INSERT INTO public.attendance (attendance_id, student_id, course_id, attendance_date, status) VALUES
(1, 1, 1, '2025-08-01', 'Present'),
(2, 2, 2, '2025-08-02', 'Absent'),
(3, 3, 3, '2025-08-03', 'Present');

INSERT INTO public.career_opportunities (career_id, title, company, location, eligibility) VALUES
(1, 'Software Engineer Intern', 'Google', 'Bangalore', 'CS/IT 3rd Year and above'),
(2, 'Network Engineer', 'Cisco', 'Pune', 'IT Students with Networking Knowledge'),
(3, 'Electronics Design Intern', 'Intel', 'Hyderabad', 'Electronics 3rd/4th Year');

INSERT INTO public.careers (career_id, student_id, opportunity, status) VALUES
(1, 1, 'Software Engineer Intern', 'Applied'),
(2, 2, 'Network Engineer', 'Interviewed'),
(3, 3, 'Electronics Design Intern', 'Selected');

-- Sequences fix after manual inserts
SELECT pg_catalog.setval('public.applications_app_id_seq', (SELECT MAX(app_id) FROM public.applications));
SELECT pg_catalog.setval('public.attendance_attendance_id_seq', (SELECT MAX(attendance_id) FROM public.attendance));
SELECT pg_catalog.setval('public.career_opportunities_career_id_seq', (SELECT MAX(career_id) FROM public.career_opportunities));
SELECT pg_catalog.setval('public.careers_career_id_seq', (SELECT MAX(career_id) FROM public.careers));


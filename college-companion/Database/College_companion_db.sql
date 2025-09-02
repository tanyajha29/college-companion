--
-- PostgreSQL database dump
--

\restrict muDdvamFjxwofz8NjCLm2WeefVCfsFWPYwQwYonZX62nA8vciVufDgRB0amaEnk

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

-- Started on 2025-09-02 22:15:18

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 220 (class 1259 OID 24674)
-- Name: applications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.applications (
    app_id integer NOT NULL,
    student_id integer,
    career_id integer,
    application_date date NOT NULL,
    status character varying(20) NOT NULL,
    CONSTRAINT applications_status_check CHECK (((status)::text = ANY ((ARRAY['Applied'::character varying, 'Shortlisted'::character varying, 'Rejected'::character varying, 'Selected'::character varying])::text[])))
);


ALTER TABLE public.applications OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 24673)
-- Name: applications_app_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.applications_app_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.applications_app_id_seq OWNER TO postgres;

--
-- TOC entry 5022 (class 0 OID 0)
-- Dependencies: 219
-- Name: applications_app_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.applications_app_id_seq OWNED BY public.applications.app_id;


--
-- TOC entry 234 (class 1259 OID 33040)
-- Name: attendance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attendance (
    attendance_id integer NOT NULL,
    student_id integer,
    course_id integer,
    attendance_date date NOT NULL,
    status character varying(10),
    CONSTRAINT attendance_status_check CHECK (((status)::text = ANY ((ARRAY['Present'::character varying, 'Absent'::character varying])::text[])))
);


ALTER TABLE public.attendance OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 33039)
-- Name: attendance_attendance_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.attendance_attendance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.attendance_attendance_id_seq OWNER TO postgres;

--
-- TOC entry 5023 (class 0 OID 0)
-- Dependencies: 233
-- Name: attendance_attendance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.attendance_attendance_id_seq OWNED BY public.attendance.attendance_id;


--
-- TOC entry 222 (class 1259 OID 32851)
-- Name: career; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.career (
    career_id integer NOT NULL,
    career_title character varying(100) NOT NULL,
    description text,
    eligibility character varying(200)
);


ALTER TABLE public.career OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 32850)
-- Name: career_career_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.career_career_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.career_career_id_seq OWNER TO postgres;

--
-- TOC entry 5024 (class 0 OID 0)
-- Dependencies: 221
-- Name: career_career_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.career_career_id_seq OWNED BY public.career.career_id;


--
-- TOC entry 218 (class 1259 OID 24665)
-- Name: career_opportunities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.career_opportunities (
    career_id integer NOT NULL,
    title character varying(100) NOT NULL,
    company character varying(100) NOT NULL,
    location character varying(100) NOT NULL,
    eligibility character varying(255) NOT NULL
);


ALTER TABLE public.career_opportunities OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 24664)
-- Name: career_opportunities_career_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.career_opportunities_career_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.career_opportunities_career_id_seq OWNER TO postgres;

--
-- TOC entry 5025 (class 0 OID 0)
-- Dependencies: 217
-- Name: career_opportunities_career_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.career_opportunities_career_id_seq OWNED BY public.career_opportunities.career_id;


--
-- TOC entry 236 (class 1259 OID 33058)
-- Name: careers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.careers (
    career_id integer NOT NULL,
    student_id integer,
    opportunity character varying(100) NOT NULL,
    status character varying(20),
    CONSTRAINT careers_status_check CHECK (((status)::text = ANY ((ARRAY['Applied'::character varying, 'Interviewed'::character varying, 'Selected'::character varying, 'Rejected'::character varying])::text[])))
);


ALTER TABLE public.careers OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 33057)
-- Name: careers_career_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.careers_career_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.careers_career_id_seq OWNER TO postgres;

--
-- TOC entry 5026 (class 0 OID 0)
-- Dependencies: 235
-- Name: careers_career_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.careers_career_id_seq OWNED BY public.careers.career_id;


--
-- TOC entry 230 (class 1259 OID 33015)
-- Name: courses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.courses (
    course_id integer NOT NULL,
    course_name character varying(100) NOT NULL,
    dept_id integer
);


ALTER TABLE public.courses OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 33014)
-- Name: courses_course_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.courses_course_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.courses_course_id_seq OWNER TO postgres;

--
-- TOC entry 5027 (class 0 OID 0)
-- Dependencies: 229
-- Name: courses_course_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.courses_course_id_seq OWNED BY public.courses.course_id;


--
-- TOC entry 226 (class 1259 OID 32986)
-- Name: departments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departments (
    dept_id integer NOT NULL,
    dept_name character varying(100) NOT NULL
);


ALTER TABLE public.departments OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 32985)
-- Name: departments_dept_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.departments_dept_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.departments_dept_id_seq OWNER TO postgres;

--
-- TOC entry 5028 (class 0 OID 0)
-- Dependencies: 225
-- Name: departments_dept_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.departments_dept_id_seq OWNED BY public.departments.dept_id;


--
-- TOC entry 232 (class 1259 OID 33027)
-- Name: exams; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.exams (
    exam_id integer NOT NULL,
    course_id integer,
    exam_date date NOT NULL,
    exam_type character varying(20),
    CONSTRAINT exams_exam_type_check CHECK (((exam_type)::text = ANY ((ARRAY['Midterm'::character varying, 'Final'::character varying, 'Practical'::character varying])::text[])))
);


ALTER TABLE public.exams OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 33026)
-- Name: exams_exam_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.exams_exam_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.exams_exam_id_seq OWNER TO postgres;

--
-- TOC entry 5029 (class 0 OID 0)
-- Dependencies: 231
-- Name: exams_exam_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.exams_exam_id_seq OWNED BY public.exams.exam_id;


--
-- TOC entry 228 (class 1259 OID 32995)
-- Name: students; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.students (
    student_id integer NOT NULL,
    user_id integer,
    name character varying(100) NOT NULL,
    dept_id integer,
    year integer,
    CONSTRAINT students_year_check CHECK (((year >= 1) AND (year <= 4)))
);


ALTER TABLE public.students OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 32994)
-- Name: students_student_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.students_student_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.students_student_id_seq OWNER TO postgres;

--
-- TOC entry 5030 (class 0 OID 0)
-- Dependencies: 227
-- Name: students_student_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.students_student_id_seq OWNED BY public.students.student_id;


--
-- TOC entry 238 (class 1259 OID 40965)
-- Name: timetable; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.timetable (
    timetable_id integer NOT NULL,
    user_id integer NOT NULL,
    day character varying(10) NOT NULL,
    "time" time without time zone NOT NULL,
    subject character varying(100) NOT NULL,
    location character varying(100)
);


ALTER TABLE public.timetable OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 40964)
-- Name: timetable_timetable_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.timetable_timetable_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.timetable_timetable_id_seq OWNER TO postgres;

--
-- TOC entry 5031 (class 0 OID 0)
-- Dependencies: 237
-- Name: timetable_timetable_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.timetable_timetable_id_seq OWNED BY public.timetable.timetable_id;


--
-- TOC entry 224 (class 1259 OID 32976)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    username character varying(50) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(20) NOT NULL,
    email character varying(255) NOT NULL,
    contact_no character varying(15),
    dept_id integer,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['student'::character varying, 'staff'::character varying, 'admin'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 32975)
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_user_id_seq OWNER TO postgres;

--
-- TOC entry 5032 (class 0 OID 0)
-- Dependencies: 223
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- TOC entry 4793 (class 2604 OID 24677)
-- Name: applications app_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications ALTER COLUMN app_id SET DEFAULT nextval('public.applications_app_id_seq'::regclass);


--
-- TOC entry 4800 (class 2604 OID 33043)
-- Name: attendance attendance_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance ALTER COLUMN attendance_id SET DEFAULT nextval('public.attendance_attendance_id_seq'::regclass);


--
-- TOC entry 4794 (class 2604 OID 32854)
-- Name: career career_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.career ALTER COLUMN career_id SET DEFAULT nextval('public.career_career_id_seq'::regclass);


--
-- TOC entry 4792 (class 2604 OID 24668)
-- Name: career_opportunities career_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.career_opportunities ALTER COLUMN career_id SET DEFAULT nextval('public.career_opportunities_career_id_seq'::regclass);


--
-- TOC entry 4801 (class 2604 OID 33061)
-- Name: careers career_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.careers ALTER COLUMN career_id SET DEFAULT nextval('public.careers_career_id_seq'::regclass);


--
-- TOC entry 4798 (class 2604 OID 33018)
-- Name: courses course_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses ALTER COLUMN course_id SET DEFAULT nextval('public.courses_course_id_seq'::regclass);


--
-- TOC entry 4796 (class 2604 OID 32989)
-- Name: departments dept_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments ALTER COLUMN dept_id SET DEFAULT nextval('public.departments_dept_id_seq'::regclass);


--
-- TOC entry 4799 (class 2604 OID 33030)
-- Name: exams exam_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exams ALTER COLUMN exam_id SET DEFAULT nextval('public.exams_exam_id_seq'::regclass);


--
-- TOC entry 4797 (class 2604 OID 32998)
-- Name: students student_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students ALTER COLUMN student_id SET DEFAULT nextval('public.students_student_id_seq'::regclass);


--
-- TOC entry 4802 (class 2604 OID 40968)
-- Name: timetable timetable_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timetable ALTER COLUMN timetable_id SET DEFAULT nextval('public.timetable_timetable_id_seq'::regclass);


--
-- TOC entry 4795 (class 2604 OID 32979)
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- TOC entry 4998 (class 0 OID 24674)
-- Dependencies: 220
-- Data for Name: applications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.applications (app_id, student_id, career_id, application_date, status) FROM stdin;
1	1	1	2025-08-22	Applied
2	2	2	2025-08-23	Shortlisted
3	3	3	2025-08-24	Rejected
\.


--
-- TOC entry 5012 (class 0 OID 33040)
-- Dependencies: 234
-- Data for Name: attendance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.attendance (attendance_id, student_id, course_id, attendance_date, status) FROM stdin;
1	1	1	2025-08-01	Present
2	2	2	2025-08-02	Absent
3	3	3	2025-08-03	Present
\.


--
-- TOC entry 5000 (class 0 OID 32851)
-- Dependencies: 222
-- Data for Name: career; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.career (career_id, career_title, description, eligibility) FROM stdin;
\.


--
-- TOC entry 4996 (class 0 OID 24665)
-- Dependencies: 218
-- Data for Name: career_opportunities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.career_opportunities (career_id, title, company, location, eligibility) FROM stdin;
1	Software Engineer Intern	Google	Bangalore	CS/IT 3rd Year and above
2	Network Engineer	Cisco	Pune	IT Students with Networking Knowledge
3	Electronics Design Intern	Intel	Hyderabad	Electronics 3rd/4th Year
\.


--
-- TOC entry 5014 (class 0 OID 33058)
-- Dependencies: 236
-- Data for Name: careers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.careers (career_id, student_id, opportunity, status) FROM stdin;
1	1	Internship at Google	Applied
2	2	Placement at Infosys	Interviewed
3	3	Research Fellowship	Selected
\.


--
-- TOC entry 5008 (class 0 OID 33015)
-- Dependencies: 230
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.courses (course_id, course_name, dept_id) FROM stdin;
1	Database Systems	1
2	Computer Networks	2
3	Digital Electronics	3
\.


--
-- TOC entry 5004 (class 0 OID 32986)
-- Dependencies: 226
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.departments (dept_id, dept_name) FROM stdin;
2	INFT
1	CMPN
3	EXCS
4	EXTC
\.


--
-- TOC entry 5010 (class 0 OID 33027)
-- Dependencies: 232
-- Data for Name: exams; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.exams (exam_id, course_id, exam_date, exam_type) FROM stdin;
1	1	2025-09-10	Midterm
2	2	2025-09-15	Final
3	3	2025-09-20	Practical
\.


--
-- TOC entry 5006 (class 0 OID 32995)
-- Dependencies: 228
-- Data for Name: students; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.students (student_id, user_id, name, dept_id, year) FROM stdin;
1	1	John Doe	1	2
2	2	Jane Smith	2	3
3	3	Admin Student	3	1
\.


--
-- TOC entry 5016 (class 0 OID 40965)
-- Dependencies: 238
-- Data for Name: timetable; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.timetable (timetable_id, user_id, day, "time", subject, location) FROM stdin;
1	1	Tuesday	10:30:00	DBMS	Lab 202
\.


--
-- TOC entry 5002 (class 0 OID 32976)
-- Dependencies: 224
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, username, password, role, email, contact_no, dept_id) FROM stdin;
1	john_doe	pass123	student	user1@example.com	\N	\N
2	jane_smith	pass456	student	user2@example.com	\N	\N
3	admin1	adminpass	admin	user3@example.com	\N	\N
5	tanya	$2b$10$xsLxaYRXNJNe6M/Z4OvXmeoueKdKJFeFrB2qgznf7Qe7YI/rX0WRu	student	tanya@gmail.com	\N	\N
6	Mansi	$2b$10$rmlaLIBQhuwP06k6oiv6FOUcWZcIQCdN4XB15ulUwumTmZ4rZp4Vm	student	mansi@gmail.com	\N	\N
7	tanya29	$2b$10$K9Dlgsqj7KBCvypiSNGJbOP0XuUfp6ojSZu/A.zaWT5GuyJ6/vS0y	admin	tanya29@gmail.com	\N	\N
8	admin123	admin123	admin	admin123@gmail.com	9876543210	\N
9	admin211	$2b$10$tClAwKvTcMOZvuuPqdZ0Bum6Fg04Uc9XFX9p5MkwGs3YmUnWJFwpO	admin	admin211@gmail.com	+91 2345678934	\N
\.


--
-- TOC entry 5033 (class 0 OID 0)
-- Dependencies: 219
-- Name: applications_app_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.applications_app_id_seq', 3, true);


--
-- TOC entry 5034 (class 0 OID 0)
-- Dependencies: 233
-- Name: attendance_attendance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.attendance_attendance_id_seq', 3, true);


--
-- TOC entry 5035 (class 0 OID 0)
-- Dependencies: 221
-- Name: career_career_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.career_career_id_seq', 1, false);


--
-- TOC entry 5036 (class 0 OID 0)
-- Dependencies: 217
-- Name: career_opportunities_career_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.career_opportunities_career_id_seq', 3, true);


--
-- TOC entry 5037 (class 0 OID 0)
-- Dependencies: 235
-- Name: careers_career_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.careers_career_id_seq', 3, true);


--
-- TOC entry 5038 (class 0 OID 0)
-- Dependencies: 229
-- Name: courses_course_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.courses_course_id_seq', 3, true);


--
-- TOC entry 5039 (class 0 OID 0)
-- Dependencies: 225
-- Name: departments_dept_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.departments_dept_id_seq', 4, true);


--
-- TOC entry 5040 (class 0 OID 0)
-- Dependencies: 231
-- Name: exams_exam_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.exams_exam_id_seq', 3, true);


--
-- TOC entry 5041 (class 0 OID 0)
-- Dependencies: 227
-- Name: students_student_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.students_student_id_seq', 3, true);


--
-- TOC entry 5042 (class 0 OID 0)
-- Dependencies: 237
-- Name: timetable_timetable_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.timetable_timetable_id_seq', 3, true);


--
-- TOC entry 5043 (class 0 OID 0)
-- Dependencies: 223
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_user_id_seq', 9, true);


--
-- TOC entry 4812 (class 2606 OID 24680)
-- Name: applications applications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_pkey PRIMARY KEY (app_id);


--
-- TOC entry 4835 (class 2606 OID 33046)
-- Name: attendance attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_pkey PRIMARY KEY (attendance_id);


--
-- TOC entry 4810 (class 2606 OID 24672)
-- Name: career_opportunities career_opportunities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.career_opportunities
    ADD CONSTRAINT career_opportunities_pkey PRIMARY KEY (career_id);


--
-- TOC entry 4814 (class 2606 OID 32858)
-- Name: career career_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.career
    ADD CONSTRAINT career_pkey PRIMARY KEY (career_id);


--
-- TOC entry 4837 (class 2606 OID 33064)
-- Name: careers careers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.careers
    ADD CONSTRAINT careers_pkey PRIMARY KEY (career_id);


--
-- TOC entry 4831 (class 2606 OID 33020)
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (course_id);


--
-- TOC entry 4823 (class 2606 OID 32993)
-- Name: departments departments_dept_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_dept_name_key UNIQUE (dept_name);


--
-- TOC entry 4825 (class 2606 OID 32991)
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (dept_id);


--
-- TOC entry 4833 (class 2606 OID 33033)
-- Name: exams exams_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exams
    ADD CONSTRAINT exams_pkey PRIMARY KEY (exam_id);


--
-- TOC entry 4827 (class 2606 OID 33001)
-- Name: students students_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (student_id);


--
-- TOC entry 4829 (class 2606 OID 33003)
-- Name: students students_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_user_id_key UNIQUE (user_id);


--
-- TOC entry 4839 (class 2606 OID 40970)
-- Name: timetable timetable_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timetable
    ADD CONSTRAINT timetable_pkey PRIMARY KEY (timetable_id);


--
-- TOC entry 4816 (class 2606 OID 33074)
-- Name: users unique_email; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT unique_email UNIQUE (email);


--
-- TOC entry 4819 (class 2606 OID 32982)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- TOC entry 4821 (class 2606 OID 32984)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 4817 (class 1259 OID 33077)
-- Name: unique_username; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_username ON public.users USING btree (username);


--
-- TOC entry 4840 (class 2606 OID 24686)
-- Name: applications applications_career_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_career_id_fkey FOREIGN KEY (career_id) REFERENCES public.career_opportunities(career_id) ON DELETE CASCADE;


--
-- TOC entry 4846 (class 2606 OID 33052)
-- Name: attendance attendance_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(course_id) ON DELETE CASCADE;


--
-- TOC entry 4847 (class 2606 OID 33047)
-- Name: attendance attendance_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(student_id) ON DELETE CASCADE;


--
-- TOC entry 4848 (class 2606 OID 33065)
-- Name: careers careers_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.careers
    ADD CONSTRAINT careers_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(student_id) ON DELETE CASCADE;


--
-- TOC entry 4844 (class 2606 OID 33021)
-- Name: courses courses_dept_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_dept_id_fkey FOREIGN KEY (dept_id) REFERENCES public.departments(dept_id) ON DELETE CASCADE;


--
-- TOC entry 4845 (class 2606 OID 33034)
-- Name: exams exams_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exams
    ADD CONSTRAINT exams_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(course_id) ON DELETE CASCADE;


--
-- TOC entry 4849 (class 2606 OID 40971)
-- Name: timetable fk_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timetable
    ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 4842 (class 2606 OID 33009)
-- Name: students students_dept_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_dept_id_fkey FOREIGN KEY (dept_id) REFERENCES public.departments(dept_id) ON DELETE SET NULL;


--
-- TOC entry 4843 (class 2606 OID 33004)
-- Name: students students_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 4841 (class 2606 OID 33079)
-- Name: users users_dept_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_dept_id_fkey FOREIGN KEY (dept_id) REFERENCES public.departments(dept_id);


-- Completed on 2025-09-02 22:15:20

--
-- PostgreSQL database dump complete
--

\unrestrict muDdvamFjxwofz8NjCLm2WeefVCfsFWPYwQwYonZX62nA8vciVufDgRB0amaEnk


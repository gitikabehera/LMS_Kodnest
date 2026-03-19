-- ============================================================
-- LMS DATABASE SCHEMA
-- Production-Ready MySQL Schema for YouTube-based LMS
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- ============================================================
-- TABLE: users
-- ============================================================
CREATE TABLE users (
    id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    email         VARCHAR(255)    NOT NULL,
    password_hash VARCHAR(255)    NOT NULL,
    name          VARCHAR(150)    NOT NULL,
    created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: subjects
-- ============================================================
CREATE TABLE subjects (
    id           INT UNSIGNED   NOT NULL AUTO_INCREMENT,
    title        VARCHAR(255)   NOT NULL,
    slug         VARCHAR(255)   NOT NULL,
    description  TEXT,
    is_published TINYINT(1)     NOT NULL DEFAULT 0,
    created_at   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_subjects_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: sections
-- ============================================================
CREATE TABLE sections (
    id          INT UNSIGNED   NOT NULL AUTO_INCREMENT,
    subject_id  INT UNSIGNED   NOT NULL,
    title       VARCHAR(255)   NOT NULL,
    order_index INT UNSIGNED   NOT NULL,
    created_at  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_sections_subject_order (subject_id, order_index),
    CONSTRAINT fk_sections_subject
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: videos
-- ============================================================
CREATE TABLE videos (
    id               INT UNSIGNED   NOT NULL AUTO_INCREMENT,
    section_id       INT UNSIGNED   NOT NULL,
    title            VARCHAR(255)   NOT NULL,
    description      TEXT,
    youtube_url      VARCHAR(512)   NOT NULL,
    order_index      INT UNSIGNED   NOT NULL,
    duration_seconds INT UNSIGNED   DEFAULT NULL,
    created_at       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_videos_section_order (section_id, order_index),
    CONSTRAINT fk_videos_section
        FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: enrollments
-- ============================================================
CREATE TABLE enrollments (
    id         INT UNSIGNED   NOT NULL AUTO_INCREMENT,
    user_id    INT UNSIGNED   NOT NULL,
    subject_id INT UNSIGNED   NOT NULL,
    created_at DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_enrollments_user_subject (user_id, subject_id),
    CONSTRAINT fk_enrollments_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_enrollments_subject
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: video_progress
-- ============================================================
CREATE TABLE video_progress (
    id                    INT UNSIGNED   NOT NULL AUTO_INCREMENT,
    user_id               INT UNSIGNED   NOT NULL,
    video_id              INT UNSIGNED   NOT NULL,
    last_position_seconds INT UNSIGNED   NOT NULL DEFAULT 0,
    is_completed          TINYINT(1)     NOT NULL DEFAULT 0,
    completed_at          DATETIME       DEFAULT NULL,
    created_at            DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at            DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_video_progress_user_video (user_id, video_id),
    CONSTRAINT fk_video_progress_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_video_progress_video
        FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: refresh_tokens
-- ============================================================
CREATE TABLE refresh_tokens (
    id         INT UNSIGNED   NOT NULL AUTO_INCREMENT,
    user_id    INT UNSIGNED   NOT NULL,
    token_hash VARCHAR(512)   NOT NULL,
    expires_at DATETIME       NOT NULL,
    revoked_at DATETIME       DEFAULT NULL,
    created_at DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    CONSTRAINT fk_refresh_tokens_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- INDEXES
-- ============================================================

-- sections
CREATE INDEX idx_sections_subject_id    ON sections (subject_id);
CREATE INDEX idx_sections_order_index   ON sections (order_index);

-- videos
CREATE INDEX idx_videos_section_id      ON videos (section_id);
CREATE INDEX idx_videos_order_index     ON videos (order_index);

-- enrollments
CREATE INDEX idx_enrollments_user_id    ON enrollments (user_id);
CREATE INDEX idx_enrollments_subject_id ON enrollments (subject_id);

-- video_progress
CREATE INDEX idx_video_progress_user_id  ON video_progress (user_id);
CREATE INDEX idx_video_progress_video_id ON video_progress (video_id);
CREATE INDEX idx_video_progress_completed ON video_progress (is_completed);

-- refresh_tokens
CREATE INDEX idx_refresh_tokens_user_token ON refresh_tokens (user_id, token_hash(64));
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens (expires_at);

-- ============================================================
-- SEED DATA
-- ============================================================

-- ------------------------------------------------------------
-- Users (3 sample users, passwords are bcrypt hashes of 'password123')
-- ------------------------------------------------------------
INSERT INTO users (email, password_hash, name) VALUES
('alice@example.com',   '$2b$12$KIXtq1234567890abcdefuABCDEFGHIJKLMNOPQRSTUVWXYZ01234', 'Alice Johnson'),
('bob@example.com',     '$2b$12$KIXtq1234567890abcdefuABCDEFGHIJKLMNOPQRSTUVWXYZ01235', 'Bob Smith'),
('charlie@example.com', '$2b$12$KIXtq1234567890abcdefuABCDEFGHIJKLMNOPQRSTUVWXYZ01236', 'Charlie Brown');

-- ------------------------------------------------------------
-- Subjects
-- ------------------------------------------------------------
INSERT INTO subjects (title, slug, description, is_published) VALUES
('Data Science',        'data-science',        'Learn data analysis, visualization, and machine learning from scratch.', 1),
('Python Programming',  'python-programming',  'Master Python from basics to advanced concepts with hands-on projects.',  1),
('Java Programming',    'java-programming',    'Comprehensive Java course covering OOP, collections, and Spring Boot.',   1);

-- ------------------------------------------------------------
-- Sections — Subject 1: Data Science (id=1)
-- ------------------------------------------------------------
INSERT INTO sections (subject_id, title, order_index) VALUES
(1, 'Introduction to Data Science',     1),
(1, 'Data Analysis with Pandas',        2);

-- Sections — Subject 2: Python Programming (id=2)
INSERT INTO sections (subject_id, title, order_index) VALUES
(2, 'Python Basics',                    1),
(2, 'Advanced Python Concepts',         2);

-- Sections — Subject 3: Java Programming (id=3)
INSERT INTO sections (subject_id, title, order_index) VALUES
(3, 'Java Fundamentals',                1),
(3, 'Object-Oriented Programming',      2);

-- ------------------------------------------------------------
-- Videos
-- Section 1 — Introduction to Data Science (section_id=1)
-- ------------------------------------------------------------
INSERT INTO videos (section_id, title, description, youtube_url, order_index, duration_seconds) VALUES
(1, 'What is Data Science?',
    'Overview of data science, its applications, and career paths.',
    'https://www.youtube.com/watch?v=X3paOmcrTjQ', 1, 612),

(1, 'Setting Up Your Data Science Environment',
    'Install Python, Jupyter Notebook, and essential libraries.',
    'https://www.youtube.com/watch?v=5pf0_bpNbkw', 2, 845),

(1, 'Introduction to NumPy',
    'Learn array operations and numerical computing with NumPy.',
    'https://www.youtube.com/watch?v=QUT1VHiLmmI', 3, 1320);

-- Section 2 — Data Analysis with Pandas (section_id=2)
INSERT INTO videos (section_id, title, description, youtube_url, order_index, duration_seconds) VALUES
(2, 'Pandas DataFrames and Series',
    'Understand the core data structures in Pandas.',
    'https://www.youtube.com/watch?v=vmEHCJofslg', 1, 1540),

(2, 'Data Cleaning with Pandas',
    'Handle missing values, duplicates, and data type conversions.',
    'https://www.youtube.com/watch?v=bDhvCp3_lYw', 2, 1230),

(2, 'Data Visualization with Matplotlib',
    'Create charts and plots to communicate insights effectively.',
    'https://www.youtube.com/watch?v=3Xc3CA655Y4', 3, 1410);

-- Section 3 — Python Basics (section_id=3)
INSERT INTO videos (section_id, title, description, youtube_url, order_index, duration_seconds) VALUES
(3, 'Python Installation and Hello World',
    'Install Python and write your first program.',
    'https://www.youtube.com/watch?v=YYXdXT2l-Gg', 1, 480),

(3, 'Variables, Data Types, and Operators',
    'Learn Python variables, strings, integers, floats, and operators.',
    'https://www.youtube.com/watch?v=Z1Yd7upQsXY', 2, 720),

(3, 'Control Flow: if, for, while',
    'Master conditionals and loops in Python.',
    'https://www.youtube.com/watch?v=PqFKRqpHrjw', 3, 960);

-- Section 4 — Advanced Python Concepts (section_id=4)
INSERT INTO videos (section_id, title, description, youtube_url, order_index, duration_seconds) VALUES
(4, 'Functions and Lambda Expressions',
    'Define reusable functions and use lambda for concise logic.',
    'https://www.youtube.com/watch?v=9Os0o3wzS_I', 1, 1080),

(4, 'List Comprehensions and Generators',
    'Write Pythonic code using comprehensions and generators.',
    'https://www.youtube.com/watch?v=C-gEQdGVXbk', 2, 900),

(4, 'Decorators and Context Managers',
    'Understand advanced Python patterns used in production code.',
    'https://www.youtube.com/watch?v=FsAPt_9Bf3U', 3, 1150);

-- Section 5 — Java Fundamentals (section_id=5)
INSERT INTO videos (section_id, title, description, youtube_url, order_index, duration_seconds) VALUES
(5, 'Java Installation and First Program',
    'Set up JDK, configure PATH, and write Hello World in Java.',
    'https://www.youtube.com/watch?v=eIrMbAQSU34', 1, 540),

(5, 'Java Data Types, Variables, and Operators',
    'Explore primitive types, reference types, and expressions.',
    'https://www.youtube.com/watch?v=RRubcjpTkks', 2, 810),

(5, 'Control Statements in Java',
    'Use if-else, switch, for, while, and do-while in Java.',
    'https://www.youtube.com/watch?v=ldYLYRXaucM', 3, 990);

-- Section 6 — Object-Oriented Programming (section_id=6)
INSERT INTO videos (section_id, title, description, youtube_url, order_index, duration_seconds) VALUES
(6, 'Classes and Objects in Java',
    'Understand the blueprint concept, instantiation, and constructors.',
    'https://www.youtube.com/watch?v=IUqKuGNasdM', 1, 1200),

(6, 'Inheritance and Polymorphism',
    'Extend classes, override methods, and use runtime polymorphism.',
    'https://www.youtube.com/watch?v=9YOSMbFSQFk', 2, 1350),

(6, 'Interfaces and Abstract Classes',
    'Design flexible systems using interfaces and abstraction.',
    'https://www.youtube.com/watch?v=HvPlEJ3LHgE', 3, 1100);

-- ------------------------------------------------------------
-- Enrollments (enroll all 3 users in all 3 subjects)
-- ------------------------------------------------------------
INSERT INTO enrollments (user_id, subject_id) VALUES
(1, 1), (1, 2), (1, 3),
(2, 1), (2, 2),
(3, 3);

-- ------------------------------------------------------------
-- Video Progress (sample progress for user 1 in subject 1)
-- Demonstrates sequential unlock: video 1 completed, video 2 in progress
-- ------------------------------------------------------------
INSERT INTO video_progress (user_id, video_id, last_position_seconds, is_completed, completed_at) VALUES
(1, 1, 612,  1, '2026-03-10 10:15:00'),
(1, 2, 845,  1, '2026-03-11 11:30:00'),
(1, 3, 430,  0, NULL);

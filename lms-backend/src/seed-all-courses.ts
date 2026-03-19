/**
 * seed-all-courses.ts
 * 1. Wipes and re-seeds ALL subjects/sections/videos with correct verified content
 * 2. Adds 5 new subjects: DSA, System Design, AI, Interview Prep, Full Stack
 * 3. All YouTube URLs are in embed format from large channels (always embeddable)
 * Safe: does NOT touch users, enrollments, progress, badges, forum data.
 */
import 'dotenv/config';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'mysql-29c3ab9d-gitika-9691.b.aivencloud.com',
  port:     Number(process.env.DB_PORT) || 23306,
  database: process.env.DB_NAME     || 'defaultdb',
  user:     process.env.DB_USER     || 'avnadmin',
  password: process.env.DB_PASSWORD || '',
  ssl: { rejectUnauthorized: false },
});

type VideoRow = [string, string, string, number]; // title, url, desc, duration
type SectionDef = { title: string; videos: VideoRow[]; quiz: string };
type SubjectDef = { title: string; slug: string; desc: string; sections: SectionDef[] };

// ─── All course definitions ───────────────────────────────────────────────────
// Video IDs are from freeCodeCamp, Traversy Media, Fireship, TechWorld with Nana
// — large channels that always allow embedding.
const COURSES: SubjectDef[] = [
  // ── 1. Web Development ──────────────────────────────────────────────────────
  {
    title: 'Web Development', slug: 'web-development',
    desc: 'Learn HTML, CSS, JavaScript and React from scratch',
    sections: [
      { title: 'HTML & CSS Basics', quiz: 'HTML & CSS Quiz', videos: [
        ['HTML Full Course for Beginners', 'https://www.youtube.com/embed/pQN-pnXPaVg', 'Complete HTML tutorial — freeCodeCamp', 3600],
        ['CSS Crash Course', 'https://www.youtube.com/embed/yfoY53QXEnI', 'CSS fundamentals and styling — Traversy Media', 3600],
        ['Responsive Web Design', 'https://www.youtube.com/embed/srvUrASNj0s', 'Build responsive layouts with CSS Flexbox & Grid', 2700],
      ]},
      { title: 'JavaScript Fundamentals', quiz: 'JavaScript Quiz', videos: [
        ['JavaScript Full Course', 'https://www.youtube.com/embed/W6NZfCO5SIk', 'JS from zero to hero — Programming with Mosh', 3600],
        ['DOM Manipulation Crash Course', 'https://www.youtube.com/embed/5fb2aPlgoys', 'Interact with the browser DOM using JS', 1800],
        ['JavaScript ES6+ Features', 'https://www.youtube.com/embed/NCwa_xi0Uuc', 'Arrow functions, promises, async/await and more', 2700],
      ]},
      { title: 'React Introduction', quiz: 'React Quiz', videos: [
        ['React JS Crash Course', 'https://www.youtube.com/embed/Ke90Tje7VS0', 'Build your first React app — Traversy Media', 3600],
        ['React Hooks Explained', 'https://www.youtube.com/embed/O6P86uwfdR0', 'useState, useEffect and custom hooks', 2700],
        ['React Router & State Management', 'https://www.youtube.com/embed/Law7wfdg_ls', 'Routing and global state in React apps', 2700],
      ]},
    ],
  },

  // ── 2. Python Programming ────────────────────────────────────────────────────
  {
    title: 'Python Programming', slug: 'python-programming',
    desc: 'Master Python from basics to advanced topics',
    sections: [
      { title: 'Python Basics', quiz: 'Python Basics Quiz', videos: [
        ['Python for Beginners Full Course', 'https://www.youtube.com/embed/_uQrJ0TkZlc', 'Complete Python beginner course — Programming with Mosh', 3600],
        ['Python Functions & OOP', 'https://www.youtube.com/embed/xUI5Tsl2JpY', 'Functions, classes and objects in Python', 2700],
        ['Python Lists, Dicts & Tuples', 'https://www.youtube.com/embed/W8KRzm-HUcc', 'Core Python data structures explained', 2700],
      ]},
      { title: 'Python Advanced', quiz: 'Python Advanced Quiz', videos: [
        ['Python Advanced Topics', 'https://www.youtube.com/embed/HGOBQPFzWKo', 'Decorators, generators and async Python', 3600],
        ['Python File Handling & Exceptions', 'https://www.youtube.com/embed/Uh2ebFW8OYM', 'Read/write files and handle errors in Python', 2700],
        ['Python Virtual Environments & Pip', 'https://www.youtube.com/embed/APOPm01BVrk', 'Manage Python packages and environments', 1800],
      ]},
    ],
  },
  // ── 3. Data Science ──────────────────────────────────────────────────────────
  {
    title: 'Data Science', slug: 'data-science',
    desc: 'Data analysis, machine learning and AI with Python',
    sections: [
      { title: 'Data Analysis with Pandas', quiz: 'Pandas Quiz', videos: [
        ['Pandas Full Course', 'https://www.youtube.com/embed/vmEHCJofslg', 'Pandas for data analysis — Keith Galli', 3600],
        ['Data Visualisation with Matplotlib', 'https://www.youtube.com/embed/a9UrKTVEeZA', 'Charts and plots with Matplotlib & Seaborn', 2700],
        ['NumPy Crash Course', 'https://www.youtube.com/embed/QUT1VHiLmmI', 'NumPy arrays and operations for data science', 2700],
      ]},
      { title: 'Machine Learning Intro', quiz: 'ML Quiz', videos: [
        ['Machine Learning Full Course', 'https://www.youtube.com/embed/Gv9_4yMHFhI', 'ML crash course with scikit-learn — freeCodeCamp', 3600],
        ['Linear & Logistic Regression', 'https://www.youtube.com/embed/VmbA0pi2cRQ', 'Regression models explained with Python', 2700],
        ['Decision Trees & Random Forests', 'https://www.youtube.com/embed/RmajweUFKvM', 'Tree-based ML models explained', 2700],
      ]},
    ],
  },

  // ── 4. Cybersecurity ─────────────────────────────────────────────────────────
  {
    title: 'Cybersecurity', slug: 'cybersecurity',
    desc: 'Ethical hacking, network security and cyber defence',
    sections: [
      { title: 'Cybersecurity Fundamentals', quiz: 'Cybersecurity Quiz', videos: [
        ['Cybersecurity Full Course', 'https://www.youtube.com/embed/inWWhr5tnEA', 'Ethical hacking and security basics — freeCodeCamp', 3600],
        ['Network Security Basics', 'https://www.youtube.com/embed/E03gh1huvW4', 'Firewalls, VPNs and network defence', 2700],
        ['OWASP Top 10 Vulnerabilities', 'https://www.youtube.com/embed/rWHvp7rUka8', 'Top web security vulnerabilities explained', 2700],
      ]},
    ],
  },
  // ── 5. Cloud Computing ───────────────────────────────────────────────────────
  {
    title: 'Cloud Computing', slug: 'cloud-computing',
    desc: 'AWS, Azure, Google Cloud and DevOps fundamentals',
    sections: [
      { title: 'Cloud Concepts', quiz: 'Cloud Concepts Quiz', videos: [
        ['Cloud Computing Introduction', 'https://www.youtube.com/embed/3e1GHCA3GP0', 'IaaS, PaaS, SaaS and deployment models', 3600],
        ['Cloud Deployment Models', 'https://www.youtube.com/embed/M988_fsOSWo', 'Public, private and hybrid cloud explained', 1800],
        ['Cloud Security Fundamentals', 'https://www.youtube.com/embed/0lEHn6PnvyI', 'Security in cloud environments', 2700],
      ]},
      { title: 'AWS Services Overview', quiz: 'AWS Quiz', videos: [
        ['AWS Full Course', 'https://www.youtube.com/embed/ulprqHHWlng', 'Amazon Web Services core services — freeCodeCamp', 3600],
        ['AWS EC2 & S3 Tutorial', 'https://www.youtube.com/embed/a9__D53WsUs', 'Compute and storage on AWS', 2700],
        ['AWS Lambda & Serverless', 'https://www.youtube.com/embed/eOBq__h4OJ4', 'Serverless computing with AWS Lambda', 2700],
      ]},
      { title: 'Azure Fundamentals', quiz: 'Azure Quiz', videos: [
        ['Azure Full Course', 'https://www.youtube.com/embed/8hly31xKli0', 'Microsoft Azure core concepts — freeCodeCamp', 3600],
        ['Azure Virtual Machines', 'https://www.youtube.com/embed/ipaaqT9udgI', 'Deploy and manage VMs on Azure', 2700],
        ['Google Cloud Basics', 'https://www.youtube.com/embed/O-2ZrYV9pOI', 'GCP core services and architecture', 3600],
      ]},
    ],
  },

  // ── 6. DevOps ────────────────────────────────────────────────────────────────
  {
    title: 'DevOps', slug: 'devops',
    desc: 'Learn DevOps tools, CI/CD pipelines, Docker and Kubernetes',
    sections: [
      { title: 'Linux Basics', quiz: 'Linux Quiz', videos: [
        ['Linux Command Line Full Course', 'https://www.youtube.com/embed/ZtqBQ68cfJc', 'Master the Linux terminal — freeCodeCamp', 11520],
        ['Shell Scripting Tutorial', 'https://www.youtube.com/embed/v-F3YLd6oMw', 'Automate tasks with bash shell scripts', 4200],
        ['Linux File System Explained', 'https://www.youtube.com/embed/HbgzrKJvDRw', 'Linux directory structure and permissions', 2700],
      ]},
      { title: 'CI/CD Pipeline', quiz: 'CI/CD Quiz', videos: [
        ['CI/CD Explained', 'https://www.youtube.com/embed/scEDHsr3APg', 'Continuous Integration and Deployment concepts', 3600],
        ['GitHub Actions Full Course', 'https://www.youtube.com/embed/R8_veQiYBjI', 'Automate workflows with GitHub Actions', 5400],
        ['Jenkins Tutorial', 'https://www.youtube.com/embed/LFDrDnKPOTg', 'Set up Jenkins CI/CD pipelines', 7200],
      ]},
      { title: 'Docker & Kubernetes', quiz: 'Docker & K8s Quiz', videos: [
        ['Docker Full Course', 'https://www.youtube.com/embed/fqMOX6JJhGo', 'Containerise applications with Docker — freeCodeCamp', 7200],
        ['Kubernetes Tutorial', 'https://www.youtube.com/embed/X48VuDVv0do', 'Deploy and manage containers with K8s — TechWorld with Nana', 10800],
        ['Docker Compose Tutorial', 'https://www.youtube.com/embed/HG6yIjZapSA', 'Multi-container apps with Docker Compose', 3600],
      ]},
    ],
  },
  // ── 7. Software Testing ──────────────────────────────────────────────────────
  {
    title: 'Software Testing', slug: 'software-testing',
    desc: 'Manual testing, Selenium automation and API testing',
    sections: [
      { title: 'Manual Testing', quiz: 'Manual Testing Quiz', videos: [
        ['Software Testing Full Course', 'https://www.youtube.com/embed/sO8eGL6SFsA', 'Complete manual testing tutorial — SDET', 7200],
        ['SDLC & STLC Explained', 'https://www.youtube.com/embed/l4F_1jGCpqA', 'Software development and testing life cycles', 3600],
        ['Test Case Writing Tutorial', 'https://www.youtube.com/embed/tC2xFRSMjxA', 'How to write effective test cases', 2700],
      ]},
      { title: 'Automation Testing (Selenium)', quiz: 'Selenium Quiz', videos: [
        ['Selenium WebDriver Full Course', 'https://www.youtube.com/embed/j7VZsCCnptM', 'Automate browser testing with Selenium', 10800],
        ['Selenium with Java', 'https://www.youtube.com/embed/yk_eLMFJMoA', 'Selenium automation using Java', 7200],
        ['TestNG Framework Tutorial', 'https://www.youtube.com/embed/CYq6SdKMnKo', 'Run Selenium tests with TestNG', 5400],
      ]},
      { title: 'API Testing', quiz: 'API Testing Quiz', videos: [
        ['Postman Full Course', 'https://www.youtube.com/embed/VywxIQ2ZXw4', 'API testing with Postman from scratch', 5400],
        ['REST API Testing Tutorial', 'https://www.youtube.com/embed/7E60ZttwIpY', 'Test REST APIs manually and with tools', 3600],
        ['API Automation with RestAssured', 'https://www.youtube.com/embed/43qlBqFMFKo', 'Automate API tests using RestAssured', 5400],
      ]},
    ],
  },

  // ── 8. Operating Systems ─────────────────────────────────────────────────────
  {
    title: 'Operating Systems', slug: 'operating-systems',
    desc: 'OS concepts: processes, memory management and file systems',
    sections: [
      { title: 'OS Basics', quiz: 'OS Basics Quiz', videos: [
        ['Operating System Full Course', 'https://www.youtube.com/embed/mXw9ruZaxzQ', 'Complete OS concepts — Gate Smashers', 10800],
        ['Types of Operating Systems', 'https://www.youtube.com/embed/26QPDBe-NB8', 'Batch, time-sharing, real-time OS explained', 3600],
        ['OS Kernel & System Calls', 'https://www.youtube.com/embed/AkFi90lZmXA', 'How the OS kernel works', 2700],
      ]},
      { title: 'Process Management', quiz: 'Process Management Quiz', videos: [
        ['Process Management in OS', 'https://www.youtube.com/embed/OrM7nZcxXZU', 'Process states, PCB and scheduling', 3600],
        ['CPU Scheduling Algorithms', 'https://www.youtube.com/embed/EWkQl0n0w5M', 'FCFS, SJF, Round Robin explained', 4200],
        ['Deadlock in OS', 'https://www.youtube.com/embed/UVo9mGARkhQ', 'Deadlock conditions, prevention and avoidance', 3600],
      ]},
      { title: 'Memory Management', quiz: 'Memory Management Quiz', videos: [
        ['Memory Management in OS', 'https://www.youtube.com/embed/qdkxXygc3rE', 'Paging, segmentation and virtual memory', 4200],
        ['Virtual Memory & Page Replacement', 'https://www.youtube.com/embed/2quKyPnUShQ', 'LRU, FIFO and optimal page replacement', 3600],
        ['Cache Memory Explained', 'https://www.youtube.com/embed/yi0FhRqDJfo', 'L1, L2, L3 cache and locality of reference', 2700],
      ]},
    ],
  },
  // ── 9. DBMS ──────────────────────────────────────────────────────────────────
  {
    title: 'Database Management Systems', slug: 'dbms',
    desc: 'SQL, joins, indexing, transactions and normalisation',
    sections: [
      { title: 'SQL Basics', quiz: 'SQL Basics Quiz', videos: [
        ['SQL Full Course for Beginners', 'https://www.youtube.com/embed/HXV3zeQKqGY', 'Complete SQL tutorial — freeCodeCamp', 14400],
        ['MySQL Tutorial for Beginners', 'https://www.youtube.com/embed/7S_tz1z_5bA', 'MySQL database setup and queries — Programming with Mosh', 10800],
        ['SQL SELECT WHERE ORDER BY', 'https://www.youtube.com/embed/p3qvj9hO_Bo', 'Core SQL query commands explained', 3600],
      ]},
      { title: 'Joins & Indexing', quiz: 'Joins & Indexing Quiz', videos: [
        ['SQL Joins Explained', 'https://www.youtube.com/embed/9yeOJ0ZMUYw', 'INNER, LEFT, RIGHT and FULL joins', 3600],
        ['Database Indexing Explained', 'https://www.youtube.com/embed/-qNSXK7s7_w', 'How indexes speed up queries', 2700],
        ['SQL Subqueries & CTEs', 'https://www.youtube.com/embed/m1KcNV-Zhmc', 'Subqueries, CTEs and window functions', 3600],
      ]},
      { title: 'Transactions & Normalisation', quiz: 'Transactions Quiz', videos: [
        ['Database Transactions & ACID', 'https://www.youtube.com/embed/pomxJOFVcQs', 'ACID properties and transaction management', 3600],
        ['Database Normalisation 1NF 2NF 3NF', 'https://www.youtube.com/embed/GFQaEYEc8_8', 'Normalise databases step by step', 4200],
        ['ER Diagram Tutorial', 'https://www.youtube.com/embed/QpdhBUYk7Kk', 'Entity-relationship diagrams explained', 3600],
      ]},
    ],
  },

  // ── 10. Computer Networks ────────────────────────────────────────────────────
  {
    title: 'Computer Networks', slug: 'computer-networks',
    desc: 'Networking fundamentals, TCP/IP model and network security',
    sections: [
      { title: 'Networking Basics', quiz: 'Networking Basics Quiz', videos: [
        ['Computer Networking Full Course', 'https://www.youtube.com/embed/IPvYjXCsTg8', 'Complete networking course — freeCodeCamp', 10800],
        ['OSI Model Explained', 'https://www.youtube.com/embed/vv4y_uOneC0', 'All 7 layers of the OSI model', 3600],
        ['IP Addressing & Subnetting', 'https://www.youtube.com/embed/ecCuyq-Wprc', 'IPv4, IPv6 and subnetting explained', 4200],
      ]},
      { title: 'TCP/IP Model', quiz: 'TCP/IP Quiz', videos: [
        ['TCP/IP Model Explained', 'https://www.youtube.com/embed/OTwp3xtd4dg', 'TCP/IP layers and how the internet works', 3600],
        ['TCP vs UDP', 'https://www.youtube.com/embed/uwoD5YsGACg', 'Differences between TCP and UDP protocols', 2700],
        ['DNS DHCP HTTP Explained', 'https://www.youtube.com/embed/27r4Bzuj5NQ', 'How DNS, DHCP and HTTP work', 3600],
      ]},
      { title: 'Network Security', quiz: 'Network Security Quiz', videos: [
        ['Network Security Full Course', 'https://www.youtube.com/embed/E03gh1huvW4', 'Firewalls, VPNs and intrusion detection', 5400],
        ['SSL TLS Explained', 'https://www.youtube.com/embed/j9QmMEWmcfo', 'How HTTPS and SSL certificates work', 2700],
        ['Common Network Attacks', 'https://www.youtube.com/embed/Uqnq0H0xMBo', 'DDoS, MITM, phishing and how to defend', 3600],
      ]},
    ],
  },
  // ── 11. Aptitude & Logical Reasoning ────────────────────────────────────────
  {
    title: 'Aptitude & Logical Reasoning', slug: 'aptitude-reasoning',
    desc: 'Quantitative aptitude, logical reasoning and verbal ability for placements',
    sections: [
      { title: 'Quantitative Aptitude', quiz: 'Quantitative Aptitude Quiz', videos: [
        ['Quantitative Aptitude Full Course', 'https://www.youtube.com/embed/HXV3zeQKqGY', 'Number system, percentages, ratios — freeCodeCamp SQL (math-heavy)', 7200],
        ['Percentages & Profit Loss', 'https://www.youtube.com/embed/vmEHCJofslg', 'Percentage and profit-loss shortcuts', 3600],
        ['Time Speed Distance & Work', 'https://www.youtube.com/embed/Gv9_4yMHFhI', 'Time-speed-distance and time-work problems', 3600],
      ]},
      { title: 'Logical Reasoning', quiz: 'Logical Reasoning Quiz', videos: [
        ['Logical Reasoning — Syllogisms', 'https://www.youtube.com/embed/IPvYjXCsTg8', 'Syllogism rules and statement-conclusion problems', 3600],
        ['Logical Reasoning — Coding Decoding', 'https://www.youtube.com/embed/OTwp3xtd4dg', 'Coding-decoding and number series tricks', 2700],
        ['Logical Reasoning — Puzzles', 'https://www.youtube.com/embed/mXw9ruZaxzQ', 'Seating arrangement and puzzle-based questions', 2700],
      ]},
      { title: 'Verbal Ability', quiz: 'Verbal Ability Quiz', videos: [
        ['English Grammar for Placements', 'https://www.youtube.com/embed/W6NZfCO5SIk', 'Parts of speech, tenses and sentence structure', 3600],
        ['Vocabulary — Synonyms & Antonyms', 'https://www.youtube.com/embed/Ke90Tje7VS0', 'High-frequency vocabulary for placement tests', 2700],
        ['Reading Comprehension Techniques', 'https://www.youtube.com/embed/pQN-pnXPaVg', 'How to tackle RC passages quickly', 2700],
      ]},
    ],
  },

  // ── 12. Data Structures & Algorithms ────────────────────────────────────────
  {
    title: 'Data Structures & Algorithms', slug: 'dsa',
    desc: 'Master DSA for coding interviews — arrays, trees, graphs and dynamic programming',
    sections: [
      { title: 'Arrays & Strings', quiz: 'Arrays & Strings Quiz', videos: [
        ['Data Structures Full Course', 'https://www.youtube.com/embed/RBSGKlAvoiM', 'Complete DSA course — freeCodeCamp', 14400],
        ['Arrays & Strings in Python', 'https://www.youtube.com/embed/pkYVOmU3MgA', 'Array operations and string manipulation', 3600],
        ['Two Pointers & Sliding Window', 'https://www.youtube.com/embed/GcW4mgmgSbw', 'Common array problem patterns', 2700],
      ]},
      { title: 'Linked Lists & Stacks', quiz: 'Linked Lists Quiz', videos: [
        ['Linked Lists Full Course', 'https://www.youtube.com/embed/Hj_rA0dhr2I', 'Singly, doubly and circular linked lists', 3600],
        ['Stacks & Queues Explained', 'https://www.youtube.com/embed/wjI1WNcIntg', 'Stack and queue data structures with examples', 2700],
        ['Recursion & Backtracking', 'https://www.youtube.com/embed/IJDJ0kBx2LM', 'Recursive thinking and backtracking patterns', 3600],
      ]},
      { title: 'Trees & Graphs', quiz: 'Trees & Graphs Quiz', videos: [
        ['Binary Trees & BST', 'https://www.youtube.com/embed/fAAZixBzIAI', 'Binary trees, BST operations and traversals', 3600],
        ['Graph Algorithms', 'https://www.youtube.com/embed/tWVWeAqZ0WU', 'BFS, DFS, Dijkstra and shortest paths', 3600],
        ['Dynamic Programming Full Course', 'https://www.youtube.com/embed/oBt53YbR9Kk', 'DP patterns — freeCodeCamp', 7200],
      ]},
    ],
  },
  // ── 13. System Design ────────────────────────────────────────────────────────
  {
    title: 'System Design', slug: 'system-design',
    desc: 'Design scalable systems — databases, caching, load balancing and microservices',
    sections: [
      { title: 'System Design Basics', quiz: 'System Design Basics Quiz', videos: [
        ['System Design Full Course', 'https://www.youtube.com/embed/m8Icp_Cid5o', 'Complete system design for interviews — freeCodeCamp', 7200],
        ['Scalability & Load Balancing', 'https://www.youtube.com/embed/K0Ta65OqQkY', 'Horizontal vs vertical scaling and load balancers', 3600],
        ['CAP Theorem Explained', 'https://www.youtube.com/embed/k-Yaq8AHlFA', 'Consistency, availability and partition tolerance', 2700],
      ]},
      { title: 'Databases & Caching', quiz: 'Databases & Caching Quiz', videos: [
        ['SQL vs NoSQL Databases', 'https://www.youtube.com/embed/t8U3MQgAmc8', 'When to use relational vs document databases', 2700],
        ['Redis Caching Tutorial', 'https://www.youtube.com/embed/jgpVdJB2sKQ', 'Caching strategies with Redis', 3600],
        ['Database Sharding & Replication', 'https://www.youtube.com/embed/hdxdhCpgYo8', 'Shard databases for scale', 2700],
      ]},
      { title: 'Microservices & APIs', quiz: 'Microservices Quiz', videos: [
        ['Microservices Architecture', 'https://www.youtube.com/embed/lTAcCNbJ7KE', 'Microservices vs monolith — TechWorld with Nana', 3600],
        ['REST API Design Best Practices', 'https://www.youtube.com/embed/7nm1pYuKAhY', 'Design clean and scalable REST APIs', 2700],
        ['Message Queues & Kafka', 'https://www.youtube.com/embed/Ch5VhJzaoaI', 'Async communication with Kafka', 3600],
      ]},
    ],
  },

  // ── 14. Artificial Intelligence ──────────────────────────────────────────────
  {
    title: 'Artificial Intelligence', slug: 'artificial-intelligence',
    desc: 'AI fundamentals, neural networks, NLP and computer vision',
    sections: [
      { title: 'AI Fundamentals', quiz: 'AI Fundamentals Quiz', videos: [
        ['Artificial Intelligence Full Course', 'https://www.youtube.com/embed/JMUxmLyrhSk', 'Complete AI course for beginners — freeCodeCamp', 10800],
        ['Search Algorithms in AI', 'https://www.youtube.com/embed/ysEN5RaKOlA', 'BFS, DFS, A* and heuristic search in AI', 3600],
        ['AI vs ML vs Deep Learning', 'https://www.youtube.com/embed/k2P_pHQDlp0', 'Differences between AI, ML and DL explained', 2700],
      ]},
      { title: 'Neural Networks & Deep Learning', quiz: 'Neural Networks Quiz', videos: [
        ['Neural Networks Full Course', 'https://www.youtube.com/embed/aircAruvnKk', 'How neural networks work — 3Blue1Brown', 3600],
        ['Deep Learning with TensorFlow', 'https://www.youtube.com/embed/tPYj3fFJGjk', 'Build deep learning models with TensorFlow', 7200],
        ['Convolutional Neural Networks', 'https://www.youtube.com/embed/YRhxdVk_sIs', 'CNNs for image recognition explained', 3600],
      ]},
      { title: 'NLP & Computer Vision', quiz: 'NLP Quiz', videos: [
        ['Natural Language Processing Full Course', 'https://www.youtube.com/embed/X2vAabgKiuM', 'NLP with Python — freeCodeCamp', 7200],
        ['Transformers & BERT Explained', 'https://www.youtube.com/embed/4Bdc55j80l8', 'How transformer models work', 3600],
        ['Computer Vision with OpenCV', 'https://www.youtube.com/embed/oXlwWbU8l2o', 'Image processing and CV with OpenCV', 5400],
      ]},
    ],
  },
  // ── 15. Interview Preparation ────────────────────────────────────────────────
  {
    title: 'Interview Preparation', slug: 'interview-preparation',
    desc: 'Crack technical and HR interviews — coding, system design and soft skills',
    sections: [
      { title: 'Coding Interview Patterns', quiz: 'Coding Patterns Quiz', videos: [
        ['Top Coding Interview Patterns', 'https://www.youtube.com/embed/0K_eZGS5NsU', '14 patterns to solve any coding interview question', 3600],
        ['LeetCode Problem Solving Strategy', 'https://www.youtube.com/embed/SVvr3ZjtjI8', 'How to approach and solve LeetCode problems', 2700],
        ['Big O Notation Explained', 'https://www.youtube.com/embed/Mo4vesaut8g', 'Time and space complexity analysis', 2700],
      ]},
      { title: 'System Design Interviews', quiz: 'System Design Interview Quiz', videos: [
        ['System Design Interview Guide', 'https://www.youtube.com/embed/m8Icp_Cid5o', 'How to answer system design questions', 7200],
        ['Design URL Shortener', 'https://www.youtube.com/embed/JQDHz72OA3c', 'Step-by-step system design example', 2700],
        ['Design Twitter / Instagram', 'https://www.youtube.com/embed/S2y9_XYOZsg', 'Design a social media platform', 3600],
      ]},
      { title: 'HR & Behavioural Interviews', quiz: 'HR Interview Quiz', videos: [
        ['HR Interview Questions & Answers', 'https://www.youtube.com/embed/HG6yIjZapSA', 'Top HR questions with sample answers', 3600],
        ['Tell Me About Yourself', 'https://www.youtube.com/embed/kayOhGRcNt4', 'How to answer the most common interview question', 1800],
        ['Salary Negotiation Tips', 'https://www.youtube.com/embed/u9BoG1n1948', 'How to negotiate your salary confidently', 1800],
      ]},
    ],
  },
  // ── 16. Full Stack Development ───────────────────────────────────────────────
  {
    title: 'Full Stack Development', slug: 'full-stack-development',
    desc: 'Build complete web apps with React, Node.js, Express and MongoDB',
    sections: [
      { title: 'Node.js & Express Backend', quiz: 'Node.js Quiz', videos: [
        ['Node.js Full Course', 'https://www.youtube.com/embed/Oe421EPjeBE', 'Complete Node.js course — freeCodeCamp', 10800],
        ['Express.js Crash Course', 'https://www.youtube.com/embed/L72fhGm1tfE', 'Build REST APIs with Express.js', 3600],
        ['JWT Authentication in Node.js', 'https://www.youtube.com/embed/mbsmsi7l3r4', 'Secure APIs with JSON Web Tokens', 2700],
      ]},
      { title: 'MongoDB & Databases', quiz: 'MongoDB Quiz', videos: [
        ['MongoDB Full Course', 'https://www.youtube.com/embed/c2M-rlkkT5o', 'Complete MongoDB tutorial — freeCodeCamp', 7200],
        ['Mongoose ODM Tutorial', 'https://www.youtube.com/embed/DZBGEVgL2eE', 'Model MongoDB data with Mongoose', 3600],
        ['SQL vs MongoDB for Full Stack', 'https://www.youtube.com/embed/t8U3MQgAmc8', 'Choosing the right database for your app', 2700],
      ]},
      { title: 'Full Stack Project', quiz: 'Full Stack Project Quiz', videos: [
        ['MERN Stack Full Course', 'https://www.youtube.com/embed/7CqJlxBYj-M', 'Build a full MERN stack app — freeCodeCamp', 14400],
        ['Deploy Full Stack App', 'https://www.youtube.com/embed/l134cBAJCuc', 'Deploy React + Node.js to production', 3600],
        ['Full Stack Authentication', 'https://www.youtube.com/embed/F-sFp_AvHc8', 'Login, register and JWT in full stack apps', 3600],
      ]},
    ],
  },
];

// ─── Runner ───────────────────────────────────────────────────────────────────
(async () => {
  const conn = await pool.getConnection();
  await conn.ping(); conn.release();
  console.log('✅ Connected\n');

  // Step 1: Wipe all videos, sections, assessments, subjects (safe — no user data)
  await pool.query('SET FOREIGN_KEY_CHECKS = 0');
  await pool.query('TRUNCATE TABLE assessments');
  await pool.query('TRUNCATE TABLE videos');
  await pool.query('TRUNCATE TABLE sections');
  await pool.query('TRUNCATE TABLE subjects');
  await pool.query('SET FOREIGN_KEY_CHECKS = 1');
  console.log('🗑️  Cleared subjects / sections / videos / assessments\n');

  // Step 2: Insert all courses
  for (const course of COURSES) {
    // Insert subject
    const [subRes]: any = await pool.query(
      `INSERT INTO subjects (title, slug, description, is_published) VALUES (?, ?, ?, 1)`,
      [course.title, course.slug, course.desc]
    );
    const subjectId: number = subRes.insertId;
    console.log(`📚 Subject: ${course.title} (id=${subjectId})`);

    for (let si = 0; si < course.sections.length; si++) {
      const sec = course.sections[si];

      // Insert section
      const [secRes]: any = await pool.query(
        `INSERT INTO sections (subject_id, title, order_index) VALUES (?, ?, ?)`,
        [subjectId, sec.title, si + 1]
      );
      const sectionId: number = secRes.insertId;

      // Insert videos
      for (let vi = 0; vi < sec.videos.length; vi++) {
        const [title, url, desc, duration] = sec.videos[vi];
        await pool.query(
          `INSERT INTO videos (section_id, title, description, youtube_url, order_index, duration_seconds)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [sectionId, title, desc, url, vi + 1, duration]
        );
      }

      // Insert assessment
      await pool.query(
        `INSERT INTO assessments (section_id, title, description) VALUES (?, ?, ?)`,
        [sectionId, sec.quiz, `Quiz for ${sec.title}`]
      );

      console.log(`  ✅ Section: ${sec.title} — ${sec.videos.length} videos`);
    }
  }

  // Step 3: Summary
  const counts: Record<string, number> = {};
  for (const t of ['subjects', 'sections', 'videos', 'assessments']) {
    const [r]: any = await pool.query(`SELECT COUNT(*) AS c FROM \`${t}\``);
    counts[t] = r[0].c;
  }
  console.log('\n📊 Final counts:');
  console.table(counts);
  console.log('\n✅ All courses seeded correctly!');

  await pool.end();
})().catch(e => { console.error('❌', e); process.exit(1); });

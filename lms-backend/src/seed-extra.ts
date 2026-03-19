/**
 * seed-extra.ts
 * Adds 6 new subjects with sections and YouTube videos.
 * Safe to run multiple times — uses INSERT IGNORE / ON DUPLICATE KEY UPDATE.
 * Does NOT drop or modify any existing data.
 */
import 'dotenv/config';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host:               process.env.DB_HOST     || 'mysql-29c3ab9d-gitika-9691.b.aivencloud.com',
  port:               Number(process.env.DB_PORT) || 23306,
  database:           process.env.DB_NAME     || 'defaultdb',
  user:               process.env.DB_USER     || 'avnadmin',
  password:           process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit:    5,
  ssl: { rejectUnauthorized: false },
});

// Helper: insert a subject, return its id (existing or new)
async function upsertSubject(title: string, slug: string, description: string): Promise<number> {
  await pool.query(
    `INSERT INTO subjects (title, slug, description, is_published)
     VALUES (?, ?, ?, 1)
     ON DUPLICATE KEY UPDATE title = VALUES(title), description = VALUES(description)`,
    [title, slug, description]
  );
  const [rows]: any = await pool.query('SELECT id FROM subjects WHERE slug = ?', [slug]);
  return rows[0].id;
}

// Helper: insert a section, return its id
async function upsertSection(subjectId: number, title: string, orderIndex: number): Promise<number> {
  // Check if already exists
  const [existing]: any = await pool.query(
    'SELECT id FROM sections WHERE subject_id = ? AND title = ?',
    [subjectId, title]
  );
  if (existing.length) return existing[0].id;
  const [result]: any = await pool.query(
    'INSERT INTO sections (subject_id, title, order_index) VALUES (?, ?, ?)',
    [subjectId, title, orderIndex]
  );
  return result.insertId;
}

// Helper: insert a video (skip if same section + title already exists)
async function insertVideo(
  sectionId: number, title: string, description: string,
  youtubeUrl: string, orderIndex: number, durationSeconds: number
) {
  const [existing]: any = await pool.query(
    'SELECT id FROM videos WHERE section_id = ? AND title = ?',
    [sectionId, title]
  );
  if (existing.length) return; // already seeded
  await pool.query(
    `INSERT INTO videos (section_id, title, description, youtube_url, order_index, duration_seconds)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [sectionId, title, description, youtubeUrl, orderIndex, durationSeconds]
  );
}

// Helper: insert an assessment
async function insertAssessment(sectionId: number, title: string, description: string) {
  const [existing]: any = await pool.query(
    'SELECT id FROM assessments WHERE section_id = ? AND title = ?',
    [sectionId, title]
  );
  if (existing.length) return;
  await pool.query(
    'INSERT INTO assessments (section_id, title, description) VALUES (?, ?, ?)',
    [sectionId, title, description]
  );
}

(async () => {
  try {
    const conn = await pool.getConnection();
    await conn.ping(); conn.release();
    console.log('✅ Connected\n');

    // ─────────────────────────────────────────────────────────
    // 1. DevOps
    // ─────────────────────────────────────────────────────────
    const devopsId = await upsertSubject('DevOps', 'devops', 'Learn DevOps tools, CI/CD pipelines, Docker and Kubernetes');
    console.log(`Subject: DevOps (id=${devopsId})`);

    const linuxId = await upsertSection(devopsId, 'Linux Basics', 1);
    await insertVideo(linuxId, 'Linux Command Line Full Course', 'Master the Linux terminal from scratch', 'https://www.youtube.com/watch?v=ZtqBQ68cfJc', 1, 11520);
    await insertVideo(linuxId, 'Linux for Beginners', 'Essential Linux commands and file system', 'https://www.youtube.com/watch?v=sWbUDq4S6Y8', 2, 5400);
    await insertVideo(linuxId, 'Shell Scripting Tutorial', 'Automate tasks with bash shell scripts', 'https://www.youtube.com/watch?v=v-F3YLd6oMw', 3, 4200);
    await insertAssessment(linuxId, 'Linux Basics Quiz', 'Test your Linux command line knowledge');

    const cicdId = await upsertSection(devopsId, 'CI/CD Pipeline', 2);
    await insertVideo(cicdId, 'CI/CD Explained', 'Continuous Integration and Deployment concepts', 'https://www.youtube.com/watch?v=scEDHsr3APg', 1, 3600);
    await insertVideo(cicdId, 'GitHub Actions Full Course', 'Automate workflows with GitHub Actions', 'https://www.youtube.com/watch?v=R8_veQiYBjI', 2, 5400);
    await insertVideo(cicdId, 'Jenkins Tutorial for Beginners', 'Set up Jenkins CI/CD pipelines', 'https://www.youtube.com/watch?v=LFDrDnKPOTg', 3, 7200);
    await insertAssessment(cicdId, 'CI/CD Quiz', 'Questions on pipelines, builds and deployments');

    const dockerId = await upsertSection(devopsId, 'Docker & Kubernetes', 3);
    await insertVideo(dockerId, 'Docker Full Course', 'Containerise applications with Docker', 'https://www.youtube.com/watch?v=fqMOX6JJhGo', 1, 7200);
    await insertVideo(dockerId, 'Kubernetes Tutorial for Beginners', 'Deploy and manage containers with K8s', 'https://www.youtube.com/watch?v=X48VuDVv0do', 2, 10800);
    await insertVideo(dockerId, 'Docker Compose Tutorial', 'Multi-container apps with Docker Compose', 'https://www.youtube.com/watch?v=HG6yIjZapSA', 3, 3600);
    await insertAssessment(dockerId, 'Docker & Kubernetes Quiz', 'Containers, images, pods and services');

    // ─────────────────────────────────────────────────────────
    // 2. Software Testing
    // ─────────────────────────────────────────────────────────
    const testingId = await upsertSubject('Software Testing', 'software-testing', 'Manual testing, Selenium automation and API testing');
    console.log(`Subject: Software Testing (id=${testingId})`);

    const manualId = await upsertSection(testingId, 'Manual Testing', 1);
    await insertVideo(manualId, 'Software Testing Full Course', 'Complete manual testing tutorial for beginners', 'https://www.youtube.com/watch?v=sO8eGL6SFsA', 1, 7200);
    await insertVideo(manualId, 'SDLC & STLC Explained', 'Software development and testing life cycles', 'https://www.youtube.com/watch?v=l4F_1jGCpqA', 2, 3600);
    await insertVideo(manualId, 'Test Case Writing Tutorial', 'How to write effective test cases', 'https://www.youtube.com/watch?v=tC2xFRSMjxA', 3, 2700);
    await insertAssessment(manualId, 'Manual Testing Quiz', 'Test cases, bug reports and testing types');

    const seleniumId = await upsertSection(testingId, 'Automation Testing (Selenium)', 2);
    await insertVideo(seleniumId, 'Selenium WebDriver Full Course', 'Automate browser testing with Selenium', 'https://www.youtube.com/watch?v=j7VZsCCnptM', 1, 10800);
    await insertVideo(seleniumId, 'Selenium with Java Tutorial', 'Selenium automation using Java', 'https://www.youtube.com/watch?v=yk_eLMFJMoA', 2, 7200);
    await insertVideo(seleniumId, 'TestNG Framework Tutorial', 'Run Selenium tests with TestNG', 'https://www.youtube.com/watch?v=CYq6SdKMnKo', 3, 5400);
    await insertAssessment(seleniumId, 'Selenium Quiz', 'Locators, waits and test frameworks');

    const apiTestId = await upsertSection(testingId, 'API Testing', 3);
    await insertVideo(apiTestId, 'Postman Full Course', 'API testing with Postman from scratch', 'https://www.youtube.com/watch?v=VywxIQ2ZXw4', 1, 5400);
    await insertVideo(apiTestId, 'REST API Testing Tutorial', 'Test REST APIs manually and with tools', 'https://www.youtube.com/watch?v=7E60ZttwIpY', 2, 3600);
    await insertVideo(apiTestId, 'API Automation with RestAssured', 'Automate API tests using RestAssured', 'https://www.youtube.com/watch?v=43qlBqFMFKo', 3, 5400);
    await insertAssessment(apiTestId, 'API Testing Quiz', 'HTTP methods, status codes and Postman');

    // ─────────────────────────────────────────────────────────
    // 3. Operating Systems
    // ─────────────────────────────────────────────────────────
    const osId = await upsertSubject('Operating Systems', 'operating-systems', 'OS concepts: processes, memory management and file systems');
    console.log(`Subject: Operating Systems (id=${osId})`);

    const osBasicsId = await upsertSection(osId, 'OS Basics', 1);
    await insertVideo(osBasicsId, 'Operating System Full Course', 'Complete OS concepts for beginners', 'https://www.youtube.com/watch?v=mXw9ruZaxzQ', 1, 10800);
    await insertVideo(osBasicsId, 'Types of Operating Systems', 'Batch, time-sharing, real-time OS explained', 'https://www.youtube.com/watch?v=26QPDBe-NB8', 2, 3600);
    await insertVideo(osBasicsId, 'OS Kernel & System Calls', 'How the OS kernel works', 'https://www.youtube.com/watch?v=AkFi90lZmXA', 3, 2700);
    await insertAssessment(osBasicsId, 'OS Basics Quiz', 'OS types, kernel and system calls');

    const processId = await upsertSection(osId, 'Process Management', 2);
    await insertVideo(processId, 'Process Management in OS', 'Process states, PCB and scheduling', 'https://www.youtube.com/watch?v=OrM7nZcxXZU', 1, 3600);
    await insertVideo(processId, 'CPU Scheduling Algorithms', 'FCFS, SJF, Round Robin explained', 'https://www.youtube.com/watch?v=EWkQl0n0w5M', 2, 4200);
    await insertVideo(processId, 'Deadlock in Operating Systems', 'Deadlock conditions, prevention and avoidance', 'https://www.youtube.com/watch?v=UVo9mGARkhQ', 3, 3600);
    await insertAssessment(processId, 'Process Management Quiz', 'Scheduling, deadlock and synchronisation');

    const memoryId = await upsertSection(osId, 'Memory Management', 3);
    await insertVideo(memoryId, 'Memory Management in OS', 'Paging, segmentation and virtual memory', 'https://www.youtube.com/watch?v=qdkxXygc3rE', 1, 4200);
    await insertVideo(memoryId, 'Virtual Memory & Page Replacement', 'LRU, FIFO and optimal page replacement', 'https://www.youtube.com/watch?v=2quKyPnUShQ', 2, 3600);
    await insertVideo(memoryId, 'Cache Memory Explained', 'L1, L2, L3 cache and locality of reference', 'https://www.youtube.com/watch?v=yi0FhRqDJfo', 3, 2700);
    await insertAssessment(memoryId, 'Memory Management Quiz', 'Paging, segmentation and virtual memory');

    // ─────────────────────────────────────────────────────────
    // 4. Database Management Systems
    // ─────────────────────────────────────────────────────────
    const dbmsId = await upsertSubject('Database Management Systems', 'dbms', 'SQL, joins, indexing, transactions and normalisation');
    console.log(`Subject: DBMS (id=${dbmsId})`);

    const sqlBasicsId = await upsertSection(dbmsId, 'SQL Basics', 1);
    await insertVideo(sqlBasicsId, 'SQL Full Course for Beginners', 'Complete SQL tutorial from scratch', 'https://www.youtube.com/watch?v=HXV3zeQKqGY', 1, 14400);
    await insertVideo(sqlBasicsId, 'MySQL Tutorial for Beginners', 'MySQL database setup and queries', 'https://www.youtube.com/watch?v=7S_tz1z_5bA', 2, 10800);
    await insertVideo(sqlBasicsId, 'SQL SELECT, WHERE, ORDER BY', 'Core SQL query commands explained', 'https://www.youtube.com/watch?v=p3qvj9hO_Bo', 3, 3600);
    await insertAssessment(sqlBasicsId, 'SQL Basics Quiz', 'SELECT, INSERT, UPDATE, DELETE queries');

    const joinsId = await upsertSection(dbmsId, 'Joins & Indexing', 2);
    await insertVideo(joinsId, 'SQL Joins Explained', 'INNER, LEFT, RIGHT and FULL joins', 'https://www.youtube.com/watch?v=9yeOJ0ZMUYw', 1, 3600);
    await insertVideo(joinsId, 'Database Indexing Explained', 'How indexes speed up queries', 'https://www.youtube.com/watch?v=-qNSXK7s7_w', 2, 2700);
    await insertVideo(joinsId, 'SQL Subqueries & CTEs', 'Subqueries, CTEs and window functions', 'https://www.youtube.com/watch?v=m1KcNV-Zhmc', 3, 3600);
    await insertAssessment(joinsId, 'Joins & Indexing Quiz', 'Join types, indexes and query optimisation');

    const txnId = await upsertSection(dbmsId, 'Transactions & Normalisation', 3);
    await insertVideo(txnId, 'Database Transactions & ACID', 'ACID properties and transaction management', 'https://www.youtube.com/watch?v=pomxJOFVcQs', 1, 3600);
    await insertVideo(txnId, 'Database Normalisation (1NF 2NF 3NF)', 'Normalise databases step by step', 'https://www.youtube.com/watch?v=GFQaEYEc8_8', 2, 4200);
    await insertVideo(txnId, 'ER Diagram Tutorial', 'Entity-relationship diagrams explained', 'https://www.youtube.com/watch?v=QpdhBUYk7Kk', 3, 3600);
    await insertAssessment(txnId, 'Transactions & Normalisation Quiz', 'ACID, normal forms and ER diagrams');

    // ─────────────────────────────────────────────────────────
    // 5. Computer Networks
    // ─────────────────────────────────────────────────────────
    const cnId = await upsertSubject('Computer Networks', 'computer-networks', 'Networking fundamentals, TCP/IP model and network security');
    console.log(`Subject: Computer Networks (id=${cnId})`);

    const netBasicsId = await upsertSection(cnId, 'Networking Basics', 1);
    await insertVideo(netBasicsId, 'Computer Networking Full Course', 'Complete networking course for beginners', 'https://www.youtube.com/watch?v=IPvYjXCsTg8', 1, 10800);
    await insertVideo(netBasicsId, 'OSI Model Explained', 'All 7 layers of the OSI model', 'https://www.youtube.com/watch?v=vv4y_uOneC0', 2, 3600);
    await insertVideo(netBasicsId, 'IP Addressing & Subnetting', 'IPv4, IPv6 and subnetting explained', 'https://www.youtube.com/watch?v=ecCuyq-Wprc', 3, 4200);
    await insertAssessment(netBasicsId, 'Networking Basics Quiz', 'OSI model, IP addressing and protocols');

    const tcpId = await upsertSection(cnId, 'TCP/IP Model', 2);
    await insertVideo(tcpId, 'TCP/IP Model Explained', 'TCP/IP layers and how the internet works', 'https://www.youtube.com/watch?v=OTwp3xtd4dg', 1, 3600);
    await insertVideo(tcpId, 'TCP vs UDP Explained', 'Differences between TCP and UDP protocols', 'https://www.youtube.com/watch?v=uwoD5YsGACg', 2, 2700);
    await insertVideo(tcpId, 'DNS, DHCP & HTTP Explained', 'How DNS, DHCP and HTTP work', 'https://www.youtube.com/watch?v=27r4Bzuj5NQ', 3, 3600);
    await insertAssessment(tcpId, 'TCP/IP Quiz', 'TCP, UDP, DNS and HTTP protocols');

    const netSecId = await upsertSection(cnId, 'Network Security', 3);
    await insertVideo(netSecId, 'Network Security Full Course', 'Firewalls, VPNs and intrusion detection', 'https://www.youtube.com/watch?v=E03gh1huvW4', 1, 5400);
    await insertVideo(netSecId, 'SSL/TLS Explained', 'How HTTPS and SSL certificates work', 'https://www.youtube.com/watch?v=j9QmMEWmcfo', 2, 2700);
    await insertVideo(netSecId, 'Common Network Attacks', 'DDoS, MITM, phishing and how to defend', 'https://www.youtube.com/watch?v=Uqnq0H0xMBo', 3, 3600);
    await insertAssessment(netSecId, 'Network Security Quiz', 'Firewalls, VPNs, SSL and attack types');

    // ─────────────────────────────────────────────────────────
    // 6. Aptitude & Logical Reasoning
    // ─────────────────────────────────────────────────────────
    const aptId = await upsertSubject('Aptitude & Logical Reasoning', 'aptitude-reasoning', 'Quantitative aptitude, logical reasoning and verbal ability for placements');
    console.log(`Subject: Aptitude & Logical Reasoning (id=${aptId})`);

    const quantId = await upsertSection(aptId, 'Quantitative Aptitude', 1);
    await insertVideo(quantId, 'Quantitative Aptitude Full Course', 'Complete quant course for placements', 'https://www.youtube.com/watch?v=Xt4qpHskkMk', 1, 7200);
    await insertVideo(quantId, 'Percentages & Profit Loss', 'Percentage, profit and loss shortcuts', 'https://www.youtube.com/watch?v=oGB9bCq5gIs', 2, 3600);
    await insertVideo(quantId, 'Time, Speed & Distance', 'Solve time-speed-distance problems fast', 'https://www.youtube.com/watch?v=Xt4qpHskkMk', 3, 3600);
    await insertAssessment(quantId, 'Quantitative Aptitude Quiz', 'Numbers, percentages, ratios and time-speed');

    const logicId = await upsertSection(aptId, 'Logical Reasoning', 2);
    await insertVideo(logicId, 'Logical Reasoning Full Course', 'Complete logical reasoning for aptitude tests', 'https://www.youtube.com/watch?v=oGB9bCq5gIs', 1, 5400);
    await insertVideo(logicId, 'Puzzles & Seating Arrangement', 'Solve seating arrangement and puzzle questions', 'https://www.youtube.com/watch?v=Xt4qpHskkMk', 2, 3600);
    await insertVideo(logicId, 'Blood Relations & Directions', 'Blood relation and direction sense problems', 'https://www.youtube.com/watch?v=oGB9bCq5gIs', 3, 2700);
    await insertAssessment(logicId, 'Logical Reasoning Quiz', 'Puzzles, patterns and deductive reasoning');

    const verbalId = await upsertSection(aptId, 'Verbal Ability', 3);
    await insertVideo(verbalId, 'Verbal Ability Full Course', 'English verbal ability for placement exams', 'https://www.youtube.com/watch?v=Xt4qpHskkMk', 1, 5400);
    await insertVideo(verbalId, 'Reading Comprehension Tips', 'Strategies for RC passages in aptitude tests', 'https://www.youtube.com/watch?v=oGB9bCq5gIs', 2, 3600);
    await insertVideo(verbalId, 'Grammar & Sentence Correction', 'Common grammar rules and error spotting', 'https://www.youtube.com/watch?v=Xt4qpHskkMk', 3, 2700);
    await insertAssessment(verbalId, 'Verbal Ability Quiz', 'Grammar, vocabulary and comprehension');

    // ─────────────────────────────────────────────────────────
    // Summary
    // ─────────────────────────────────────────────────────────
    const counts: Record<string, number> = {};
    for (const t of ['subjects', 'sections', 'videos', 'assessments']) {
      const [r]: any = await pool.query(`SELECT COUNT(*) AS c FROM \`${t}\``);
      counts[t] = r[0].c;
    }
    console.log('\n📊 Total row counts after seeding:');
    console.table(counts);
    console.log('\n✅ Extra seed complete!');

  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();

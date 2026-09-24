/**
 * Test utilities: clone a real GitHub repo and provide test fixtures.
 */

import { execSync } from "node:child_process";
import { rmSync, existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Repository to clone for testing.
 * Using minimist - small, well-tested, pure-JS repo with good coverage.
 */
const TEST_REPO_URL = "https://github.com/substack/minimist.git";
const TEST_REPO_DIR = join(process.cwd(), "test-fixtures", "minimist");
const TEST_REPO_BRANCH = "main";

/**
 * Clone a test repository if not already present.
 */
export function ensureTestRepo(): string {
	if (existsSync(TEST_REPO_DIR)) {
		return TEST_REPO_DIR;
	}

	console.log(`Cloning test repository: ${TEST_REPO_URL}`);
	execSync(
		`git clone --depth 1 --branch ${TEST_REPO_BRANCH} ${TEST_REPO_URL} "${TEST_REPO_DIR}"`,
		{ stdio: "inherit" },
	);

	return TEST_REPO_DIR;
}

/**
 * Read all files in a directory recursively.
 */
export function readAllFiles(dir: string): Array<{ path: string; content: string }> {
	const files: Array<{ path: string; content: string }> = [];

	function walk(currentDir: string, relativePrefix: string = "") {
		const entries = readdirSync(currentDir, { withFileTypes: true });

		for (const entry of entries) {
			const fullPath = join(currentDir, entry.name);
			const relativePath = join(relativePrefix, entry.name);

			if (entry.isDirectory()) {
				if (entry.name !== "node_modules" && entry.name !== ".git") {
					walk(fullPath, relativePath);
				}
			} else {
				try {
					const content = readFileSync(fullPath, "utf-8");
					files.push({ path: relativePath, content });
				} catch {
					// Skip files that can't be read
				}
			}
		}
	}

	walk(dir);
	return files;
}

/**
 * Clean up test fixtures.
 */
export function cleanupTestRepo(): void {
	if (existsSync(TEST_REPO_DIR)) {
		rmSync(TEST_REPO_DIR, { recursive: true, force: true });
	}
}

/**
 * Get a sample TypeScript file from the test repo (or create one).
 */
export function getSampleTypeScript(): string {
	return `
import { EventEmitter } from 'events';

interface Config {
	readonly name: string;
	readonly version: number;
	readonly debug?: boolean;
}

class Application extends EventEmitter {
	private config: Config;
	private running: boolean = false;

	constructor(config: Config) {
		super();
		this.config = config;
	}

	async start(): Promise<void> {
		if (this.running) {
			throw new Error('Application already running');
		}

		this.running = true;
		this.emit('start', { timestamp: Date.now() });

		if (this.config.debug) {
			console.log('Debug mode enabled');
		}

		await this.initialize();
	}

	private async initialize(): Promise<void> {
		// Initialize connections
		const connections = await this.connect();
		console.log(\`Connected to \${connections} services\`);
	}

	private async connect(): Promise<number> {
		// Simulate connection
		return 3;
	}

	stop(): void {
		this.running = false;
		this.emit('stop');
	}
}

export function createApp(config: Partial<Config>): Application {
	const app = new Application({
		name: 'test-app',
		version: 1,
		...config,
	});

	return app;
}

export default createApp;
`;
}

/**
 * Get a sample Python file from the test repo (or create one).
 */
export function getSamplePython(): string {
	return `
import os
import sys
from typing import List, Optional, Dict

class DataProcessor:
    """Process and analyze data files."""

    def __init__(self, input_path: str, output_path: Optional[str] = None):
        self.input_path = input_path
        self.output_path = output_path or input_path + ".processed"
        self.stats: Dict[str, int] = {}

    def read_data(self) -> List[str]:
        """Read data from input file."""
        with open(self.input_path, 'r') as f:
            return f.readlines()

    def process(self, data: List[str]) -> List[str]:
        """Process each line of data."""
        results = []
        for line in data:
            processed = self.transform(line.strip())
            if processed:
                results.append(processed)
        return results

    def transform(self, line: str) -> Optional[str]:
        """Transform a single line."""
        if not line:
            return None

        # Apply transformations
        parts = line.split(',')
        if len(parts) >= 2:
            return f"{parts[0].upper()}:{parts[1]}"
        return line.upper()

    def write_results(self, results: List[str]) -> None:
        """Write processed results to output file."""
        with open(self.output_path, 'w') as f:
            f.write('\\n'.join(results) + '\\n')

    def run(self) -> Dict[str, int]:
        """Run the full processing pipeline."""
        data = self.read_data()
        results = self.process(data)
        self.write_results(results)

        self.stats = {
            'input_lines': len(data),
            'output_lines': len(results),
            'filtered': len(data) - len(results),
        }

        return self.stats


if __name__ == '__main__':
    processor = DataProcessor(sys.argv[1] if len(sys.argv) > 1 else 'input.csv')
    stats = processor.run()
    print(f"Processed: {stats}")
`;
}

/**
 * Get a sample Go file from the test repo (or create one).
 */
export function getSampleGo(): string {
	return `
package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

type User struct {
	ID    int    \`json:"id"\`
	Name  string \`json:"name"\`
	Email string \`json:"email"\`
}

type Server struct {
	port    int
	users   map[int]User
	nextID  int
}

func NewServer(port int) *Server {
	return &Server{
		port:   port,
		users:  make(map[int]User),
		nextID: 1,
	}
}

func (s *Server) CreateUser(name, email string) User {
	user := User{
		ID:    s.nextID,
		Name:  name,
		Email: email,
	}
	s.users[s.nextID] = user
	s.nextID++
	return user
}

func (s *Server) GetUser(id int) (User, bool) {
	user, ok := s.users[id]
	return user, ok
}

func (s *Server) HandleCreate(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Name  string \`json:"name"\`
		Email string \`json:"email"\`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	user := s.CreateUser(input.Name, input.Email)
	json.NewEncoder(w).Encode(user)
}

func (s *Server) HandleGet(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Query().Get("id")
	var id int
	fmt.Sscanf(idStr, "%d", &id)

	user, ok := s.GetUser(id)
	if !ok {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(user)
}

func main() {
	server := NewServer(8080)

	http.HandleFunc("/users", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			server.HandleCreate(w, r)
		case http.MethodGet:
			server.HandleGet(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	log.Printf("Server starting on port %d", server.port)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", server.port), nil))
}
`;
}

/**
 * Get a sample Rust file from the test repo (or create one).
 */
export function getSampleRust(): string {
	return `
use std::collections::HashMap;
use std::error::Error;
use std::fs;
use std::io::{self, Write};

#[derive(Debug, Clone)]
struct Record {
    id: u32,
    name: String,
    value: f64,
}

impl Record {
    fn new(id: u32, name: String, value: f64) -> Self {
        Self { id, name, value }
    }
}

struct Dataset {
    records: Vec<Record>,
    metadata: HashMap<String, String>,
}

impl Dataset {
    fn new() -> Self {
        Self {
            records: Vec::new(),
            metadata: HashMap::new(),
        }
    }

    fn add_record(&mut self, record: Record) {
        self.records.push(record);
    }

    fn filter_by_value(&self, min: f64, max: f64) -> Vec<&Record> {
        self.records
            .iter()
            .filter(|r| r.value >= min && r.value <= max)
            .collect()
    }

    fn sum_values(&self) -> f64 {
        self.records.iter().map(|r| r.value).sum()
    }

    fn average(&self) -> Option<f64> {
        if self.records.is_empty() {
            None
        } else {
            Some(self.sum_values() / self.records.len() as f64)
        }
    }

    fn to_csv(&self) -> String {
        let mut output = String::from("id,name,value\\n");
        for record in &self.records {
            output.push_str(&format!("{},{},{}\\n", record.id, record.name, record.value));
        }
        output
    }

    fn save_to_file(&self, path: &str) -> Result<(), Box<dyn Error>> {
        let csv = self.to_csv();
        let mut file = fs::File::create(path)?;
        file.write_all(csv.as_bytes())?;
        Ok(())
    }
}

fn parse_csv_line(line: &str) -> Option<Record> {
    let parts: Vec<&str> = line.split(',').collect();
    if parts.len() < 3 {
        return None;
    }

    let id = parts[0].trim().parse::<u32>().ok()?;
    let name = parts[1].trim().to_string();
    let value = parts[2].trim().parse::<f64>().ok()?;

    Some(Record::new(id, name, value))
}

fn main() -> Result<(), Box<dyn Error>> {
    let mut dataset = Dataset::new();

    // Add sample records
    dataset.add_record(Record::new(1, "alpha".to_string(), 10.5));
    dataset.add_record(Record::new(2, "beta".to_string(), 20.3));
    dataset.add_record(Record::new(3, "gamma".to_string(), 15.7));

    // Calculate statistics
    if let Some(avg) = dataset.average() {
        println!("Average value: {:.2}", avg);
    }

    // Filter and display
    let filtered = dataset.filter_by_value(10.0, 20.0);
    println!("Records in range: {}", filtered.len());

    // Save to file
    dataset.save_to_file("output.csv")?;

    Ok(())
}
`;
}

/**
 * Get a sample Java file from the test repo (or create one).
 */
export function getSampleJava(): string {
	return `
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

public class UserService {

    private final List<User> users = new ArrayList<>();
    private int nextId = 1;

    public static class User {
        private final int id;
        private String name;
        private String email;

        public User(int id, String name, String email) {
            this.id = id;
            this.name = name;
            this.email = email;
        }

        public int getId() { return id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        @Override
        public String toString() {
            return "User{id=" + id + ", name='" + name + "', email='" + email + "'}";
        }
    }

    public User createUser(String name, String email) {
        User user = new User(nextId++, name, email);
        users.add(user);
        return user;
    }

    public Optional<User> findUserById(int id) {
        return users.stream()
            .filter(u -> u.getId() == id)
            .findFirst();
    }

    public List<User> findUsersByName(String name) {
        return users.stream()
            .filter(u -> u.getName().toLowerCase().contains(name.toLowerCase()))
            .collect(Collectors.toList());
    }

    public boolean deleteUser(int id) {
        return users.removeIf(u -> u.getId() == id);
    }

    public List<User> getAllUsers() {
        return new ArrayList<>(users);
    }

    public long getUserCount() {
        return users.size();
    }
}
`;
}

/**
 * Get a sample CSS file from the test repo (or create one).
 */
export function getSampleCSS(): string {
	return `
/* Main application styles */
:root {
	--primary-color: #3498db;
	--secondary-color: #2ecc71;
	--danger-color: #e74c3c;
	--text-color: #2c3e50;
	--bg-color: #ecf0f1;
	--border-radius: 8px;
	--shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

* {
	margin: 0;
	padding: 0;
	box-sizing: border-box;
}

body {
	font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
	color: var(--text-color);
	background-color: var(--bg-color);
	line-height: 1.6;
}

.container {
	max-width: 1200px;
	margin: 0 auto;
	padding: 0 20px;
}

/* Header styles */
.header {
	background: linear-gradient(135deg, var(--primary-color), #2980b9);
	color: white;
	padding: 1rem 0;
	box-shadow: var(--shadow);
}

.header .container {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.logo {
	font-size: 1.5rem;
	font-weight: bold;
}

nav ul {
	display: flex;
	list-style: none;
	gap: 2rem;
}

nav a {
	color: white;
	text-decoration: none;
	padding: 0.5rem 1rem;
	border-radius: var(--border-radius);
	transition: background-color 0.3s;
}

nav a:hover {
	background-color: rgba(255, 255, 255, 0.2);
}

/* Button styles */
.btn {
	display: inline-block;
	padding: 0.75rem 1.5rem;
	border: none;
	border-radius: var(--border-radius);
	cursor: pointer;
	font-size: 1rem;
	transition: all 0.3s ease;
}

.btn-primary {
	background-color: var(--primary-color);
	color: white;
}

.btn-primary:hover {
	background-color: #2980b9;
	transform: translateY(-2px);
	box-shadow: var(--shadow);
}

.btn-secondary {
	background-color: var(--secondary-color);
	color: white;
}

.btn-danger {
	background-color: var(--danger-color);
	color: white;
}

/* Card styles */
.card {
	background: white;
	border-radius: var(--border-radius);
	box-shadow: var(--shadow);
	padding: 1.5rem;
	margin-bottom: 1rem;
}

.card-header {
	border-bottom: 1px solid #eee;
	padding-bottom: 0.5rem;
	margin-bottom: 1rem;
}

.card-title {
	font-size: 1.25rem;
	font-weight: 600;
}

/* Responsive design */
@media (max-width: 768px) {
	.header .container {
		flex-direction: column;
		gap: 1rem;
	}

	nav ul {
		gap: 1rem;
	}

	.btn {
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
	}
}
`;
}

/**
 * Get a sample HTML file from the test repo (or create one).
 */
export function getSampleHTML(): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Test Application</title>
	<link rel="stylesheet" href="styles.css">
</head>
<body>
	<header class="header">
		<div class="container">
			<div class="logo">MyApp</div>
			<nav>
				<ul>
					<li><a href="#home">Home</a></li>
					<li><a href="#about">About</a></li>
					<li><a href="#contact">Contact</a></li>
				</ul>
			</nav>
		</div>
	</header>

	<main class="container">
		<section id="home">
			<h1>Welcome to MyApp</h1>
			<p>This is a sample application for testing.</p>
			<button class="btn btn-primary" onclick="startApp()">Get Started</button>
		</section>

		<section id="about" class="card">
			<div class="card-header">
				<h2 class="card-title">About</h2>
			</div>
			<p>Learn more about our application and its features.</p>
		</section>

		<section id="contact" class="card">
			<div class="card-header">
				<h2 class="card-title">Contact Us</h2>
			</div>
			<form id="contactForm">
				<input type="text" placeholder="Your Name" required>
				<input type="email" placeholder="Your Email" required>
				<textarea placeholder="Your Message"></textarea>
				<button type="submit" class="btn btn-secondary">Send</button>
			</form>
		</section>
	</main>

	<footer>
		<div class="container">
			<p>&copy; 2024 MyApp. All rights reserved.</p>
		</div>
	</footer>

	<script src="app.js"></script>
</body>
</html>
`;
}

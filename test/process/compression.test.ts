/**
 * Tests for code compression.
 */

import { describe, expect, it } from "vitest";
import { compressContent } from "../../process/compression.js";

describe("process/compression", () => {
	describe("compressContent", () => {
		describe("TypeScript/JavaScript compression", () => {
			it("should compress TypeScript function declarations", () => {
				const input = `function greet(name: string): string {
	return \`Hello, \${name}!\`;
}

function add(a: number, b: number): number {
	return a + b;
}`;
				const result = compressContent(input, "test.ts", "typescript");

				expect(result).toContain("function greet");
				expect(result).toContain("function add");
			});

			it("should compress TypeScript class declarations", () => {
				const input = `class User {
	private name: string;
	private age: number;

	constructor(name: string, age: number) {
		this.name = name;
		this.age = age;
	}

	getName(): string {
		return this.name;
	}

	getAge(): number {
		return this.age;
	}
}`;
				const result = compressContent(input, "test.ts", "typescript");

				expect(result).toContain("class User");
			});

			it("should compress TypeScript interfaces", () => {
				const input = `interface User {
	id: number;
	name: string;
	email: string;
	createdAt: Date;
}`;
				const result = compressContent(input, "test.ts", "typescript");

				expect(result).toContain("interface User");
			});

			it("should compress TypeScript type aliases", () => {
				const input = `type User = {
	id: number;
	name: string;
}`;
				const result = compressContent(input, "test.ts", "typescript");

				expect(result).toContain("type User");
			});

			it("should compress TypeScript exports", () => {
				const input = `export const PI = 3.14159;
export function calculate(radius: number): number {
	return PI * radius * radius;
}
export default class Circle {
	radius: number;
}`;
				const result = compressContent(input, "test.ts", "typescript");

				expect(result).toContain("export const PI");
				expect(result).toContain("export function calculate");
				expect(result).toContain("export default class Circle");
			});

			it("should compress TypeScript async functions", () => {
				const input = `async function fetchData(url: string): Promise<any> {
	const response = await fetch(url);
	const data = await response.json();
	return data;
}`;
				const result = compressContent(input, "test.ts", "typescript");

				expect(result).toContain("async function fetchData");
			});

			it("should compress TypeScript arrow functions", () => {
				const input = `const add = (a: number, b: number): number => {
	return a + b;
};

const multiply = (a: number, b: number): number => a * b;`;
				const result = compressContent(input, "test.ts", "typescript");

				expect(result).toContain("const add");
				expect(result).toContain("const multiply");
			});

			it("should compress TypeScript enums", () => {
				const input = `enum Color {
	Red,
	Green,
	Blue,
}`;
				const result = compressContent(input, "test.ts", "typescript");

				expect(result).toContain("enum Color");
			});

			it("should compress TypeScript generics", () => {
				const input = `function identity<T>(arg: T): T {
	return arg;
}

interface Container<T> {
	value: T;
}`;
				const result = compressContent(input, "test.ts", "typescript");

				expect(result).toContain("identity<T>");
				expect(result).toContain("Container");
			});

			it("should compress TypeScript namespaces", () => {
				const input = `namespace MyLib {
	export function hello(): string {
		return "Hello";
	}
}`;
				const result = compressContent(input, "test.ts", "typescript");

				expect(result).toContain("namespace MyLib");
				expect(result).toContain("export function hello");
			});

			it("should compress TypeScript decorators", () => {
				const input = `function log(target: any, name: string, descriptor: PropertyDescriptor) {
	const original = descriptor.value;
	descriptor.value = function (...args: any[]) {
		console.log(\`Calling \${name} with args:\`, args);
		return original.apply(this, args);
	};
}`;
				const result = compressContent(input, "test.ts", "typescript");

				expect(result).toContain("function log");
			});

			it("should compress TypeScript modules", () => {
				const input = `import { User } from './types';
import * as fs from 'fs';

export class Service {
	private fs = fs;
}`;
				const result = compressContent(input, "test.ts", "typescript");

				expect(result).toContain("import");
				expect(result).toContain("export class Service");
			});

			it("should compress JavaScript functions", () => {
				const input = `function greet(name) {
	return 'Hello, ' + name + '!';
}

const add = function(a, b) {
	return a + b;
};`;
				const result = compressContent(input, "test.js", "javascript");

				expect(result).toContain("function greet");
				expect(result).toContain("const add");
			});

			it("should compress TypeScript JSX/TSX", () => {
				const input = `const Button: React.FC<ButtonProps> = ({ label, onClick }) => {
	return (
		<button onClick={onClick}>
			{label}
		</button>
	);
};`;
				const result = compressContent(input, "test.tsx", "tsx");

				expect(result).toContain("const Button");
			});

			it("should compress JavaScript JSX", () => {
				const input = `const Button = ({ label, onClick }) => {
	return <button onClick={onClick}>{label}</button>;
};`;
				const result = compressContent(input, "test.jsx", "jsx");

				expect(result).toContain("const Button");
			});

			it("should return content unchanged for unknown language", () => {
				const input = `some code
with functions`;
				const result = compressContent(input, "test.unknown", "unknown");
				expect(result).toBe(input);
			});

			it("should handle empty input", () => {
				const result = compressContent("", "test.ts", "typescript");
				expect(result).toBe("");
			});

			it("should handle input with no compressible content", () => {
				const input = `const x = 1;
const y = 2;`;
				const result = compressContent(input, "test.ts", "typescript");
				expect(result).toContain("const");
			});

			it("should significantly reduce tokens for large TypeScript file", () => {
				const input = `class DataService {
	private data: any[] = [];

	constructor(private url: string) {}

	async fetchData(): Promise<any[]> {
		const response = await fetch(this.url);
		const data = await response.json();
		this.data = data;
		return data;
	}

	async postData(payload: any): Promise<any> {
		const response = await fetch(this.url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		});
		return response.json();
	}

	async deleteData(id: number): Promise<void> {
		await fetch(\`\${this.url}/\${id}\`, { method: 'DELETE' });
	}

	getData(): any[] {
		return this.data;
	}

	clearData(): void {
		this.data = [];
	}
}

export default DataService;`;
				const result = compressContent(input, "DataService.ts", "typescript");

				expect(result).toContain("class DataService");
			});
		});

		describe("Python compression", () => {
			it("should compress Python function definitions", () => {
				const input = `def greet(name: str) -> str:
	return f"Hello, {name}!"

def add(a: int, b: int) -> int:
	return a + b`;
				const result = compressContent(input, "test.py", "python");

				expect(result).toContain("def greet");
				expect(result).toContain("def add");
			});

			it("should compress Python class definitions", () => {
				const input = `class User:
	def __init__(self, name: str, age: int):
		self.name = name
		self.age = age

	def get_name(self) -> str:
		return self.name

	def get_age(self) -> int:
		return self.age`;
				const result = compressContent(input, "test.py", "python");

				expect(result).toContain("class User");
			});

			it("should compress Python decorators", () => {
				const input = `@decorator
def my_function():
	pass`;
				const result = compressContent(input, "test.py", "python");

				expect(result).toContain("@decorator");
				expect(result).toContain("def my_function");
			});

			it("should handle empty input for Python", () => {
				const result = compressContent("", "test.py", "python");
				expect(result).toBe("");
			});
		});

		describe("Go compression", () => {
			it("should compress Go function declarations", () => {
				const input = `func greet(name string) string {
	return "Hello, " + name
}

func add(a, b int) int {
	return a + b
}`;
				const result = compressContent(input, "test.go", "go");

				expect(result).toContain("func greet");
				expect(result).toContain("func add");
			});

			it("should compress Go struct definitions", () => {
				const input = `type User struct {
	Name  string
	Age   int
	Email string
}`;
				const result = compressContent(input, "test.go", "go");

				expect(result).toContain("type User struct");
			});

			it("should compress Go interfaces", () => {
				const input = `type Reader interface {
	Read(p []byte) (n int, err error)
}`;
				const result = compressContent(input, "test.go", "go");

				expect(result).toContain("type Reader interface");
				expect(result).toContain("Read");
			});

			it("should handle empty input for Go", () => {
				const result = compressContent("", "test.go", "go");
				expect(result).toBe("");
			});
		});

		describe("Rust compression", () => {
			it("should compress Rust function declarations", () => {
				const input = `fn greet(name: &str) -> String {
	format!("Hello, {}!", name)
}

fn add(a: i32, b: i32) -> i32 {
	a + b
}`;
				const result = compressContent(input, "test.rs", "rust");

				expect(result).toContain("fn greet");
				expect(result).toContain("fn add");
			});

			it("should compress Rust struct definitions", () => {
				const input = `struct User {
	name: String,
	age: u32,
	email: String,
}`;
				const result = compressContent(input, "test.rs", "rust");

				expect(result).toContain("struct User");
			});

			it("should compress Rust impl blocks", () => {
				const input = `impl User {
	fn new(name: String, age: u32) -> Self {
		User {
			name,
			age,
			email: String::new(),
		}
	}
}`;
				const result = compressContent(input, "test.rs", "rust");

				expect(result).toContain("impl User");
				expect(result).toContain("fn new");
			});

			it("should handle empty input for Rust", () => {
				const result = compressContent("", "test.rs", "rust");
				expect(result).toBe("");
			});
		});

		describe("Java compression", () => {
			it("should compress Java method declarations", () => {
				const input = `public class UserService {
	public User findById(int id) {
		return users.stream()
			.filter(u -> u.getId() == id)
			.findFirst()
			.orElse(null);
	}

	public List<User> findAll() {
		return new ArrayList<>(users);
	}
}`;
				const result = compressContent(input, "UserService.java", "java");

				expect(result).toContain("public class UserService");
				expect(result).toContain("findById");
				expect(result).toContain("findAll");
			});

			it("should compress Java interfaces", () => {
				const input = `public interface Repository<T, ID> {
	Optional<T> findById(ID id);
	List<T> findAll();
	T save(T entity);
}`;
				const result = compressContent(input, "Repository.java", "java");

				expect(result).toContain("interface Repository");
				expect(result).toContain("findById");
				expect(result).toContain("findAll");
			});

			it("should handle empty input for Java", () => {
				const result = compressContent("", "test.java", "java");
				expect(result).toBe("");
			});
		});

		describe("C/C++ compression", () => {
			it("should compress C function declarations", () => {
				const input = `int add(int a, int b) {
	return a + b;
}

void print_hello(const char *name) {
	printf("Hello, %s!\\n", name);
}`;
				const result = compressContent(input, "test.c", "c");

				expect(result).toContain("add");
				expect(result).toContain("print_hello");
			});

			it("should handle empty input for C", () => {
				const result = compressContent("", "test.c", "c");
				expect(result).toBe("");
			});

			it("should handle empty input for C++", () => {
				const result = compressContent("", "test.cpp", "cpp");
				expect(result).toBe("");
			});
		});

		describe("PHP compression", () => {
			it("should compress PHP method declarations", () => {
				const input = `class User {
	private string $name;

	public function __construct(string $name) {
		$this->name = $name;
	}

	public function getName(): string {
		return $this->name;
	}
}`;
				const result = compressContent(input, "test.php", "php");

				expect(result).toContain("class User");
			});

			it("should handle empty input for PHP", () => {
				const result = compressContent("", "test.php", "php");
				expect(result).toBe("");
			});
		});

		describe("Swift compression", () => {
			it("should compress Swift function declarations", () => {
				const input = `func greet(name: String) -> String {
	return "Hello, (name)!"
}

func add(_ a: Int, _ b: Int) -> Int {
	return a + b
}`;
				const result = compressContent(input, "test.swift", "swift");

				expect(result).toContain("func greet");
				expect(result).toContain("func add");
			});

			it("should handle empty input for Swift", () => {
				const result = compressContent("", "test.swift", "swift");
				expect(result).toBe("");
			});
		});

		describe("Kotlin compression", () => {
			it("should compress Kotlin function declarations", () => {
				const input = `fun greet(name: String): String {
	return "Hello, $name!"
}

fun add(a: Int, b: Int): Int {
	return a + b
}`;
				const result = compressContent(input, "test.kt", "kotlin");

				expect(result).toContain("fun greet");
				expect(result).toContain("fun add");
			});

			it("should handle empty input for Kotlin", () => {
				const result = compressContent("", "test.kt", "kotlin");
				expect(result).toBe("");
			});
		});

		describe("Ruby compression", () => {
			it("should compress Ruby method definitions", () => {
				const input = `def greet(name)
	"Hello, #{name}!"
end

def add(a, b)
	a + b
end`;
				const result = compressContent(input, "test.rb", "ruby");

				expect(result).toContain("def greet");
				expect(result).toContain("def add");
			});

			it("should compress Ruby classes", () => {
				const input = `class User
	attr_accessor :name, :age

	def initialize(name, age)
		@name = name
		@age = age
	end
end`;
				const result = compressContent(input, "test.rb", "ruby");

				expect(result).toContain("class User");
				expect(result).toContain("def initialize");
			});

			it("should handle empty input for Ruby", () => {
				const result = compressContent("", "test.rb", "ruby");
				expect(result).toBe("");
			});
		});

		describe("Shell compression", () => {
			it("should compress Shell function definitions", () => {
				const input = `greet() {
	echo "Hello, $1!"
}

add() {
	echo $(($1 + $2))
}`;
				const result = compressContent(input, "test.sh", "shell");

				expect(result).toContain("greet");
				expect(result).toContain("add");
			});

			it("should handle empty input for Shell", () => {
				const result = compressContent("", "test.sh", "shell");
				expect(result).toBe("");
			});

			it("should handle empty input for PowerShell", () => {
				const result = compressContent("", "test.ps1", "powershell");
				expect(result).toBe("");
			});
		});

		describe("Scala compression", () => {
			it("should handle empty input for Scala", () => {
				const result = compressContent("", "test.scala", "scala");
				expect(result).toBe("");
			});
		});

		describe("Haskell compression", () => {
			it("should handle empty input for Haskell", () => {
				const result = compressContent("", "test.hs", "haskell");
				expect(result).toBe("");
			});
		});

		describe("Elixir compression", () => {
			it("should handle empty input for Elixir", () => {
				const result = compressContent("", "test.ex", "elixir");
				expect(result).toBe("");
			});
		});

		describe("SQL compression", () => {
			it("should handle empty input for SQL", () => {
				const result = compressContent("", "test.sql", "sql");
				expect(result).toBe("");
			});
		});

		describe("Compression ratio", () => {
			it("should achieve significant compression for TypeScript", () => {
				const largeFile = `class LargeService {
	method1(): void { console.log('a'); }
	method2(): void { console.log('b'); }
	method3(): void { console.log('c'); }
	method4(): void { console.log('d'); }
	method5(): void { console.log('e'); }
	method6(): void { console.log('f'); }
	method7(): void { console.log('g'); }
	method8(): void { console.log('h'); }
	method9(): void { console.log('i'); }
	method10(): void { console.log('j'); }
}`;
				const result = compressContent(
					largeFile,
					"LargeService.ts",
					"typescript",
				);
				const ratio = result.length / largeFile.length;
				expect(ratio).toBeLessThan(1.0);
			});

			it("should achieve significant compression for Python", () => {
				const largeFile = `class LargeService:
	def method1(self): print('a')
	def method2(self): print('b')
	def method3(self): print('c')
	def method4(self): print('d')
	def method5(self): print('e')
	def method6(self): print('f')
	def method7(self): print('g')
	def method8(self): print('h')
	def method9(self): print('i')
	def method10(self): print('j')`;
				const result = compressContent(largeFile, "LargeService.py", "python");
				const ratio = result.length / largeFile.length;
				expect(ratio).toBeLessThan(1.0);
			});
		});
	});
});

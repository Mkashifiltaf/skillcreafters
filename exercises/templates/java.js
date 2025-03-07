const javaTemplates = {
    beginner: {
        basics: {
            title: "Java Basics",
            description: "Learn fundamental Java concepts",
            exercises: [
                {
                    id: "string_manipulation",
                    title: "String Manipulation",
                    description: "Implement various string manipulation methods",
                    starterCode: `public class StringManipulator {
    public String reverse(String input) {
        // Implement string reversal
    }
    
    public boolean isPalindrome(String input) {
        // Check if string is palindrome
    }
    
    public String capitalize(String input) {
        // Capitalize first letter of each word
    }
}`,
                    testCases: [
                        {
                            input: ["hello"],
                            expected: {
                                reverse: "olleh",
                                isPalindrome: false,
                                capitalize: "Hello"
                            }
                        },
                        {
                            input: ["radar"],
                            expected: {
                                reverse: "radar",
                                isPalindrome: true,
                                capitalize: "Radar"
                            }
                        }
                    ],
                    hints: [
                        "Use StringBuilder for efficient string manipulation",
                        "Consider case sensitivity in palindrome check",
                        "Split words by spaces for capitalization"
                    ]
                }
            ]
        },
        collections: {
            title: "Java Collections",
            description: "Master Java collections framework",
            exercises: [
                {
                    id: "list_operations",
                    title: "List Operations",
                    description: "Implement common list operations",
                    starterCode: `import java.util.*;

public class ListOperations {
    public List<Integer> removeDuplicates(List<Integer> list) {
        // Remove duplicates while maintaining order
    }
    
    public List<Integer> findIntersection(List<Integer> list1, List<Integer> list2) {
        // Find common elements
    }
    
    public List<Integer> mergeSorted(List<Integer> list1, List<Integer> list2) {
        // Merge two sorted lists
    }
}`,
                    testCases: [
                        {
                            input: {
                                removeDuplicates: [[1, 2, 2, 3, 3, 4]],
                                findIntersection: [[1, 2, 3], [2, 3, 4]],
                                mergeSorted: [[1, 3, 5], [2, 4, 6]]
                            },
                            expected: {
                                removeDuplicates: [1, 2, 3, 4],
                                findIntersection: [2, 3],
                                mergeSorted: [1, 2, 3, 4, 5, 6]
                            }
                        }
                    ],
                    hints: [
                        "Consider using Set for removing duplicates",
                        "HashSet is efficient for finding intersections",
                        "Use two pointers for merging sorted lists"
                    ]
                }
            ]
        }
    },
    intermediate: {
        oop: {
            title: "Object-Oriented Programming",
            description: "Practice OOP principles in Java",
            exercises: [
                {
                    id: "shape_hierarchy",
                    title: "Shape Hierarchy",
                    description: "Implement a shape class hierarchy with inheritance and polymorphism",
                    starterCode: `abstract class Shape {
    abstract double area();
    abstract double perimeter();
}

class Circle extends Shape {
    private double radius;
    
    public Circle(double radius) {
        this.radius = radius;
    }
    
    @Override
    double area() {
        // Calculate circle area
    }
    
    @Override
    double perimeter() {
        // Calculate circle perimeter
    }
}

class Rectangle extends Shape {
    private double width;
    private double height;
    
    public Rectangle(double width, double height) {
        this.width = width;
        this.height = height;
    }
    
    @Override
    double area() {
        // Calculate rectangle area
    }
    
    @Override
    double perimeter() {
        // Calculate rectangle perimeter
    }
}`,
                    testCases: [
                        {
                            input: {
                                circle: [5],
                                rectangle: [4, 6]
                            },
                            expected: {
                                circleArea: 78.54,
                                circlePerimeter: 31.42,
                                rectangleArea: 24,
                                rectanglePerimeter: 20
                            }
                        }
                    ],
                    hints: [
                        "Use Math.PI for circle calculations",
                        "Remember to handle negative dimensions",
                        "Consider adding input validation"
                    ]
                }
            ]
        },
        threading: {
            title: "Multi-threading",
            description: "Learn Java concurrency and threading",
            exercises: [
                {
                    id: "producer_consumer",
                    title: "Producer-Consumer Pattern",
                    description: "Implement the producer-consumer pattern using Java threading",
                    starterCode: `import java.util.concurrent.*;

class Buffer {
    private Queue<Integer> queue;
    private int capacity;
    
    public Buffer(int capacity) {
        this.capacity = capacity;
        this.queue = new LinkedList<>();
    }
    
    public synchronized void produce(int item) throws InterruptedException {
        // Implement producer logic
    }
    
    public synchronized int consume() throws InterruptedException {
        // Implement consumer logic
    }
}

class Producer implements Runnable {
    private Buffer buffer;
    
    public Producer(Buffer buffer) {
        this.buffer = buffer;
    }
    
    @Override
    public void run() {
        // Implement producer thread
    }
}

class Consumer implements Runnable {
    private Buffer buffer;
    
    public Consumer(Buffer buffer) {
        this.buffer = buffer;
    }
    
    @Override
    public void run() {
        // Implement consumer thread
    }
}`,
                    testCases: [
                        {
                            input: {
                                bufferSize: 5,
                                producerItems: [1, 2, 3, 4, 5],
                                consumerCount: 3
                            },
                            expected: "All items consumed in order"
                        }
                    ],
                    hints: [
                        "Use wait() when buffer is full/empty",
                        "Use notifyAll() after producing/consuming",
                        "Consider using BlockingQueue"
                    ]
                }
            ]
        }
    },
    advanced: {
        design_patterns: {
            title: "Design Patterns",
            description: "Implement common design patterns in Java",
            exercises: [
                {
                    id: "observer_pattern",
                    title: "Observer Pattern",
                    description: "Implement a news agency using the observer pattern",
                    starterCode: `import java.util.*;

interface Observer {
    void update(String news);
}

interface Subject {
    void attach(Observer observer);
    void detach(Observer observer);
    void notifyObservers();
}

class NewsAgency implements Subject {
    private List<Observer> observers;
    private String news;
    
    public NewsAgency() {
        this.observers = new ArrayList<>();
    }
    
    public void setNews(String news) {
        this.news = news;
        notifyObservers();
    }
    
    @Override
    public void attach(Observer observer) {
        // Implement attach
    }
    
    @Override
    public void detach(Observer observer) {
        // Implement detach
    }
    
    @Override
    public void notifyObservers() {
        // Implement notification
    }
}

class NewsChannel implements Observer {
    private String name;
    
    public NewsChannel(String name) {
        this.name = name;
    }
    
    @Override
    public void update(String news) {
        // Implement update
    }
}`,
                    testCases: [
                        {
                            input: {
                                channels: ["CNN", "BBC", "Fox"],
                                news: "Breaking News!"
                            },
                            expected: "All channels received the news"
                        }
                    ],
                    hints: [
                        "Maintain a list of observers",
                        "Handle concurrent modifications",
                        "Consider weak references"
                    ]
                }
            ]
        },
        spring: {
            title: "Spring Framework",
            description: "Learn Spring Framework core concepts",
            exercises: [
                {
                    id: "dependency_injection",
                    title: "Dependency Injection",
                    description: "Implement a simple dependency injection container",
                    starterCode: `import java.util.*;
import java.lang.reflect.*;

class DIContainer {
    private Map<Class<?>, Object> instances;
    
    public DIContainer() {
        this.instances = new HashMap<>();
    }
    
    public void register(Class<?> type, Object instance) {
        // Register instance
    }
    
    public <T> T resolve(Class<T> type) {
        // Resolve dependency
    }
    
    private Object createInstance(Class<?> type) {
        // Create new instance with dependencies
    }
}

@Injectable
class UserService {
    private final DatabaseService db;
    
    public UserService(DatabaseService db) {
        this.db = db;
    }
}

@Injectable
class DatabaseService {
    // Database service implementation
}`,
                    testCases: [
                        {
                            input: {
                                register: ["DatabaseService", "UserService"],
                                resolve: "UserService"
                            },
                            expected: "UserService instance with injected DatabaseService"
                        }
                    ],
                    hints: [
                        "Use reflection to analyze constructors",
                        "Handle circular dependencies",
                        "Implement singleton scope"
                    ]
                }
            ]
        }
    }
};

module.exports = javaTemplates;

const javascriptTemplates = {
    beginner: {
        basics: {
            title: "JavaScript Basics",
            description: "Learn fundamental JavaScript concepts",
            exercises: [
                {
                    id: "array_ops",
                    title: "Array Operations",
                    description: "Implement basic array operations without using built-in methods.",
                    starterCode: `function arrayOperations(arr) {
    // Implement the following:
    // 1. Find the sum of all elements
    // 2. Find the largest element
    // 3. Count even numbers
    // Return [sum, largest, evenCount]
}`,
                    testCases: [
                        {
                            input: [[1, 2, 3, 4, 5]],
                            expected: [15, 5, 2]
                        },
                        {
                            input: [[-1, 0, 2, 4]],
                            expected: [5, 4, 3]
                        }
                    ],
                    hints: [
                        "Use a loop to iterate through the array",
                        "Keep track of running totals",
                        "Use modulo operator for even numbers"
                    ]
                }
            ]
        },
        dom: {
            title: "DOM Manipulation",
            description: "Learn to interact with the Document Object Model",
            exercises: [
                {
                    id: "todo_list",
                    title: "Todo List",
                    description: "Create a simple todo list with add, remove, and toggle completion.",
                    starterCode: `class TodoList {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.todos = [];
    }

    addTodo(text) {
        // Implement add functionality
    }

    removeTodo(id) {
        // Implement remove functionality
    }

    toggleTodo(id) {
        // Implement toggle functionality
    }

    render() {
        // Implement rendering
    }
}`,
                    testCases: [
                        {
                            input: ["Add todo, toggle it, remove it"],
                            expected: "UI updates correctly"
                        }
                    ],
                    hints: [
                        "Use createElement for new todos",
                        "Store todos in an array",
                        "Use event listeners"
                    ]
                }
            ]
        }
    },
    intermediate: {
        async: {
            title: "Asynchronous Programming",
            description: "Master async/await and Promises",
            exercises: [
                {
                    id: "promise_chain",
                    title: "Promise Chain",
                    description: "Implement a chain of promises that process data sequentially.",
                    starterCode: `async function processData(data) {
    // 1. Validate data
    // 2. Transform data
    // 3. Save data
    // Handle errors appropriately
}

function validateData(data) {
    return new Promise((resolve, reject) => {
        // Implement validation
    });
}

function transformData(validData) {
    return new Promise((resolve, reject) => {
        // Implement transformation
    });
}

function saveData(transformedData) {
    return new Promise((resolve, reject) => {
        // Implement saving
    });
}`,
                    testCases: [
                        {
                            input: [{ id: 1, value: "test" }],
                            expected: "Processed data"
                        }
                    ],
                    hints: [
                        "Use try/catch with async/await",
                        "Chain promises properly",
                        "Handle edge cases"
                    ]
                }
            ]
        },
        patterns: {
            title: "Design Patterns",
            description: "Implement common JavaScript patterns",
            exercises: [
                {
                    id: "observer",
                    title: "Observer Pattern",
                    description: "Implement an event system using the observer pattern.",
                    starterCode: `class EventEmitter {
    constructor() {
        this.events = {};
    }

    on(event, callback) {
        // Subscribe to event
    }

    off(event, callback) {
        // Unsubscribe from event
    }

    emit(event, data) {
        // Emit event with data
    }

    once(event, callback) {
        // Subscribe to event once
    }
}`,
                    testCases: [
                        {
                            input: ["Subscribe, emit, unsubscribe"],
                            expected: "Correct event handling"
                        }
                    ],
                    hints: [
                        "Store callbacks in arrays",
                        "Handle callback removal",
                        "Implement once using wrapper"
                    ]
                }
            ]
        }
    },
    advanced: {
        performance: {
            title: "Performance Optimization",
            description: "Optimize JavaScript code for better performance",
            exercises: [
                {
                    id: "virtual_list",
                    title: "Virtual List",
                    description: "Implement a virtual scrolling list for large datasets.",
                    starterCode: `class VirtualList {
    constructor(container, items, itemHeight) {
        this.container = container;
        this.items = items;
        this.itemHeight = itemHeight;
        this.visibleItems = [];
    }

    render() {
        // Implement virtual scrolling
    }

    updateVisibleItems() {
        // Update visible items based on scroll
    }

    getScrollPosition() {
        // Get current scroll position
    }

    calculateVisibleRange() {
        // Calculate visible item range
    }
}`,
                    testCases: [
                        {
                            input: ["Scroll through 10000 items"],
                            expected: "Smooth scrolling, low memory"
                        }
                    ],
                    hints: [
                        "Use scroll event listener",
                        "Implement item recycling",
                        "Use requestAnimationFrame"
                    ]
                }
            ]
        },
        security: {
            title: "Security Practices",
            description: "Implement secure coding practices",
            exercises: [
                {
                    id: "xss_prevention",
                    title: "XSS Prevention",
                    description: "Implement a secure content sanitizer.",
                    starterCode: `class ContentSanitizer {
    constructor(options = {}) {
        this.allowedTags = options.allowedTags || [];
        this.allowedAttributes = options.allowedAttributes || {};
    }

    sanitize(content) {
        // Implement content sanitization
    }

    sanitizeNode(node) {
        // Sanitize individual node
    }

    isAllowedTag(tag) {
        // Check if tag is allowed
    }

    sanitizeAttributes(node) {
        // Sanitize node attributes
    }
}`,
                    testCases: [
                        {
                            input: ['<script>alert("xss")</script>'],
                            expected: "Sanitized content"
                        }
                    ],
                    hints: [
                        "Use DOMParser",
                        "Whitelist approach",
                        "Handle nested content"
                    ]
                }
            ]
        }
    }
};

module.exports = javascriptTemplates;

const pythonTemplates = {
    beginner: {
        variables: {
            title: "Variable Basics",
            description: "Learn how to work with variables in Python",
            exercises: [
                {
                    id: "var_swap",
                    title: "Variable Swap",
                    description: "Write a program to swap the values of two variables without using a temporary variable.",
                    starterCode: `def swap_variables(a, b):
    # Your code here
    return a, b`,
                    testCases: [
                        { input: [5, 10], expected: [10, 5] },
                        { input: [-1, 1], expected: [1, -1] },
                        { input: [0, 100], expected: [100, 0] }
                    ],
                    hints: [
                        "Think about using arithmetic operations",
                        "You can use addition and subtraction",
                        "Or try using XOR operations"
                    ]
                },
                {
                    id: "str_reverse",
                    title: "String Reversal",
                    description: "Write a function to reverse a string without using the built-in reverse function.",
                    starterCode: `def reverse_string(text):
    # Your code here
    return reversed_text`,
                    testCases: [
                        { input: ["hello"], expected: "olleh" },
                        { input: ["python"], expected: "nohtyp" },
                        { input: ["12345"], expected: "54321" }
                    ],
                    hints: [
                        "Try using string slicing",
                        "Think about using a loop",
                        "Remember string indexing in Python"
                    ]
                }
            ]
        },
        lists: {
            title: "List Operations",
            description: "Learn to manipulate lists effectively",
            exercises: [
                {
                    id: "list_sum",
                    title: "List Sum",
                    description: "Write a function to find the sum of all elements in a list without using the sum() function.",
                    starterCode: `def calculate_sum(numbers):
    # Your code here
    return total`,
                    testCases: [
                        { input: [[1, 2, 3, 4, 5]], expected: 15 },
                        { input: [[-1, -2, -3]], expected: -6 },
                        { input: [[0]], expected: 0 }
                    ],
                    hints: [
                        "Use a loop to iterate through the list",
                        "Initialize a variable to store the sum",
                        "Add each element to your sum variable"
                    ]
                }
            ]
        }
    },
    intermediate: {
        algorithms: {
            title: "Algorithm Implementation",
            description: "Implement common algorithms in Python",
            exercises: [
                {
                    id: "algorithm_example",
                    title: "Example Algorithm",
                    description: "Write an example algorithm.",
                    starterCode: `def example_algorithm():
    # Your code here`,
                    testCases: [],
                    hints: []
                }
            ]
        }
    }
};

module.exports = pythonTemplates;

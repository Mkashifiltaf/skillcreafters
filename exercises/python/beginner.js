const exercises = {
    variables: [
        {
            id: 'py_var_1',
            title: 'Variable Assignment',
            difficulty: 'easy',
            points: 10,
            description: `Create a variable named 'greeting' and assign it the value "Hello, World!"`,
            initialCode: '# Write your code here\n',
            solution: 'greeting = "Hello, World!"',
            testCases: [
                {
                    input: '',
                    expectedOutput: '',
                    test: 'assert "greeting" in locals() and greeting == "Hello, World!"',
                    message: 'Make sure you create a variable named greeting with the exact string "Hello, World!"'
                }
            ],
            hints: [
                'Variables in Python don\'t need to be declared with any specific keyword',
                'String values need to be enclosed in quotes (either single or double)',
                'The variable name should be exactly "greeting"'
            ]
        },
        {
            id: 'py_var_2',
            title: 'Basic Arithmetic',
            difficulty: 'easy',
            points: 15,
            description: 'Create two variables, x and y, with values 10 and 5 respectively. Then create a third variable "sum" with their sum.',
            initialCode: '# Create variables x, y, and sum\n',
            solution: 'x = 10\ny = 5\nsum = x + y',
            testCases: [
                {
                    input: '',
                    expectedOutput: '',
                    test: 'assert "x" in locals() and x == 10',
                    message: 'Variable x should be equal to 10'
                },
                {
                    input: '',
                    expectedOutput: '',
                    test: 'assert "y" in locals() and y == 5',
                    message: 'Variable y should be equal to 5'
                },
                {
                    input: '',
                    expectedOutput: '',
                    test: 'assert "sum" in locals() and sum == 15',
                    message: 'Variable sum should be equal to the sum of x and y (15)'
                }
            ],
            hints: [
                'Use the = operator for assignment',
                'The + operator adds two numbers together',
                'Make sure to create all three variables: x, y, and sum'
            ]
        }
    ],
    
    strings: [
        {
            id: 'py_str_1',
            title: 'String Concatenation',
            difficulty: 'easy',
            points: 20,
            description: 'Create two variables, first_name and last_name, with your first and last name. Then create a full_name variable that combines them with a space in between.',
            initialCode: '# Create first_name, last_name, and full_name variables\n',
            solution: 'first_name = "John"\nlast_name = "Doe"\nfull_name = first_name + " " + last_name',
            testCases: [
                {
                    input: '',
                    expectedOutput: '',
                    test: 'assert "first_name" in locals() and isinstance(first_name, str)',
                    message: 'Create a first_name variable with a string value'
                },
                {
                    input: '',
                    expectedOutput: '',
                    test: 'assert "last_name" in locals() and isinstance(last_name, str)',
                    message: 'Create a last_name variable with a string value'
                },
                {
                    input: '',
                    expectedOutput: '',
                    test: 'assert "full_name" in locals() and full_name == first_name + " " + last_name',
                    message: 'full_name should be first_name and last_name combined with a space'
                }
            ],
            hints: [
                'Use quotes to create string values',
                'String concatenation uses the + operator',
                'Don\'t forget the space between first and last name'
            ]
        }
    ],
    
    lists: [
        {
            id: 'py_list_1',
            title: 'List Creation',
            difficulty: 'easy',
            points: 25,
            description: 'Create a list named "fruits" containing these items: "apple", "banana", "orange"',
            initialCode: '# Create the fruits list\n',
            solution: 'fruits = ["apple", "banana", "orange"]',
            testCases: [
                {
                    input: '',
                    expectedOutput: '',
                    test: 'assert "fruits" in locals() and isinstance(fruits, list)',
                    message: 'Create a list named fruits'
                },
                {
                    input: '',
                    expectedOutput: '',
                    test: 'assert len(fruits) == 3',
                    message: 'The list should contain exactly 3 items'
                },
                {
                    input: '',
                    expectedOutput: '',
                    test: 'assert fruits == ["apple", "banana", "orange"]',
                    message: 'The list should contain "apple", "banana", "orange" in that order'
                }
            ],
            hints: [
                'Lists are created using square brackets []',
                'List items are separated by commas',
                'String items in the list need to be in quotes'
            ]
        }
    ],
    
    loops: [
        {
            id: 'py_loop_1',
            title: 'For Loop Basics',
            difficulty: 'medium',
            points: 30,
            description: 'Write a for loop that prints numbers from 1 to 5',
            initialCode: '# Write your for loop here\n',
            solution: 'for i in range(1, 6):\n    print(i)',
            testCases: [
                {
                    input: '',
                    expectedOutput: '1\n2\n3\n4\n5\n',
                    test: '',
                    message: 'Your loop should print numbers 1 through 5'
                }
            ],
            hints: [
                'Use the range() function to generate numbers',
                'range(1, 6) generates numbers from 1 to 5',
                'Don\'t forget to indent the print statement'
            ]
        }
    ],
    
    functions: [
        {
            id: 'py_func_1',
            title: 'Simple Function',
            difficulty: 'medium',
            points: 35,
            description: 'Create a function called "greet" that takes a name parameter and returns "Hello, {name}!"',
            initialCode: '# Define the greet function\n',
            solution: 'def greet(name):\n    return f"Hello, {name}!"',
            testCases: [
                {
                    input: 'Alice',
                    expectedOutput: 'Hello, Alice!',
                    test: 'assert greet("Alice") == "Hello, Alice!"',
                    message: 'Function should return "Hello, Alice!" when called with "Alice"'
                },
                {
                    input: 'Bob',
                    expectedOutput: 'Hello, Bob!',
                    test: 'assert greet("Bob") == "Hello, Bob!"',
                    message: 'Function should return "Hello, Bob!" when called with "Bob"'
                }
            ],
            hints: [
                'Use the def keyword to define a function',
                'The function should take one parameter: name',
                'Use f-strings or string concatenation for the return value'
            ]
        }
    ],
    
    dictionaries: [
        {
            id: 'py_dict_1',
            title: 'Dictionary Creation',
            difficulty: 'medium',
            points: 40,
            description: 'Create a dictionary called "person" with keys "name" and "age", having values "John" and 25 respectively',
            initialCode: '# Create the person dictionary\n',
            solution: 'person = {"name": "John", "age": 25}',
            testCases: [
                {
                    input: '',
                    expectedOutput: '',
                    test: 'assert "person" in locals() and isinstance(person, dict)',
                    message: 'Create a dictionary named person'
                },
                {
                    input: '',
                    expectedOutput: '',
                    test: 'assert person["name"] == "John"',
                    message: 'The name should be "John"'
                },
                {
                    input: '',
                    expectedOutput: '',
                    test: 'assert person["age"] == 25',
                    message: 'The age should be 25'
                }
            ],
            hints: [
                'Dictionaries use curly braces {}',
                'Keys and values are separated by colons :',
                'Each key-value pair is separated by commas'
            ]
        }
    ]
};

module.exports = exercises;

class CodeEditor {
    constructor(options = {}) {
        this.options = {
            container: options.container || '#code-editor',
            language: options.language || 'python',
            theme: options.theme || 'vs-dark',
            fontSize: options.fontSize || 14,
            lineNumbers: options.lineNumbers !== false,
            minimap: options.minimap !== false,
            autoSave: options.autoSave !== false,
            autoComplete: options.autoComplete !== false
        };

        this.editor = null;
        this.outputContainer = null;
        this.testResults = null;
        this.currentExercise = null;
        this.init();
    }

    async init() {
        // Load Monaco Editor
        await this.loadMonaco();
        this.createEditor();
        this.setupEventListeners();
        this.setupAutoSave();
    }

    async loadMonaco() {
        if (window.monaco) return;

        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.33.0/min/vs/loader.js';
        document.head.appendChild(script);

        return new Promise(resolve => {
            script.onload = () => {
                require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.33.0/min/vs' } });
                require(['vs/editor/editor.main'], resolve);
            };
        });
    }

    createEditor() {
        this.editor = monaco.editor.create(document.querySelector(this.options.container), {
            language: this.options.language,
            theme: this.options.theme,
            fontSize: this.options.fontSize,
            lineNumbers: this.options.lineNumbers ? 'on' : 'off',
            minimap: { enabled: this.options.minimap },
            automaticLayout: true,
            scrollBeyondLastLine: false,
            renderWhitespace: 'selection',
            suggestOnTriggerCharacters: this.options.autoComplete,
            snippetSuggestions: this.options.autoComplete ? 'inline' : 'none',
            wordBasedSuggestions: this.options.autoComplete,
            parameterHints: { enabled: this.options.autoComplete },
            folding: true,
            bracketPairColorization: true
        });

        // Add custom actions
        this.editor.addAction({
            id: 'run-code',
            label: 'Run Code',
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
            run: () => this.runCode()
        });
    }

    setupEventListeners() {
        // Code change event
        this.editor.onDidChangeModelContent(() => {
            this.onCodeChange();
        });

        // Theme change
        document.addEventListener('theme-change', (e) => {
            this.setTheme(e.detail.theme);
        });

        // Language change
        document.addEventListener('language-change', (e) => {
            this.setLanguage(e.detail.language);
        });
    }

    setupAutoSave() {
        if (!this.options.autoSave) return;

        let saveTimeout;
        this.editor.onDidChangeModelContent(() => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                this.saveCode();
            }, 1000);
        });
    }

    async runCode() {
        try {
            this.showOutput('Running code...');
            
            const code = this.editor.getValue();
            const response = await fetch('/api/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code,
                    language: this.options.language,
                    exerciseId: this.currentExercise?.id
                })
            });

            const result = await response.json();
            
            if (result.error) {
                this.showError(result.error);
                return;
            }

            this.showOutput(result.output);
            
            if (this.currentExercise) {
                this.runTests(code);
            }
        } catch (error) {
            this.showError('Error running code: ' + error.message);
        }
    }

    async runTests(code) {
        try {
            const response = await fetch('/api/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code,
                    exerciseId: this.currentExercise.id,
                    testCases: this.currentExercise.testCases
                })
            });

            const results = await response.json();
            this.showTestResults(results);
        } catch (error) {
            this.showError('Error running tests: ' + error.message);
        }
    }

    showOutput(output) {
        if (!this.outputContainer) {
            this.outputContainer = document.createElement('div');
            this.outputContainer.className = 'output-container';
            document.querySelector(this.options.container).after(this.outputContainer);
        }

        this.outputContainer.innerHTML = `
            <pre class="output">${this.escapeHtml(output)}</pre>
        `;
    }

    showError(error) {
        if (!this.outputContainer) return;
        
        this.outputContainer.innerHTML = `
            <pre class="error">${this.escapeHtml(error)}</pre>
        `;
    }

    showTestResults(results) {
        if (!this.testResults) {
            this.testResults = document.createElement('div');
            this.testResults.className = 'test-results';
            this.outputContainer.after(this.testResults);
        }

        const summary = results.reduce((acc, r) => ({
            passed: acc.passed + (r.passed ? 1 : 0),
            total: acc.total + 1
        }), { passed: 0, total: 0 });

        this.testResults.innerHTML = `
            <div class="test-summary ${summary.passed === summary.total ? 'success' : 'failure'}">
                ${summary.passed}/${summary.total} tests passed
            </div>
            <div class="test-details">
                ${results.map(r => `
                    <div class="test-case ${r.passed ? 'passed' : 'failed'}">
                        <div class="test-header">
                            <span class="test-icon">${r.passed ? '✓' : '✗'}</span>
                            <span class="test-name">Test Case ${r.id}</span>
                        </div>
                        ${!r.passed ? `
                            <div class="test-error">
                                <strong>Expected:</strong> ${this.escapeHtml(r.expected)}
                                <strong>Got:</strong> ${this.escapeHtml(r.actual)}
                                <div class="test-message">${r.message}</div>
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }

    loadExercise(exercise) {
        this.currentExercise = exercise;
        this.editor.setValue(exercise.initialCode || '');
        this.resetOutput();
    }

    resetOutput() {
        if (this.outputContainer) {
            this.outputContainer.innerHTML = '';
        }
        if (this.testResults) {
            this.testResults.innerHTML = '';
        }
    }

    setTheme(theme) {
        monaco.editor.setTheme(theme);
    }

    setLanguage(language) {
        const model = this.editor.getModel();
        monaco.editor.setModelLanguage(model, language);
        this.options.language = language;
    }

    getValue() {
        return this.editor.getValue();
    }

    setValue(code) {
        this.editor.setValue(code);
    }

    saveCode() {
        const code = this.editor.getValue();
        localStorage.setItem('savedCode', code);
    }

    loadSavedCode() {
        const savedCode = localStorage.getItem('savedCode');
        if (savedCode) {
            this.editor.setValue(savedCode);
        }
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    dispose() {
        if (this.editor) {
            this.editor.dispose();
        }
    }
}

// Styles
const styles = `
.output-container {
    margin-top: 1rem;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.8);
    border-radius: 0.5rem;
    font-family: 'Fira Code', monospace;
}

.output {
    margin: 0;
    color: #fff;
    font-size: 0.9rem;
    line-height: 1.5;
}

.error {
    margin: 0;
    color: #ff4444;
    font-size: 0.9rem;
    line-height: 1.5;
}

.test-results {
    margin-top: 1rem;
}

.test-summary {
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
}

.test-summary.success {
    background: rgba(0, 255, 0, 0.1);
    color: #00ff00;
}

.test-summary.failure {
    background: rgba(255, 0, 0, 0.1);
    color: #ff4444;
}

.test-case {
    margin-bottom: 0.5rem;
    padding: 0.5rem;
    border-radius: 0.25rem;
    background: rgba(255, 255, 255, 0.05);
}

.test-case.passed {
    border-left: 3px solid #00ff00;
}

.test-case.failed {
    border-left: 3px solid #ff4444;
}

.test-header {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
}

.test-icon {
    margin-right: 0.5rem;
}

.test-name {
    font-weight: bold;
}

.test-error {
    font-size: 0.9rem;
    color: #ff4444;
    margin-top: 0.5rem;
    padding-left: 1.5rem;
}

.test-message {
    margin-top: 0.25rem;
    color: #888;
}
`;

// Add styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

module.exports = CodeEditor;

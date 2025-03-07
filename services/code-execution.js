const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const Docker = require('dockerode');

class CodeExecutionService {
    constructor() {
        this.docker = new Docker();
        this.supportedLanguages = {
            python: {
                image: 'python:3.9-slim',
                command: ['python'],
                fileExtension: '.py',
                timeout: 10000
            },
            javascript: {
                image: 'node:16-slim',
                command: ['node'],
                fileExtension: '.js',
                timeout: 10000
            },
            java: {
                image: 'openjdk:11-slim',
                command: ['java'],
                fileExtension: '.java',
                timeout: 15000
            }
        };
    }

    async executeCode(code, language, input = '') {
        const langConfig = this.supportedLanguages[language];
        if (!langConfig) {
            throw new Error(`Unsupported language: ${language}`);
        }

        const containerId = await this.createContainer(langConfig.image);
        try {
            return await this.runInContainer(containerId, code, langConfig, input);
        } finally {
            await this.cleanupContainer(containerId);
        }
    }

    async createContainer(image) {
        // Pull image if not exists
        await new Promise((resolve, reject) => {
            this.docker.pull(image, (err, stream) => {
                if (err) reject(err);
                this.docker.modem.followProgress(stream, (err) => {
                    if (err) reject(err);
                    resolve();
                });
            });
        });

        // Create container
        const container = await this.docker.createContainer({
            Image: image,
            AttachStdin: true,
            AttachStdout: true,
            AttachStderr: true,
            OpenStdin: true,
            StdinOnce: false,
            Tty: true,
            WorkingDir: '/app',
            HostConfig: {
                Memory: 512 * 1024 * 1024, // 512MB
                MemorySwap: 512 * 1024 * 1024,
                CpuPeriod: 100000,
                CpuQuota: 50000,
                NetworkMode: 'none'
            }
        });

        await container.start();
        return container.id;
    }

    async runInContainer(containerId, code, langConfig, input) {
        const container = this.docker.getContainer(containerId);
        const fileName = `main${langConfig.fileExtension}`;

        // Write code to container
        const exec = await container.exec({
            Cmd: ['sh', '-c', `echo '${code.replace(/'/g, "'\\''")}' > ${fileName}`],
            AttachStdout: true,
            AttachStderr: true
        });

        await new Promise((resolve, reject) => {
            exec.start((err, stream) => {
                if (err) reject(err);
                stream.on('end', resolve);
            });
        });

        // Execute code
        const execution = await container.exec({
            Cmd: [...langConfig.command, fileName],
            AttachStdout: true,
            AttachStderr: true
        });

        return new Promise((resolve, reject) => {
            let output = '';
            let error = '';

            const timeout = setTimeout(() => {
                reject(new Error('Execution timed out'));
            }, langConfig.timeout);

            execution.start((err, stream) => {
                if (err) {
                    clearTimeout(timeout);
                    reject(err);
                    return;
                }

                stream.on('data', (data) => {
                    output += data.toString();
                });

                stream.on('error', (data) => {
                    error += data.toString();
                });

                stream.on('end', () => {
                    clearTimeout(timeout);
                    if (error) {
                        reject(new Error(error));
                    } else {
                        resolve(output);
                    }
                });

                if (input) {
                    stream.write(input);
                    stream.end();
                }
            });
        });
    }

    async cleanupContainer(containerId) {
        try {
            const container = this.docker.getContainer(containerId);
            await container.stop();
            await container.remove();
        } catch (error) {
            console.error('Error cleaning up container:', error);
        }
    }

    async runTests(code, language, testCases) {
        const results = [];
        for (const test of testCases) {
            try {
                const output = await this.executeCode(code, language, test.input);
                const passed = this.compareOutput(output.trim(), test.expectedOutput.trim());
                results.push({
                    id: test.id,
                    passed,
                    expected: test.expectedOutput,
                    actual: output,
                    message: passed ? 'Test passed!' : test.message
                });
            } catch (error) {
                results.push({
                    id: test.id,
                    passed: false,
                    expected: test.expectedOutput,
                    actual: error.message,
                    message: 'Error executing test: ' + error.message
                });
            }
        }
        return results;
    }

    compareOutput(actual, expected) {
        // Normalize line endings
        actual = actual.replace(/\r\n/g, '\n');
        expected = expected.replace(/\r\n/g, '\n');
        return actual === expected;
    }
}

// Singleton instance
const codeExecutionService = new CodeExecutionService();

module.exports = codeExecutionService;

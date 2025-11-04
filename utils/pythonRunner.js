// utils/pythonRunner.js
import { spawn } from 'child_process';
import path from 'path';

const projectRoot = path.resolve(); 
const PYTHON_CMD = process.env.PYTHON_CMD || 'python3'; 
// 🎯 FIXED: Changed 'parser.py' to 'resume_analyzer.py'
const pythonScriptPath = path.join(projectRoot, 'resume_analyzer.py'); 

/**
 * Executes the Python resume parsing script using child_process.spawn.
 * @param {string} resumeFilePath The path to the uploaded file.
 * @returns {Promise<object>} The parsed JSON data from the Python script.
 */
export async function extractResumeDataWithPython(resumeFilePath) {
    return new Promise((resolve, reject) => {
        
        // 1. Spawn the Python process
        const pythonProcess = spawn(PYTHON_CMD, [
            pythonScriptPath,
            resumeFilePath 
        ]);

        let rawData = '';
        let errorOutput = '';

        // Capture stdout (Python's JSON output)
        pythonProcess.stdout.on('data', (data) => {
            rawData += data.toString();
        });

        // Capture stderr (Python runtime errors)
        pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });
        
        // 2. Handle Process Exit
        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`Python script failed (Code ${code}). Stderr: ${errorOutput}`);
                return reject(new Error(`Python process failed: ${errorOutput}`));
            }
            
            try {
                // Safely extract the last JSON object from the output
                const jsonMatch = rawData.trim().match(/({[\s\S]*})$/);
            
                if (!jsonMatch) {
                    console.error("Failed to find valid JSON in Python output:", rawData);
                    return reject(new Error(`Invalid output from parser. Raw: ${rawData}`));
                }

                const result = JSON.parse(jsonMatch[1]);
                
                if (result.success === false) {
                     return reject(new Error(result.error || "Python script reported an internal error."));
                }
                
                resolve(result.data); 

            } catch (e) {
                console.error("Failed to parse Python output as JSON:", rawData);
                reject(new Error(`Invalid output from parser: ${e.message}. Raw: ${rawData}`));
            }
        });
        
        // 4. Handle spawn errors (e.g., 'python3' command not found)
        pythonProcess.on('error', (err) => {
            reject(new Error(`Failed to start Python process: ${err.message}. Is '${PYTHON_CMD}' in your PATH or correctly set via PYTHON_CMD?`));
        });
    });
}
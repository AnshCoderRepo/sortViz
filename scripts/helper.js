"use strict";
class Helper {
    constructor(time, list = [], cancelRef) {
        this.time = parseInt(400/time);
        this.list = list;
        this.cancelRef = cancelRef;
        this.stepHistory = [];
        this.currentStepIndex = -1;
        this.isPaused = false;
        this.stepLog = document.getElementById('stepLog');
    }

    // Add step to history and log
    addStep(type, index1, index2, value1, value2, description) {
        const step = {
            type,
            index1,
            index2,
            value1,
            value2,
            description,
            timestamp: Date.now()
        };
        
        this.stepHistory.push(step);
        this.currentStepIndex = this.stepHistory.length - 1;
        this.logStep(step);
    }

    // Log step to the UI
    logStep(step) {
        if (!this.stepLog) return;
        
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${step.type}`;
        
        let logText = '';
        switch(step.type) {
            case 'comparison':
                logText = `Comparing index ${step.index1} (${step.value1}) with index ${step.index2} (${step.value2})`;
                break;
            case 'swap':
                logText = `Swapping index ${step.index1} (${step.value1}) with index ${step.index2} (${step.value2})`;
                break;
            case 'done':
                logText = step.description;
                break;
            default:
                logText = step.description;
        }
        
        logEntry.textContent = logText;
        this.stepLog.appendChild(logEntry);
        this.stepLog.scrollTop = this.stepLog.scrollHeight;
    }

    // Clear step log
    clearLog() {
        if (this.stepLog) {
            this.stepLog.innerHTML = '';
        }
        this.stepHistory = [];
        this.currentStepIndex = -1;
    }

    // Export step log
    exportLog() {
        const logText = this.stepHistory.map(step => {
            let text = '';
            switch(step.type) {
                case 'comparison':
                    text = `Comparing index ${step.index1} (${step.value1}) with index ${step.index2} (${step.value2})`;
                    break;
                case 'swap':
                    text = `Swapping index ${step.index1} (${step.value1}) with index ${step.index2} (${step.value2})`;
                    break;
                case 'done':
                    text = step.description;
                    break;
                default:
                    text = step.description;
            }
            return text;
        }).join('\n');
        
        const blob = new Blob([logText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sorting-log.txt';
        a.click();
        URL.revokeObjectURL(url);
    }

    // Check if paused
    isPaused() {
        return this.isPaused;
    }

    // Set pause state
    setPaused(paused) {
        this.isPaused = paused;
    }

    // Get current step
    getCurrentStep() {
        return this.currentStepIndex >= 0 ? this.stepHistory[this.currentStepIndex] : null;
    }

    // Go to previous step
    stepBack() {
        if (this.currentStepIndex > 0) {
            this.currentStepIndex--;
            return this.stepHistory[this.currentStepIndex];
        }
        return null;
    }

    // Go to next step
    stepForward() {
        if (this.currentStepIndex < this.stepHistory.length - 1) {
            this.currentStepIndex++;
            return this.stepHistory[this.currentStepIndex];
        }
        return null;
    }

    // Reset to initial state
    reset() {
        this.currentStepIndex = -1;
        this.isPaused = false;
        // Restore original array state
        this.restoreArrayState();
    }

    // Restore array to initial state
    restoreArrayState() {
        // This would need to be implemented based on the original array
        // For now, we'll just clear the visual states
        this.list.forEach(cell => {
            cell.setAttribute("class", "cell");
        });
    }

    mark = async (index) => {
        this.list[index].setAttribute("class", "cell current");
    }

    markSpl = async (index) => {
        this.list[index].setAttribute("class", "cell min");
    }

    unmark = async (index) => {
        this.list[index].setAttribute("class", "cell");
    }
    
    pause = async() => {
        if (this.cancelRef && this.cancelRef.cancelled) throw new Error("cancelled");
        if (this.isPaused) {
            // Wait until unpaused
            while (this.isPaused && !this.cancelRef.cancelled) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, this.time);
        });
    }

    compare = async (index1, index2) => {
        await this.pause();
        let value1 = Number(this.list[index1].getAttribute("value"));
        let value2 = Number(this.list[index2].getAttribute("value"));
        
        // Log the comparison
        this.addStep('comparison', index1, index2, value1, value2, 
            `Comparing ${value1} with ${value2}`);
        
        if(value1 > value2) {
            return true;
        }
        return false;
    }

    swap = async (index1, index2) => {
        await this.pause();
        let value1 = this.list[index1].getAttribute("value");
        let value2 = this.list[index2].getAttribute("value");
        
        // Log the swap
        this.addStep('swap', index1, index2, value1, value2, 
            `Swapped ${value1} with ${value2}`);
        
        this.list[index1].setAttribute("value", value2);
        this.list[index1].style.height = `${3.8*value2}px`;
        this.list[index2].setAttribute("value", value1);
        this.list[index2].style.height = `${3.8*value1}px`;
    }

    // Mark array as done
    markDone = (index) => {
        this.list[index].setAttribute("class", "cell done");
        this.addStep('done', index, null, null, null, `Element at index ${index} is in final position`);
    }

    // Mark all as done
    markAllDone = () => {
        for(let i = 0; i < this.list.length; i++) {
            this.list[i].setAttribute("class", "cell done");
        }
        this.addStep('done', null, null, null, null, 'Sorting completed!');
    }

    // Log sorting start
    logSortingStart = (algorithmName) => {
        this.addStep('info', null, null, null, null, `Starting ${algorithmName}...`);
    }

    // Log array state
    logArrayState = () => {
        const values = Array.from(this.list).map(cell => cell.getAttribute("value"));
        this.addStep('info', null, null, null, null, `Array: [${values.join(', ')}]`);
    }
};

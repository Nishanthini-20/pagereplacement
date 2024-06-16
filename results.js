const pages = JSON.parse(localStorage.getItem('pages'));
const capacity = parseInt(localStorage.getItem('capacity'));

const fifoTable = document.getElementById('fifoTable').getElementsByTagName('tbody')[0];
const lruTable = document.getElementById('lruTable').getElementsByTagName('tbody')[0];
const optimalTable = document.getElementById('optimalTable').getElementsByTagName('tbody')[0];

const fifoFaults = document.getElementById('fifoFaults');
const lruFaults = document.getElementById('lruFaults');
const optimalFaults = document.getElementById('optimalFaults');

runAlgorithm(fifoPageReplacement, fifoTable, fifoFaults);
runAlgorithm(lruPageReplacement, lruTable, lruFaults);
runAlgorithm(optimalPageReplacement, optimalTable, optimalFaults);

function runAlgorithm(algorithm, table, faultElement) {
    const result = algorithm(pages, capacity);
    let pageFaults = 0;
    result.forEach(entry => {
        if (entry.fault) pageFaults++;
        const row = table.insertRow();
        const cell1 = row.insertCell(0);
        const cell2 = row.insertCell(1);
        const cell3 = row.insertCell(2);
        cell1.textContent = entry.page;
        cell2.textContent = `[${entry.memory.join(', ')}]`;
        if (entry.fault) {
            cell3.textContent = 'Yes';
            cell3.classList.add('yes');
        } else {
            cell3.textContent = 'No';
            cell3.classList.add('no');
        }
    });
    faultElement.textContent = `Page Faults: ${pageFaults}`;
}

function fifoPageReplacement(pages, capacity) {
    let memory = [];
    let result = [];
    let pageFaults = 0;

    pages.forEach(page => {
        let fault = false;
        if (!memory.includes(page)) {
            pageFaults++;
            fault = true;
            if (memory.length < capacity) {
                memory.push(page);
            } else {
                memory.shift();
                memory.push(page);
            }
        }
        result.push({ page: page, memory: [...memory], fault });
    });

    return result;
}

function lruPageReplacement(pages, capacity) {
    let memory = [];
    let pageOrder = [];
    let result = [];
    let pageFaults = 0;

    pages.forEach(page => {
        let fault = false;
        if (!memory.includes(page)) {
            pageFaults++;
            fault = true;
            if (memory.length < capacity) {
                memory.push(page);
                pageOrder.push(page);
            } else {
                const lruPage = pageOrder.shift();
                memory.splice(memory.indexOf(lruPage), 1);
                memory.push(page);
                pageOrder.push(page);
            }
        } else {
            pageOrder.splice(pageOrder.indexOf(page), 1);
            pageOrder.push(page);
        }
        result.push({ page: page, memory: [...memory], fault });
    });

    return result;
}

function search(key, fr) {
    return fr.includes(key);
}

function predict(pg, fr, pn, index) {
    let res = -1;
    let farthest = index;
    for (let i = 0; i < fr.length; i++) {
        let j;
        for (j = index; j < pn; j++) {
            if (fr[i] === pg[j]) {
                if (j > farthest) {
                    farthest = j;
                    res = i;
                }
                break;
            }
        }
        if (j === pn) {
            return i;
        }
    }
    return res === -1 ? 0 : res;
}

function optimalPageReplacement(pg, capacity) {
    const pn = pg.length;
    let fr = [];
    let result = [];
    let hit = 0;
    let miss = 0;

    for (let i = 0; i < pn; i++) {
        let fault = false;
        if (search(pg[i], fr)) {
            hit++;
        } else {
            miss++;
            fault = true;
            if (fr.length < capacity) {
                fr.push(pg[i]);
            } else {
                const j = predict(pg, fr, pn, i + 1);
                fr[j] = pg[i];
            }
        }
        result.push({ page: pg[i], memory: [...fr], fault });
    }

    console.log("No. of hits =", hit);
    console.log("No. of misses =", miss);

    return result;
}

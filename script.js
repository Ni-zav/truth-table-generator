document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('truthTableForm');
    const statementInput = document.getElementById('statement');
    const resultDiv = document.getElementById('result');
    const symbolOutputDiv = document.getElementById('symbolOutput');
    const truthTableOutputDiv = document.getElementById('truthTableOutput');
    const refreshBtn = document.getElementById('refreshBtn');

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const statement = statementInput.value.trim();
        if (statement === "") {
            alert("Please enter a statement.");
            return;
        }
        generateTruthTable(statement);
    });


    // Clear input and reset form when refresh button is clicked
    refreshBtn.addEventListener('click', function () {
        resetForm();
    });

    // Handle Download Button click
    downloadBtn.addEventListener('click', function () {
        downloadTableAsCSV();
    });

    // Intercept F5 key press and perform custom refresh behavior
    window.addEventListener('keydown', function (e) {
        if (e.key === 'F5') {
            e.preventDefault(); // Prevent the default F5 reload action
            resetForm(); // Call the custom form reset function
        }
    });

    // Function to reset the form (same as refresh button)
    function resetForm() {
        statementInput.value = '';
        symbolOutputDiv.innerHTML = '';
        truthTableOutputDiv.innerHTML = '';
        resultDiv.classList.add('hidden');
        statementInput.focus(); // Focus on the input field
    }


function generateTruthTable(statement) {
    // Clear previous results
    symbolOutputDiv.innerHTML = '';
    truthTableOutputDiv.innerHTML = '';

    // Normalize the statement to handle both symbols and words
    statement = normalizeStatement(statement);

    // Extract variables (A-Z)
    const variables = [...new Set(statement.match(/[A-Za-z]/g))];

    if (variables.length === 0) {
        alert("No valid variables found.");
        return;
    }

    // Create all possible truth value combinations
    const combinations = generateCombinations(variables.length);

    // Display symbols/variables
    symbolOutputDiv.innerHTML = 'Symbols: ' + variables.join(', ');

    // Create a table for truth table
    const table = document.createElement('table');
    const headerRow = document.createElement('tr');

    // Add headers (variables + statement)
    variables.forEach(variable => {
        const th = document.createElement('th');
        th.innerText = variable;
        headerRow.appendChild(th);
    });
    const thResult = document.createElement('th');
    thResult.innerText = statement;
    headerRow.appendChild(thResult);
    table.appendChild(headerRow);

    // Process each combination and evaluate the statement
    combinations.forEach(combination => {
        const tr = document.createElement('tr');

        // Create an environment where each variable can be substituted with the truth values
        const env = {};
        variables.forEach((variable, index) => {
            env[variable] = combination[index];
            const td = document.createElement('td');
            td.innerText = combination[index];
            tr.appendChild(td);
        });


        // Evaluate the expression

        const result = evaluateStatement(statement, env);
        const tdResult = document.createElement('td');
        tdResult.innerText = result ? 1 : 0;
        tr.appendChild(tdResult);
        table.appendChild(tr);
    });

    truthTableOutputDiv.appendChild(table);
    resultDiv.classList.remove('hidden');
}

// Function to generate truth table combinations (binary)
function generateCombinations(n) {
    const total = Math.pow(2, n);
    const combinations = [];
    for (let i = 0; i < total; i++) {
        const binaryString = i.toString(2).padStart(n, '0');
        combinations.push(binaryString.split('').map(Number));
    }
    return combinations;
}

    // Function to evaluate the statement
    function evaluateStatement(statement, env) {
        let expr = statement;

        // Replace variables with their truth values
        Object.keys(env).forEach(variable => {
            const regex = new RegExp(`\\b${variable}\\b`, `gi`);
            expr = expr.replace(regex, env[variable]);
        });

        expr = expr.replace(/\*/g, '&&')
            .replace(/\bAND\b/gi, '&&')
            .replace(/\+/g, '||')
            .replace(/\bOR\b/gi, '||')
            .replace(/'/g, '!')
            .replace(/\bNOT\b/gi, '!')
            .replace(/=/g, '==')
            .replace(/\bIMPLIES\b/gi, '||')
            .replace(/\bNAND\b/gi, '!($& && ')
            .replace(/\bNOR\b/gi, '!($& || )')
            .replace(/\)/g, ')');

        try {
            return eval(expr); // Safely evaluate the expression
        } catch (error) {
            return false;
        }
    }
    // Function to normalize the statement, replacing word-based operators with symbols
    function normalizeStatement(statement) {
        return statement
            .replace(/\bAND\b/gi, '*')        // Replace AND with *
            .replace(/\bOR\b/gi, '+')         // Replace OR with +
            .replace(/\bNOT\b/gi, "'")        // Replace NOT with '
            .replace(/\bIMPLIES\b/gi, '=');   // Replace IMPLIES with =
    }
    function downloadTableAsCSV() {
        let csvContent = '';
        const rows = truthTableOutputDiv.querySelectorAll('table tr');
        
        rows.forEach(row => {
            const cols = row.querySelectorAll('td, th');
            const csvRow = Array.from(cols).map(col => col.innerText).join(',');
            csvContent += csvRow + '\n';
        });

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', 'truth_table.csv');
        a.click();
    }

});


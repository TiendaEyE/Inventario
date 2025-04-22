// history.js - Manejo del historial de transacciones

function getHistory() {
    return JSON.parse(localStorage.getItem('history')) || [];
}

function getUsersFromHistory() {
    const history = getHistory();
    const users = new Set();
    
    history.forEach(record => {
        users.add(record.username);
    });
    
    return Array.from(users);
}

function renderHistory(filterUser = '', filterDate = '') {
    const history = getHistory();
    const tableBody = document.getElementById('historyTableBody');
    
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    // Filtrar historial
    let filteredHistory = [...history];
    
    if (filterUser) {
        filteredHistory = filteredHistory.filter(record => record.username === filterUser);
    }
    
    if (filterDate) {
        filteredHistory = filteredHistory.filter(record => {
            const recordDate = new Date(record.timestamp).toISOString().split('T')[0];
            return recordDate === filterDate;
        });
    }
    
    // Ordenar por fecha (más reciente primero)
    filteredHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Mostrar en la tabla
    filteredHistory.forEach(record => {
        const row = document.createElement('tr');
        const date = new Date(record.timestamp);
        
        // Traducir el tipo de acción
        let actionType = '';
        switch (record.action) {
            case 'ADD': actionType = 'Agregar'; break;
            case 'UPDATE': actionType = 'Actualizar'; break;
            case 'DELETE': actionType = 'Eliminar'; break;
            case 'INCREMENT': actionType = 'Incrementar'; break;
            case 'DECREMENT': actionType = 'Reducir'; break;
            default: actionType = record.action;
        }
        
        row.innerHTML = `
            <td>${date.toLocaleString()}</td>
            <td>${record.username}</td>
            <td>${record.productName} (ID: ${record.productId})</td>
            <td>${actionType}</td>
            <td>${record.action === 'INCREMENT' || record.action === 'DECREMENT' ? 
                Math.abs(record.newQuantity - record.oldQuantity) : '-'}</td>
            <td>${record.oldQuantity}</td>
            <td>${record.newQuantity}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

function populateUserFilter() {
    const users = getUsersFromHistory();
    const filterSelect = document.getElementById('filterUser');
    
    if (!filterSelect) return;
    
    // Limpiar opciones excepto la primera ("Todos")
    while (filterSelect.options.length > 1) {
        filterSelect.remove(1);
    }
    
    // Agregar usuarios
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user;
        option.textContent = user;
        filterSelect.appendChild(option);
    });
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('historyTableBody')) {
        populateUserFilter();
        renderHistory();
        
        // Filtros
        const applyFiltersBtn = document.getElementById('applyFilters');
        const resetFiltersBtn = document.getElementById('resetFilters');
        
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', function() {
                const userFilter = document.getElementById('filterUser').value;
                const dateFilter = document.getElementById('filterDate').value;
                renderHistory(userFilter, dateFilter);
            });
        }
        
        if (resetFiltersBtn) {
            resetFiltersBtn.addEventListener('click', function() {
                document.getElementById('filterUser').value = '';
                document.getElementById('filterDate').value = '';
                renderHistory();
            });
        }
    }
});
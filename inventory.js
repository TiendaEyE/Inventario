// inventory.js - Versión corregida con búsqueda funcional

// Inicializar inventario si no existe
if (!localStorage.getItem('inventory')) {
    const initialInventory = [
        { id: 1, name: 'Croquetas para perro adulto', category: 'Perro', quantity: 50, price: 350.00 },
        { id: 2, name: 'Croquetas para gato adulto', category: 'Gato', quantity: 30, price: 280.00 },
        { id: 3, name: 'Snacks para perro', category: 'Perro', quantity: 100, price: 120.00 }
    ];
    localStorage.setItem('inventory', JSON.stringify(initialInventory));
}

// Inicializar historial si no existe
if (!localStorage.getItem('history')) {
    localStorage.setItem('history', JSON.stringify([]));
}

// Funciones del inventario
function getInventory() {
    try {
        const inventory = localStorage.getItem('inventory');
        return inventory ? JSON.parse(inventory) : [];
    } catch (e) {
        console.error('Error al obtener inventario:', e);
        return [];
    }
}

function saveInventory(inventory) {
    try {
        localStorage.setItem('inventory', JSON.stringify(inventory));
    } catch (e) {
        console.error('Error al guardar inventario:', e);
    }
}

function addToHistory(action, productId, productName, oldQuantity, newQuantity) {
    try {
        const history = JSON.parse(localStorage.getItem('history')) || [];
        const currentUser = localStorage.getItem('currentUser') || 'Sistema';
        const timestamp = new Date().toISOString();
        
        history.push({
            timestamp,
            username: currentUser,
            productId,
            productName,
            action,
            oldQuantity,
            newQuantity
        });
        
        localStorage.setItem('history', JSON.stringify(history));
    } catch (e) {
        console.error('Error al agregar al historial:', e);
    }
}

// Función de búsqueda corregida
function searchProducts(searchTerm) {
    try {
        const inventory = getInventory();
        if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim() === '') {
            return inventory;
        }
        
        const searchTermLower = searchTerm.toLowerCase().trim();
        
        return inventory.filter(product => {
            if (!product || typeof product !== 'object') return false;
            
            const nameMatch = product.name && 
                            typeof product.name === 'string' && 
                            product.name.toLowerCase().includes(searchTermLower);
            
            const categoryMatch = product.category && 
                                typeof product.category === 'string' && 
                                product.category.toLowerCase().includes(searchTermLower);
            
            const idMatch = product.id && 
                          product.id.toString().includes(searchTerm.trim());
            
            return nameMatch || categoryMatch || idMatch;
        });
    } catch (e) {
        console.error('Error en la búsqueda:', e);
        return [];
    }
}

function renderSearchResults(results) {
    const tableBody = document.getElementById('inventoryTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (!results || results.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="6" class="no-results">
                No se encontraron productos que coincidan con la búsqueda
            </td>
        `;
        tableBody.appendChild(row);
        return;
    }
    
    results.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>${product.quantity}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>
                <div class="action-buttons-table">
                    <button class="action-btn edit-btn" data-id="${product.id}">Editar</button>
                    <button class="action-btn delete-btn" data-id="${product.id}">Eliminar</button>
                    <button class="action-btn increment-btn" data-id="${product.id}">+</button>
                    <button class="action-btn decrement-btn" data-id="${product.id}">-</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    assignEventListeners();
}

function renderInventory() {
    renderSearchResults(getInventory());
}

// Funciones CRUD
function addProduct(product) {
    try {
        const inventory = getInventory();
        const newId = inventory.length > 0 ? Math.max(...inventory.map(p => p.id)) + 1 : 1;
        
        const newProduct = {
            id: newId,
            name: product.name,
            category: product.category,
            quantity: parseInt(product.quantity),
            price: parseFloat(product.price)
        };
        
        inventory.push(newProduct);
        saveInventory(inventory);
        
        addToHistory('ADD', newId, product.name, 0, product.quantity);
        
        return newProduct;
    } catch (e) {
        console.error('Error al agregar producto:', e);
        return null;
    }
}

function updateProduct(id, updatedProduct) {
    try {
        const inventory = getInventory();
        const index = inventory.findIndex(p => p.id === id);
        
        if (index === -1) return null;
        
        const oldQuantity = inventory[index].quantity;
        
        inventory[index] = {
            ...inventory[index],
            name: updatedProduct.name,
            category: updatedProduct.category,
            quantity: parseInt(updatedProduct.quantity),
            price: parseFloat(updatedProduct.price)
        };
        
        saveInventory(inventory);
        
        if (oldQuantity !== parseInt(updatedProduct.quantity)) {
            addToHistory('UPDATE', id, updatedProduct.name, oldQuantity, updatedProduct.quantity);
        }
        
        return inventory[index];
    } catch (e) {
        console.error('Error al actualizar producto:', e);
        return null;
    }
}

function deleteProduct(id) {
    try {
        const inventory = getInventory();
        const index = inventory.findIndex(p => p.id === id);
        
        if (index === -1) return false;
        
        const deletedProduct = inventory[index];
        inventory.splice(index, 1);
        saveInventory(inventory);
        
        addToHistory('DELETE', id, deletedProduct.name, deletedProduct.quantity, 0);
        
        return true;
    } catch (e) {
        console.error('Error al eliminar producto:', e);
        return false;
    }
}

function adjustQuantity(id, amount) {
    try {
        const inventory = getInventory();
        const index = inventory.findIndex(p => p.id === id);
        
        if (index === -1) return null;
        
        const oldQuantity = inventory[index].quantity;
        const newQuantity = oldQuantity + amount;
        
        if (newQuantity < 0) return null;
        
        inventory[index].quantity = newQuantity;
        saveInventory(inventory);
        
        const action = amount > 0 ? 'INCREMENT' : 'DECREMENT';
        addToHistory(action, id, inventory[index].name, oldQuantity, newQuantity);
        
        return inventory[index];
    } catch (e) {
        console.error('Error al ajustar cantidad:', e);
        return null;
    }
}

// Manejo del modal
function openAddModal() {
    try {
        const modal = document.getElementById('productModal');
        const modalTitle = document.getElementById('modalTitle');
        const productForm = document.getElementById('productForm');
        
        modalTitle.textContent = 'Agregar Nuevo Producto';
        productForm.reset();
        document.getElementById('productId').value = '';
        modal.classList.remove('hidden');
    } catch (e) {
        console.error('Error al abrir modal:', e);
    }
}

function openEditModal(productId) {
    try {
        const modal = document.getElementById('productModal');
        const modalTitle = document.getElementById('modalTitle');
        const productForm = document.getElementById('productForm');
        const inventory = getInventory();
        const product = inventory.find(p => p.id === productId);
        
        if (!product) return;
        
        modalTitle.textContent = 'Editar Producto';
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productQuantity').value = product.quantity;
        document.getElementById('productPrice').value = product.price;
        modal.classList.remove('hidden');
    } catch (e) {
        console.error('Error al abrir modal de edición:', e);
    }
}

function closeModal() {
    try {
        const modal = document.getElementById('productModal');
        modal.classList.add('hidden');
    } catch (e) {
        console.error('Error al cerrar modal:', e);
    }
}

function handleProductFormSubmit(e) {
    try {
        e.preventDefault();
        
        const productId = document.getElementById('productId').value;
        const product = {
            name: document.getElementById('productName').value,
            category: document.getElementById('productCategory').value,
            quantity: document.getElementById('productQuantity').value,
            price: document.getElementById('productPrice').value
        };
        
        if (productId) {
            updateProduct(parseInt(productId), product);
        } else {
            addProduct(product);
        }
        
        closeModal();
        renderInventory();
    } catch (e) {
        console.error('Error en envío de formulario:', e);
    }
}

// Asignación de event listeners
function assignEventListeners() {
    // Botones de editar
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            openEditModal(productId);
        });
    });
    
    // Botones de eliminar
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            if (confirm('¿Estás seguro de eliminar este producto?')) {
                deleteProduct(productId);
                renderInventory();
            }
        });
    });
    
    // Botones de incrementar
    document.querySelectorAll('.increment-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            const amount = parseInt(prompt('Ingrese la cantidad a agregar:', '1')) || 0;
            if (amount > 0) {
                adjustQuantity(productId, amount);
                renderInventory();
            }
        });
    });
    
    // Botones de decrementar
    document.querySelectorAll('.decrement-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            const amount = parseInt(prompt('Ingrese la cantidad a reducir:', '1')) || 0;
            if (amount > 0) {
                adjustQuantity(productId, -amount);
                renderInventory();
            }
        });
    });
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    // Renderizar inventario inicial
    renderInventory();
    
    // Modal events
    document.getElementById('addProductBtn')?.addEventListener('click', openAddModal);
    document.querySelector('.close-btn')?.addEventListener('click', closeModal);
    document.getElementById('productModal')?.addEventListener('click', function(e) {
        if (e.target === document.getElementById('productModal')) {
            closeModal();
        }
    });
    document.getElementById('productForm')?.addEventListener('submit', handleProductFormSubmit);
    
    // Configuración mejorada de la búsqueda
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const clearSearchButton = document.getElementById('clearSearch');
    
    const performSearch = () => {
        const searchTerm = searchInput.value;
        const results = searchProducts(searchTerm);
        renderSearchResults(results);
    };
    
    if (searchButton) {
        searchButton.addEventListener('click', performSearch);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    if (clearSearchButton) {
        clearSearchButton.addEventListener('click', function() {
            searchInput.value = '';
            renderInventory();
        });
    }
});
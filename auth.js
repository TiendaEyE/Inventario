// auth.js - Versión final corregida para el error toLowerCase

// 1. Inicialización segura de datos
function initializeAuthData() {
    // Verificar y crear usuarios si no existen
    if (!localStorage.getItem('users')) {
        const initialUsers = [
            { username: 'admin', password: 'admin123' }
        ];
        localStorage.setItem('users', JSON.stringify(initialUsers));
    }
    
    // Verificar y crear currentUser si no existe
    if (!localStorage.getItem('currentUser')) {
        localStorage.setItem('currentUser', '');
    }
}

// Llamar a la inicialización al cargar
initializeAuthData();

// 2. Función de registro completamente protegida
function registerUser(username, password) {
    try {
        // Validación exhaustiva de parámetros
        if (typeof username !== 'string' || typeof password !== 'string') {
            throw new Error('Datos de registro inválidos');
        }
        
        username = username.trim();
        password = password.trim();
        
        if (!username) {
            throw new Error('El usuario no puede estar vacío');
        }
        
        if (!password) {
            throw new Error('La contraseña no puede estar vacía');
        }
        
        if (username.length < 4) {
            throw new Error('El usuario debe tener al menos 4 caracteres');
        }
        
        if (password.length < 6) {
            throw new Error('La contraseña debe tener al menos 6 caracteres');
        }
        
        // Obtener usuarios con manejo seguro
        let users = [];
        try {
            const usersData = localStorage.getItem('users');
            users = usersData ? JSON.parse(usersData) : [];
        } catch (e) {
            console.error('Error al leer usuarios:', e);
            users = [];
        }
        
        // Verificar si el usuario existe (con protección completa)
        const userExists = users.some(user => {
            try {
                return user && 
                       user.username && 
                       typeof user.username === 'string' && 
                       user.username.toLowerCase() === username.toLowerCase();
            } catch (e) {
                console.error('Error al comparar usuarios:', e);
                return false;
            }
        });
        
        if (userExists) {
            throw new Error('El usuario ya existe');
        }
        
        // Agregar nuevo usuario con verificación
        const newUser = { username, password };
        users.push(newUser);
        
        try {
            localStorage.setItem('users', JSON.stringify(users));
            return { success: true, message: 'Registro exitoso' };
        } catch (e) {
            console.error('Error al guardar usuario:', e);
            throw new Error('Error al guardar el registro');
        }
    } catch (error) {
        console.error('Error en registerUser:', error);
        return { success: false, message: error.message };
    }
}

// 3. Función de login protegida
function loginUser(username, password) {
    try {
        if (typeof username !== 'string' || typeof password !== 'string') {
            throw new Error('Datos de login inválidos');
        }
        
        username = username.trim();
        password = password.trim();
        
        // Obtener usuarios con manejo seguro
        let users = [];
        try {
            const usersData = localStorage.getItem('users');
            users = usersData ? JSON.parse(usersData) : [];
        } catch (e) {
            console.error('Error al leer usuarios:', e);
            users = [];
        }
        
        // Buscar usuario con protección completa
        const user = users.find(user => {
            try {
                return user && 
                       user.username && 
                       typeof user.username === 'string' &&
                       user.password && 
                       typeof user.password === 'string' &&
                       user.username.toLowerCase() === username.toLowerCase() && 
                       user.password === password;
            } catch (e) {
                console.error('Error al buscar usuario:', e);
                return false;
            }
        });
        
        if (user) {
            localStorage.setItem('currentUser', user.username);
            return { success: true, message: 'Login exitoso' };
        } else {
            throw new Error('Usuario o contraseña incorrectos');
        }
    } catch (error) {
        console.error('Error en loginUser:', error);
        return { success: false, message: error.message };
    }
}

// 4. Función de logout
function logoutUser() {
    localStorage.setItem('currentUser', '');
    window.location.href = 'index.html';
}

// 5. Verificación de autenticación
function checkAuth() {
    try {
        const currentUser = localStorage.getItem('currentUser');
        const isLoginPage = window.location.pathname.includes('index.html');
        
        if (!currentUser && !isLoginPage) {
            window.location.href = 'index.html';
        }
        
        if (currentUser) {
            const userElement = document.getElementById('currentUser');
            if (userElement) {
                userElement.textContent = `Usuario: ${currentUser}`;
            }
        }
    } catch (e) {
        console.error('Error en checkAuth:', e);
    }
}

// 6. Manejadores de eventos
document.addEventListener('DOMContentLoaded', function() {
    // Configuración de formularios
    const setupFormToggle = () => {
        const showRegister = document.getElementById('showRegister');
        const showLogin = document.getElementById('showLogin');
        
        if (showRegister && showLogin) {
            showRegister.addEventListener('click', function(e) {
                e.preventDefault();
                document.getElementById('loginForm').classList.add('hidden');
                document.getElementById('registerForm').classList.remove('hidden');
                clearMessages();
            });
            
            showLogin.addEventListener('click', function(e) {
                e.preventDefault();
                document.getElementById('registerForm').classList.add('hidden');
                document.getElementById('loginForm').classList.remove('hidden');
                clearMessages();
            });
        }
    };
    
    // Configuración de login
    const setupLogin = () => {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const username = document.getElementById('username')?.value || '';
                const password = document.getElementById('password')?.value || '';
                
                const result = loginUser(username, password);
                showMessage('error-message', result.message, result.success);
                
                if (result.success) {
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1000);
                }
            });
        }
    };
    
    // Configuración de registro
    const setupRegister = () => {
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const username = document.getElementById('regUsername')?.value || '';
                const password = document.getElementById('regPassword')?.value || '';
                const confirmPassword = document.getElementById('regConfirmPassword')?.value || '';
                
                clearMessages();
                
                // Validar coincidencia de contraseñas
                if (password !== confirmPassword) {
                    showMessage('reg-error-message', 'Las contraseñas no coinciden', false);
                    return;
                }
                
                const result = registerUser(username, password);
                showMessage('reg-error-message', result.message, result.success);
                
                if (result.success) {
                    registerForm.reset();
                    setTimeout(() => {
                        document.getElementById('registerForm').classList.add('hidden');
                        document.getElementById('loginForm').classList.remove('hidden');
                        clearMessages();
                    }, 2000);
                }
            });
        }
    };
    
    // Configuración de logout
    const setupLogout = () => {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', logoutUser);
        }
    };
    
    // Funciones auxiliares
    const clearMessages = () => {
        const errorMsg = document.getElementById('error-message');
        const regErrorMsg = document.getElementById('reg-error-message');
        
        if (errorMsg) errorMsg.textContent = '';
        if (regErrorMsg) regErrorMsg.textContent = '';
    };
    
    const showMessage = (elementId, message, isSuccess) => {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = message;
            element.style.color = isSuccess ? 'green' : 'red';
        }
    };
    
    // Inicializar todo
    setupFormToggle();
    setupLogin();
    setupRegister();
    setupLogout();
    checkAuth();
});
// API Base URL
const API_URL = '/api';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize DOM Elements
    const initializeElements = () => {
        const elements = {
            loginFormContainer: document.getElementById('loginFormContainer'),
            signupFormContainer: document.getElementById('signupFormContainer'),
            loginFormElement: document.getElementById('loginFormElement'),
            signupFormElement: document.getElementById('signupFormElement'),
            loginLink: document.getElementById('loginLink'),
            signupLink: document.getElementById('signupLink'),
            orgCreationContainer: document.getElementById('orgCreationContainer'),
            orgCreationForm: document.getElementById('createOrgForm'),
            welcomeScreen: document.getElementById('welcomeScreen'),
            userEmailSpan: document.getElementById('userEmail'),
            organizationNameSpan: document.getElementById('organizationName'),
            loginError: document.getElementById('loginError'),
            orgError: document.getElementById('orgError'),
            logoutBtn: document.getElementById('logoutBtn')
        };

        // Verify all elements exist
        for (const [key, element] of Object.entries(elements)) {
            if (!element) {
                console.error(`Required element ${key} not found in the DOM`);
            }
        }

        return elements;
    };

    const elements = initializeElements();

    // UI State Management Functions
    function showLoginForm() {
        console.log('Showing login form');
        if (elements.loginFormContainer) {
            elements.loginFormContainer.classList.remove('hidden');
        }
        if (elements.signupFormContainer) {
            elements.signupFormContainer.classList.add('hidden');
        }
        if (elements.orgCreationContainer) {
            elements.orgCreationContainer.classList.add('hidden');
        }
        if (elements.welcomeScreen) {
            elements.welcomeScreen.classList.add('hidden');
        }
        if (elements.loginFormElement) {
            elements.loginFormElement.reset();
        }
    }

    function showOrgCreationForm(email) {
        console.log('Showing organization creation form for:', email);
        if (elements.userEmailSpan) {
            elements.userEmailSpan.textContent = email;
        }
        if (elements.loginFormContainer) {
            elements.loginFormContainer.classList.add('hidden');
        }
        if (elements.signupFormContainer) {
            elements.signupFormContainer.classList.add('hidden');
        }
        if (elements.welcomeScreen) {
            elements.welcomeScreen.classList.add('hidden');
        }
        if (elements.orgCreationContainer) {
            elements.orgCreationContainer.classList.remove('hidden');
        }
        if (elements.orgCreationForm) {
            elements.orgCreationForm.reset();
        }
    }

    function showWelcomeScreen(email, orgName) {
        console.log('Showing welcome screen for:', email, 'with org:', orgName);
        if (elements.userEmailSpan) {
            elements.userEmailSpan.textContent = email;
        }
        if (elements.organizationNameSpan) {
            elements.organizationNameSpan.textContent = orgName;
        }
        if (elements.loginFormContainer) {
            elements.loginFormContainer.classList.add('hidden');
        }
        if (elements.signupFormContainer) {
            elements.signupFormContainer.classList.add('hidden');
        }
        if (elements.orgCreationContainer) {
            elements.orgCreationContainer.classList.add('hidden');
        }
        if (elements.welcomeScreen) {
            elements.welcomeScreen.classList.remove('hidden');
        }
    }

    // Check session status on page load
    async function checkSession() {
        console.log('Checking session status...');
        try {
            const response = await fetch(`${API_URL}/users/session`, {
                credentials: 'include'
            });
            const data = await response.json();
            console.log('Session status:', data);

            if (response.ok && data.isLoggedIn) {
                if (data.organization) {
                    showWelcomeScreen(data.email, data.organization.name);
                } else {
                    showOrgCreationForm(data.email);
                }
            } else {
                showLoginForm();
            }
        } catch (error) {
            console.log('Session check error:', error);
            showLoginForm();
        }
    }

    // Login Handler
    if (elements.loginFormElement) {
        elements.loginFormElement.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (elements.loginError) {
                elements.loginError.textContent = '';
            }
            
            const email = document.getElementById('loginEmail')?.value;
            const password = document.getElementById('loginPassword')?.value;

            try {
                const response = await fetch(`${API_URL}/users/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Login failed');
                }

                // After successful login, check session to get the latest state
                checkSession();
            } catch (error) {
                console.error('Login error:', error);
                if (elements.loginError) {
                    elements.loginError.textContent = error.message;
                }
            }
        });
    }

    // Organization Creation Handler
    if (elements.orgCreationForm) {
        elements.orgCreationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (elements.orgError) {
                elements.orgError.textContent = '';
            }
            
            const name = document.getElementById('orgName')?.value;

            try {
                const response = await fetch(`${API_URL}/organizations`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({ name })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to create organization');
                }

                showWelcomeScreen(elements.userEmailSpan.textContent, data.name);
            } catch (error) {
                console.error('Organization creation error:', error);
                if (elements.orgError) {
                    elements.orgError.textContent = error.message;
                }
            }
        });
    }

    // Logout Handler
    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', async () => {
            try {
                await fetch(`${API_URL}/users/logout`, {
                    method: 'POST',
                    credentials: 'include'
                });
                
                showLoginForm();
            } catch (error) {
                console.error('Logout error:', error);
            }
        });
    }

    // Switch between login and signup forms
    if (elements.signupLink) {
        elements.signupLink.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Showing signup form');
            if (elements.loginFormContainer) {
                elements.loginFormContainer.classList.add('hidden');
            }
            if (elements.signupFormContainer) {
                elements.signupFormContainer.classList.remove('hidden');
            }
            if (elements.orgCreationContainer) {
                elements.orgCreationContainer.classList.add('hidden');
            }
            if (elements.welcomeScreen) {
                elements.welcomeScreen.classList.add('hidden');
            }
        });
    }

    if (elements.loginLink) {
        elements.loginLink.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Showing login form');
            if (elements.signupFormContainer) {
                elements.signupFormContainer.classList.add('hidden');
            }
            if (elements.loginFormContainer) {
                elements.loginFormContainer.classList.remove('hidden');
            }
            if (elements.orgCreationContainer) {
                elements.orgCreationContainer.classList.add('hidden');
            }
            if (elements.welcomeScreen) {
                elements.welcomeScreen.classList.add('hidden');
            }
        });
    }

    // Handle signup form submission
    if (elements.signupFormElement) {
        elements.signupFormElement.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('signupEmail')?.value;
            const password = document.getElementById('signupPassword')?.value;
            const errorElement = document.getElementById('signupError');

            try {
                const response = await fetch(`${API_URL}/users/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password, name: email }) // Using email as name for now
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to sign up');
                }

                // Automatically log in after successful signup
                const loginResponse = await fetch(`${API_URL}/users/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({ email, password })
                });

                if (!loginResponse.ok) {
                    throw new Error('Login failed after signup');
                }

                const loginData = await loginResponse.json();
                showOrgCreationForm(email);
            } catch (error) {
                if (errorElement) {
                    errorElement.textContent = error.message;
                }
            }
        });
    }

    // Initialize the page
    checkSession();
});

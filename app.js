// Initialize Firebase
  const firebaseConfig = {
    apiKey: "AIzaSyAZQid4pKFFcoWfvUMbx0-m_kCkWVduBHc",
    authDomain: "realwealth24-59506.firebaseapp.com",
    projectId: "realwealth24-59506",
    storageBucket: "realwealth24-59506.firebasestorage.app",
    messagingSenderId: "914361149158",
    appId: "1:914361149158:web:71181246b3ceb0f38cbd27",
    measurementId: "G-ZX5RE7KRL0"
  };


firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();


// DOM Elements
const loadingScreen = document.querySelector('.loading-screen');
const mainContent = document.querySelector('.main-content');
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const mobileSidebar = document.querySelector('.mobile-sidebar');
const closeSidebar = document.querySelector('.close-sidebar');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const mobileLoginBtn = document.getElementById('mobile-login-btn');
const mobileRegisterBtn = document.getElementById('mobile-register-btn');
const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');
const propertyUploadModal = document.getElementById('property-upload-modal');
const closeModals = document.querySelectorAll('.close-modal');
const switchToRegister = document.getElementById('switch-to-register');
const switchToLogin = document.getElementById('switch-to-login');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const propertyUploadForm = document.getElementById('property-upload-form');
const propertyGrid = document.getElementById('property-grid');
const chatToggle = document.querySelector('.chat-toggle');
const chatWindow = document.querySelector('.chat-window');
const closeChat = document.querySelector('.close-chat');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendMessageBtn = document.getElementById('send-message');
const searchBtn = document.getElementById('search-btn');
const tabBtns = document.querySelectorAll('.tab-btn');
const propertyImagesInput = document.getElementById('property-images');
const imagePreview = document.getElementById('image-preview');

// Global Variables
let currentUser = null;
let properties = [];
let selectedImages = [];

// Initialize 3D Globe
function initGlobe() {
    const container = document.getElementById('globe-container');
    
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
    
    // Create globe
    const geometry = new THREE.SphereGeometry(5, 32, 32);
    const texture = new THREE.TextureLoader().load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg');
    const material = new THREE.MeshBasicMaterial({ 
        map: texture,
        transparent: true,
        opacity: 0.7
    });
    const globe = new THREE.Mesh(geometry, material);
    scene.add(globe);
    
    // Add stars
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.1
    });
    
    const starsVertices = [];
    for (let i = 0; i < 1000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starsVertices.push(x, y, z);
    }
    
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
    
    // Position camera
    camera.position.z = 10;
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        globe.rotation.y += 0.001;
        stars.rotation.y -= 0.0005;
        renderer.render(scene, camera);
    }
    
    animate();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// Initialize the application
function initApp() {
    // Initialize 3D globe
    initGlobe();
    
    // Simulate loading
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        loadingScreen.style.visibility = 'hidden';
        
        mainContent.style.display = 'block';
        setTimeout(() => {
            mainContent.classList.add('show');
        }, 100);
        
        // Load properties
        loadProperties();
    }, 3000);
    
    // Event Listeners
    setupEventListeners();
    
    // Check auth state
    auth.onAuthStateChanged(user => {
        currentUser = user;
        updateUI();
    });
}

// Set up event listeners
function setupEventListeners() {
    // Mobile menu
    mobileMenuBtn.addEventListener('click', () => {
        mobileSidebar.classList.add('open');
    });
    
    closeSidebar.addEventListener('click', () => {
        mobileSidebar.classList.remove('open');
    });
    
    // Auth modals
    loginBtn.addEventListener('click', () => {
        loginModal.classList.add('active');
    });
    
    registerBtn.addEventListener('click', () => {
        registerModal.classList.add('active');
    });
    
    mobileLoginBtn.addEventListener('click', () => {
        loginModal.classList.add('active');
        mobileSidebar.classList.remove('open');
    });
    
    mobileRegisterBtn.addEventListener('click', () => {
        registerModal.classList.add('active');
        mobileSidebar.classList.remove('open');
    });
    
    closeModals.forEach(btn => {
        btn.addEventListener('click', () => {
            loginModal.classList.remove('active');
            registerModal.classList.remove('active');
            propertyUploadModal.classList.remove('active');
        });
    });
    
    switchToRegister.addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.classList.remove('active');
        registerModal.classList.add('active');
    });
    
    switchToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        registerModal.classList.remove('active');
        loginModal.classList.add('active');
    });
    
    // Auth forms
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        auth.signInWithEmailAndPassword(email, password)
            .then(() => {
                loginModal.classList.remove('active');
                showToast('Connexion réussie!');
            })
            .catch(error => {
                showToast(error.message, 'error');
            });
    });
    
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const phone = document.getElementById('register-phone').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        const userType = document.getElementById('register-type').value;
        
        if (password !== confirmPassword) {
            showToast('Les mots de passe ne correspondent pas', 'error');
            return;
        }
        
        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Save additional user data
                return db.collection('users').doc(userCredential.user.uid).set({
                    name,
                    email,
                    phone,
                    userType,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            })
            .then(() => {
                registerModal.classList.remove('active');
                showToast('Inscription réussie!');
            })
            .catch(error => {
                showToast(error.message, 'error');
            });
    });
    
    // Property upload
    propertyImagesInput.addEventListener('change', (e) => {
        imagePreview.innerHTML = '';
        selectedImages = [];
        
        Array.from(e.target.files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = document.createElement('img');
                img.src = event.target.result;
                
                const previewItem = document.createElement('div');
                previewItem.className = 'image-preview-item';
                previewItem.appendChild(img);
                
                const removeBtn = document.createElement('button');
                removeBtn.innerHTML = '×';
                removeBtn.addEventListener('click', () => {
                    previewItem.remove();
                    selectedImages = selectedImages.filter(f => f.name !== file.name);
                });
                
                previewItem.appendChild(removeBtn);
                imagePreview.appendChild(previewItem);
                selectedImages.push(file);
            };
            reader.readAsDataURL(file);
        });
    });
    
    propertyUploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!currentUser) {
            showToast('Veuillez vous connecter d\'abord', 'error');
            return;
        }
        
        if (selectedImages.length === 0) {
            showToast('Veuillez ajouter au moins une image', 'error');
            return;
        }
        
        const propertyData = {
            title: document.getElementById('property-title').value,
            description: document.getElementById('property-description').value,
            type: document.getElementById('property-type-upload').value,
            location: document.getElementById('property-location').value,
            address: document.getElementById('property-address').value,
            bedrooms: parseInt(document.getElementById('property-bedrooms').value) || 0,
            bathrooms: parseInt(document.getElementById('property-bathrooms').value) || 0,
            size: parseInt(document.getElementById('property-size').value) || 0,
            price: parseFloat(document.getElementById('property-price').value),
            rentPeriod: document.getElementById('property-rent-period').value,
            landlordId: currentUser.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            images: []
        };
        
        try {
            // Upload images to Firebase Storage
            const imageUrls = await Promise.all(
                selectedImages.map(async (file) => {
                    const storageRef = storage.ref(`properties/${currentUser.uid}/${Date.now()}_${file.name}`);
                    await storageRef.put(file);
                    return await storageRef.getDownloadURL();
                })
            );
            
            propertyData.images = imageUrls;
            
            // Save property data to Firestore
            await db.collection('properties').add(propertyData);
            
            // Reset form
            propertyUploadForm.reset();
            imagePreview.innerHTML = '';
            selectedImages = [];
            propertyUploadModal.classList.remove('active');
            
            showToast('Propriété ajoutée avec succès!');
            loadProperties();
        } catch (error) {
            showToast(error.message, 'error');
        }
    });
    
    // Live chat
    chatToggle.addEventListener('click', () => {
        chatWindow.classList.toggle('open');
    });
    
    closeChat.addEventListener('click', () => {
        chatWindow.classList.remove('open');
    });
    
    sendMessageBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    
    // Search
    searchBtn.addEventListener('click', () => {
        const type = document.getElementById('property-type').value;
        const location = document.getElementById('location').value;
        const priceRange = document.getElementById('price-range').value;
        
        filterProperties(type, location, priceRange);
    });
    
    // Tabs
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

// Update UI based on auth state
function updateUI() {
    const authButtons = document.querySelector('.auth-buttons');
    const mobileAuthButtons = document.querySelector('.sidebar-nav .btn');
    
    if (currentUser) {
        // Check if user is landlord
        db.collection('users').doc(currentUser.uid).get()
            .then(doc => {
                if (doc.exists && doc.data().userType === 'landlord') {
                    // Show property upload button for landlords
                    authButtons.innerHTML = `
                        <button id="upload-property-btn" class="btn btn-primary">
                            <i class="fas fa-plus"></i> Ajouter Propriété
                        </button>
                        <button id="logout-btn" class="btn btn-outline">Déconnexion</button>
                    `;
                    
                    if (mobileAuthButtons) {
                        mobileAuthButtons.innerHTML = `
                            <button id="mobile-upload-property-btn" class="btn btn-primary">
                                <i class="fas fa-plus"></i> Ajouter Propriété
                            </button>
                            <button id="mobile-logout-btn" class="btn btn-outline">Déconnexion</button>
                        `;
                    }
                    
                    // Add event listeners to new buttons
                    document.getElementById('upload-property-btn')?.addEventListener('click', () => {
                        propertyUploadModal.classList.add('active');
                    });
                    
                    document.getElementById('logout-btn')?.addEventListener('click', logout);
                    
                    document.getElementById('mobile-upload-property-btn')?.addEventListener('click', () => {
                        propertyUploadModal.classList.add('active');
                        mobileSidebar.classList.remove('open');
                    });
                    
                    document.getElementById('mobile-logout-btn')?.addEventListener('click', logout);
                } else {
                    // Regular user UI
                    authButtons.innerHTML = `
                        <button id="logout-btn" class="btn btn-outline">Déconnexion</button>
                    `;
                    
                    if (mobileAuthButtons) {
                        mobileAuthButtons.innerHTML = `
                            <button id="mobile-logout-btn" class="btn btn-outline">Déconnexion</button>
                        `;
                    }
                    
                    document.getElementById('logout-btn')?.addEventListener('click', logout);
                    document.getElementById('mobile-logout-btn')?.addEventListener('click', logout);
                }
            });
    } else {
        // Not logged in UI
        authButtons.innerHTML = `
            <button id="login-btn" class="btn btn-outline">Connexion</button>
            <button id="register-btn" class="btn btn-primary">Inscription</button>
        `;
        
        if (mobileAuthButtons) {
            mobileAuthButtons.innerHTML = `
                <button id="mobile-login-btn" class="btn btn-outline">Connexion</button>
                <button id="mobile-register-btn" class="btn btn-primary">Inscription</button>
            `;
        }
        
        // Re-add event listeners
        document.getElementById('login-btn')?.addEventListener('click', () => {
            loginModal.classList.add('active');
        });
        
        document.getElementById('register-btn')?.addEventListener('click', () => {
            registerModal.classList.add('active');
        });
        
        document.getElementById('mobile-login-btn')?.addEventListener('click', () => {
            loginModal.classList.add('active');
            mobileSidebar.classList.remove('open');
        });
        
        document.getElementById('mobile-register-btn')?.addEventListener('click', () => {
            registerModal.classList.add('active');
            mobileSidebar.classList.remove('open');
        });
    }
}

// Logout function
function logout() {
    auth.signOut()
        .then(() => {
            showToast('Déconnexion réussie');
        })
        .catch(error => {
            showToast(error.message, 'error');
        });
}

// Load properties from Firestore
function loadProperties() {
    propertyGrid.innerHTML = `
        <div class="property-card skeleton">
            <div class="property-image"></div>
            <div class="property-details">
                <h3></h3>
                <p></p>
                <div class="property-price"></div>
            </div>
        </div>
        <div class="property-card skeleton">
            <div class="property-image"></div>
            <div class="property-details">
                <h3></h3>
                <p></p>
                <div class="property-price"></div>
            </div>
        </div>
        <div class="property-card skeleton">
            <div class="property-image"></div>
            <div class="property-details">
                <h3></h3>
                <p></p>
                <div class="property-price"></div>
            </div>
        </div>
    `;
    
    db.collection('properties')
        .orderBy('createdAt', 'desc')
        .limit(6)
        .get()
        .then(querySnapshot => {
            properties = [];
            querySnapshot.forEach(doc => {
                properties.push({ id: doc.id, ...doc.data() });
            });
            
            renderProperties(properties);
        })
        .catch(error => {
            showToast('Erreur lors du chargement des propriétés', 'error');
            console.error(error);
        });
}

// Render properties to the DOM
function renderProperties(propertiesToRender) {
    if (propertiesToRender.length === 0) {
        propertyGrid.innerHTML = '<p class="no-results">Aucune propriété trouvée</p>';
        return;
    }
    
    propertyGrid.innerHTML = '';
    
    propertiesToRender.forEach(property => {
        const propertyCard = document.createElement('div');
        propertyCard.className = 'property-card fade-in';
        
        // Format price based on rent period
        let priceText = `${property.price}$`;
        if (property.rentPeriod) {
            switch (property.rentPeriod) {
                case 'monthly':
                    priceText += '/mois';
                    break;
                case 'weekly':
                    priceText += '/semaine';
                    break;
                case 'daily':
                    priceText += '/jour';
                    break;
                case 'yearly':
                    priceText += '/an';
                    break;
            }
        }
        
        propertyCard.innerHTML = `
            <div class="property-image" style="background-image: url('${property.images[0] || 'https://via.placeholder.com/400x300'}')"></div>
            <div class="property-details">
                <h3>${property.title}</h3>
                <p><i class="fas fa-map-marker-alt"></i> ${getNeighborhoodName(property.location)}</p>
                <div class="property-price">${priceText}</div>
                <button class="btn btn-outline view-details" data-id="${property.id}">Voir Détails</button>
            </div>
        `;
        
        propertyGrid.appendChild(propertyCard);
    });
    
    // Add event listeners to detail buttons
    document.querySelectorAll('.view-details').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const propertyId = e.target.getAttribute('data-id');
            viewPropertyDetails(propertyId);
        });
    });
}

// Filter properties based on search criteria
function filterProperties(type, location, priceRange) {
    let filtered = [...properties];
    
    if (type) {
        filtered = filtered.filter(p => p.type === type);
    }
    
    if (location) {
        filtered = filtered.filter(p => p.location === location);
    }
    
    if (priceRange) {
        const [min, max] = priceRange.split('-');
        if (max === '+') {
            filtered = filtered.filter(p => p.price >= parseInt(min));
        } else {
            filtered = filtered.filter(p => p.price >= parseInt(min) && p.price <= parseInt(max));
        }
    }
    
    renderProperties(filtered);
}

// View property details
function viewPropertyDetails(propertyId) {
    const property = properties.find(p => p.id === propertyId);
    if (!property) return;
    
    // Format price based on rent period
    let priceText = `${property.price}$`;
    if (property.rentPeriod) {
        switch (property.rentPeriod) {
            case 'monthly':
                priceText += '/mois';
                break;
            case 'weekly':
                priceText += '/semaine';
                break;
            case 'daily':
                priceText += '/jour';
                break;
            case 'yearly':
                priceText += '/an';
                break;
        }
    }
    
    // Create modal HTML
    const modalHTML = `
        <div class="modal-content property-details-modal">
            <button class="close-modal"><i class="fas fa-times"></i></button>
            <div class="property-details-header">
                <h2>${property.title}</h2>
                <p><i class="fas fa-map-marker-alt"></i> ${getNeighborhoodName(property.location)} • ${property.address}</p>
                <div class="property-price">${priceText}</div>
            </div>
            
            <div class="property-images-slider">
                ${property.images.map(img => `
                    <div class="property-image-slide" style="background-image: url('${img}')"></div>
                `).join('')}
            </div>
            
            <div class="property-info-grid">
                <div class="property-description">
                    <h3>Description</h3>
                    <p>${property.description}</p>
                </div>
                
                <div class="property-features">
                    <h3>Caractéristiques</h3>
                    <div class="features-grid">
                        <div class="feature">
                            <i class="fas fa-bed"></i>
                            <span>${property.bedrooms || 0} Chambres</span>
                        </div>
                        <div class="feature">
                            <i class="fas fa-bath"></i>
                            <span>${property.bathrooms || 0} Salles de bain</span>
                        </div>
                        <div class="feature">
                            <i class="fas fa-ruler-combined"></i>
                            <span>${property.size || 0} m²</span>
                        </div>
                        <div class="feature">
                            <i class="fas fa-home"></i>
                            <span>${getPropertyTypeName(property.type)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="property-contact">
                    <h3>Contacter le propriétaire</h3>
                    <button class="btn btn-primary contact-landlord">
                        <i class="fas fa-envelope"></i> Envoyer un message
                    </button>
                    <button class="btn btn-outline request-visit">
                        <i class="fas fa-calendar-alt"></i> Demander une visite
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Create and show modal
    const modal = document.createElement('div');
    modal.className = 'auth-modal active';
    modal.innerHTML = modalHTML;
    document.body.appendChild(modal);
    
    // Add event listeners
    modal.querySelector('.close-modal').addEventListener('click', () => {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
        }, 300);
    });
    
    // Initialize image slider
    if (property.images.length > 1) {
        initPropertyImageSlider(modal.querySelector('.property-images-slider'));
    }
}

// Initialize property image slider
function initPropertyImageSlider(slider) {
    let currentIndex = 0;
    const slides = slider.querySelectorAll('.property-image-slide');
    slides[0].classList.add('active');
    
    // Add navigation arrows
    const prevArrow = document.createElement('div');
    prevArrow.className = 'slider-arrow prev';
    prevArrow.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevArrow.addEventListener('click', () => {
        navigateSlider(-1);
    });
    
    const nextArrow = document.createElement('div');
    nextArrow.className = 'slider-arrow next';
    nextArrow.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextArrow.addEventListener('click', () => {
        navigateSlider(1);
    });
    
    slider.appendChild(prevArrow);
    slider.appendChild(nextArrow);
    
    function navigateSlider(direction) {
        slides[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + direction + slides.length) % slides.length;
        slides[currentIndex].classList.add('active');
    }
}

// Send chat message
function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;
    
    if (!currentUser) {
        showToast('Veuillez vous connecter pour chatter', 'error');
        return;
    }
    
    const messageElement = document.createElement('div');
    messageElement.className = 'message user';
    messageElement.innerHTML = `<p>${message}</p>`;
    chatMessages.appendChild(messageElement);
    chatInput.value = '';
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Simulate agent response
    setTimeout(() => {
        const responses = [
            "Merci pour votre message. Comment pouvons-nous vous aider?",
            "Nous avons bien reçu votre demande. Un agent vous répondra bientôt.",
            "Pouvez-vous nous donner plus de détails sur votre question?",
            "Nous sommes là pour vous aider. Que souhaitez-vous savoir?"
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        const responseElement = document.createElement('div');
        responseElement.className = 'message agent';
        responseElement.innerHTML = `<p>${randomResponse}</p>`;
        chatMessages.appendChild(responseElement);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 1000);
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Helper function to get neighborhood name
function getNeighborhoodName(location) {
    const neighborhoods = {
        'buyenzi': 'Buyenzi',
        'jabe': 'Jabe',
        'muyinga': 'Muyinga',
        'rumonge': 'Rumonge',
        'ngozi': 'Ngozi',
        'plage': 'Plage',
        'airport': 'Airport',
        'bwiza': 'Bwiza',
        'nyakabiga': 'Nyakabiga',
        'gihosha': 'Gihosha',
        'kinindo': 'Kinindo',
        'kigobe': 'Kigobe',
        'kibenga': 'Kibenga',
        'ngagara': 'Ngagara',
        'mtakura': 'Mtakura',
        'kinama': 'Kinama',
        'cibitoki': 'Cibitoki',
        'kamenge': 'Kamenge',
        'charama': 'Charama',
        'buterere': 'Buterere',
        'maramvya': 'Maramvya',
        'kajaga': 'Kajaga',
        'kanyosha': 'Kanyosha',
        'nyabugereasiatique': 'Nyabugere Asiatique',
        'miroire': 'Miroire',
        'kabondo': 'Kabondo',
        'gatumba': 'Gatumba',
        'kinanira1': 'Kinanira 1',
        'kinanira2': 'Kinanira 2',
        'kinanira3': 'Kinanira 3',
        'okafe': 'Okafe',
        'centre-ville': 'Centre Ville'
    };
    
    return neighborhoods[location] || location;
}

// Helper function to get property type name
function getPropertyTypeName(type) {
    const types = {
        'house': 'Maison',
        'apartment': 'Appartement',
        'villa': 'Villa',
        'land': 'Terrain',
        'commercial': 'Commercial'
    };
    
    return types[type] || type;
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);


















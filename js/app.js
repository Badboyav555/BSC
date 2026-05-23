// Main Application JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize mobile menu
    initMobileMenu();
    
    // Initialize search functionality
    initSearch();
    
    // Load semester page if on semester.html
    if (window.location.pathname.includes('semester.html')) {
        loadSemesterPage();
    }
    
    // Load subject page if on subject.html
    if (window.location.pathname.includes('subject.html')) {
        loadSubjectPage();
    }
    
    // Smooth scrolling for anchor links
    initSmoothScroll();
});

// Mobile Menu Toggle
function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
        });
    }
}

// Search Functionality
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const semesterCards = document.querySelectorAll('.semester-card');
    const subjectSearch = document.getElementById('subjectSearch');
    const subjectCards = document.querySelectorAll('.subject-card');
    
    if (searchInput && semesterCards.length) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            semesterCards.forEach(card => {
                const text = card.textContent.toLowerCase();
                card.style.display = text.includes(query) ? 'block' : 'none';
            });
        });
    }
    
    if (subjectSearch && subjectCards.length) {
        subjectSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            subjectCards.forEach(card => {
                const text = card.textContent.toLowerCase();
                card.style.display = text.includes(query) ? 'block' : 'none';
            });
        });
    }
}

// Load Semester Page
function loadSemesterPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const semNumber = urlParams.get('sem') || '1';
    
    // Update semester number in breadcrumb and title
    document.getElementById('semNumber').textContent = semNumber;
    document.getElementById('semTitle').textContent = semNumber;
    document.title = `Semester ${semNumber} - BSc Notes`;
    
    // Subjects for each semester
    const subjects = [
        { name: 'Physics', icon: '⚛️', slug: 'physics' },
        { name: 'Chemistry', icon: '🧪', slug: 'chemistry' },
        { name: 'Botany', icon: '🌿', slug: 'botany' },
        { name: 'Zoology', icon: '🦁', slug: 'zoology' },
        { name: 'Maths', icon: '📐', slug: 'maths' }
    ];
    
    const subjectsGrid = document.getElementById('subjectsGrid');
    
    if (subjectsGrid) {
        subjectsGrid.innerHTML = subjects.map(subject => `
            <a href="subject.html?sem=${semNumber}&subject=${subject.slug}" class="glass-card subject-card">
                <div class="card-glow"></div>
                <div class="card-content">
                    <div class="feature-icon">${subject.icon}</div>
                    <h3>${subject.name}</h3>
                    <p>5 Units Available</p>
                    <div class="card-subjects">
                        <span class="subject-tag">Notes</span>
                        <span class="subject-tag">PYQs</span>
                        <span class="subject-tag">Important Qs</span>
                    </div>
                </div>
            </a>
        `).join('');
    }
}

// Load Subject Page
function loadSubjectPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const semNumber = urlParams.get('sem') || '1';
    const subjectSlug = urlParams.get('subject') || 'physics';
    
    // Capitalize subject name
    const subjectName = subjectSlug.charAt(0).toUpperCase() + subjectSlug.slice(1);
    
    // Update page elements
    document.getElementById('subjectTitle').textContent = subjectName;
    document.getElementById('subjectHeading').textContent = `${subjectName} Units`;
    document.getElementById('semLink').href = `semester.html?sem=${semNumber}`;
    document.getElementById('semLink').textContent = `Semester ${semNumber}`;
    document.title = `${subjectName} - Semester ${semNumber} - BSc Notes`;
    
    // Generate unit cards
    const unitsGrid = document.getElementById('unitsGrid');
    
    if (unitsGrid) {
        unitsGrid.innerHTML = Array.from({ length: 5 }, (_, i) => {
            const unitNum = i + 1;
            return `
                <a href="notes.html?sem=${semNumber}&subject=${subjectSlug}&note=unit${unitNum}" class="glass-card unit-card">
                    <div class="card-glow"></div>
                    <div class="card-content">
                        <div class="semester-number">0${unitNum}</div>
                        <h3>Unit ${unitNum}</h3>
                        <p>Complete study material</p>
                        <div class="card-subjects">
                            <span class="subject-tag">Notes</span>
                            <span class="subject-tag">PYQs</span>
                        </div>
                    </div>
                </a>
            `;
        }).join('');
    }
}

// Smooth Scroll
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

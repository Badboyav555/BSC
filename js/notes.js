// Notes Page JavaScript

// Supabase Configuration
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// State
let currentLanguage = 'en';
let isUnlocked = false;

document.addEventListener('DOMContentLoaded', function() {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const sem = urlParams.get('sem');
    const subject = urlParams.get('subject');
    const note = urlParams.get('note');
    
    if (!sem || !subject || !note) {
        window.location.href = 'index.html';
        return;
    }
    
    // Update meta tags
    updateMetaTags(sem, subject, note);
    
    // Load notes
    loadNotes(sem, subject, note);
    
    // Initialize language toggle
    initLanguageToggle(sem, subject, note);
    
    // Initialize theme toggle
    initThemeToggle();
    
    // Initialize reading progress
    initReadingProgress();
    
    // Initialize modal
    initUnlockModal(sem, subject, note);
    
    // Initialize PDF download
    initPdfDownload();
});

// Update meta information
function updateMetaTags(sem, subject, note) {
    const subjectName = subject.charAt(0).toUpperCase() + subject.slice(1);
    const unitNumber = note.replace('unit', '');
    
    document.getElementById('notesTitle').textContent = `Unit ${unitNumber} - ${subjectName}`;
    document.getElementById('semesterTag').textContent = `Semester ${sem}`;
    document.getElementById('subjectTag').textContent = subjectName;
    document.getElementById('unitTag').textContent = note.toUpperCase();
    document.title = `Unit ${unitNumber} - ${subjectName} - BSc Notes`;
}

// Load notes from markdown file
async function loadNotes(sem, subject, note) {
    const contentDiv = document.getElementById('notesContent');
    
    try {
        // Check if notes are unlocked
        const unlockKey = `unlocked_${sem}_${subject}_${note}_${currentLanguage}`;
        isUnlocked = localStorage.getItem(unlockKey) === 'true';
        
        const response = await fetch(`notes/sem${sem}/${subject}/${note}-${currentLanguage}.md`);
        
        if (!response.ok) {
            // Try without language suffix
            const fallbackResponse = await fetch(`notes/sem${sem}/${subject}/${note}.md`);
            if (!fallbackResponse.ok) {
                throw new Error('Notes not found');
            }
            const markdown = await fallbackResponse.text();
            renderNotes(markdown, contentDiv);
        } else {
            const markdown = await response.text();
            renderNotes(markdown, contentDiv);
        }
        
        // Generate table of contents
        generateTOC();
        
        // Add copy buttons to code blocks
        addCopyButtons();
        
        // Add image zoom functionality
        addImageZoom();
        
    } catch (error) {
        contentDiv.innerHTML = `
            <div style="text-align: center; padding: 4rem 0;">
                <h2>Notes Not Found</h2>
                <p style="color: var(--text-muted);">The requested notes are not available yet.</p>
            </div>
        `;
    }
}

// Render markdown content
function renderNotes(markdown, container) {
    const html = marked.parse(markdown);
    
    if (!isUnlocked) {
        // Show first 30% and blur the rest
        const words = html.split(' ');
        const thirtyPercent = Math.floor(words.length * 0.3);
        const visibleContent = words.slice(0, thirtyPercent).join(' ');
        const blurredContent = words.slice(thirtyPercent).join(' ');
        
        container.innerHTML = `
            <div class="visible-content">
                ${visibleContent}
            </div>
            <div class="blurred-content">
                ${blurredContent}
            </div>
            <div style="text-align: center; margin-top: 2rem;">
                <button onclick="showUnlockModal()" class="glass-btn primary-btn">
                    <span>Unlock Full Notes</span>
                </button>
            </div>
        `;
        
        // Show modal after a short delay
        setTimeout(showUnlockModal, 2000);
    } else {
        container.innerHTML = html;
    }
}

// Generate Table of Contents
function generateTOC() {
    const article = document.getElementById('notesContent');
    const headings = article.querySelectorAll('h2, h3');
    const tocNav = document.getElementById('tocNav');
    
    if (tocNav && headings.length) {
        tocNav.innerHTML = Array.from(headings).map((heading, index) => {
            const id = `heading-${index}`;
            heading.id = id;
            return `
                <a href="#${id}" class="toc-link" data-heading="${id}">
                    ${heading.textContent}
                </a>
            `;
        }).join('');
        
        // Highlight active TOC link on scroll
        highlightTOCOnScroll();
    }
}

// Highlight TOC on scroll
function highlightTOCOnScroll() {
    const tocLinks = document.querySelectorAll('.toc-link');
    const headings = document.querySelectorAll('h2, h3');
    
    window.addEventListener('scroll', () => {
        let current = '';
        headings.forEach(heading => {
            const sectionTop = heading.offsetTop;
            if (pageYOffset >= sectionTop - 100) {
                current = heading.getAttribute('id');
            }
        });
        
        tocLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-heading') === current) {
                link.classList.add('active');
            }
        });
    });
}

// Add copy buttons to code blocks
function addCopyButtons() {
    const codeBlocks = document.querySelectorAll('pre');
    
    codeBlocks.forEach(block => {
        const button = document.createElement('button');
        button.className = 'copy-code-btn';
        button.textContent = 'Copy';
        button.onclick = function() {
            const code = block.querySelector('code');
            if (code) {
                navigator.clipboard.writeText(code.textContent).then(() => {
                    button.textContent = 'Copied!';
                    setTimeout(() => {
                        button.textContent = 'Copy';
                    }, 2000);
                });
            }
        };
        block.appendChild(button);
    });
}

// Add image zoom functionality
function addImageZoom() {
    const images = document.querySelectorAll('.notes-article img');
    
    images.forEach(img => {
        img.addEventListener('click', function() {
            const modal = document.createElement('div');
            modal.className = 'image-zoom-modal';
            modal.innerHTML = `<img src="${this.src}" alt="${this.alt}">`;
            modal.onclick = function() {
                document.body.removeChild(modal);
            };
            document.body.appendChild(modal);
        });
    });
}

// Initialize language toggle
function initLanguageToggle(sem, subject, note) {
    const langToggle = document.getElementById('langToggle');
    
    if (langToggle) {
        langToggle.addEventListener('click', () => {
            currentLanguage = currentLanguage === 'en' ? 'hi' : 'en';
            loadNotes(sem, subject, note);
        });
    }
}

// Initialize theme toggle
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
        });
    }
}

// Initialize reading progress
function initReadingProgress() {
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        document.getElementById('progressBar').style.width = progress + '%';
    });
}

// Initialize unlock modal
function initUnlockModal(sem, subject, note) {
    const form = document.getElementById('unlockForm');
    
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('unlockName').value;
            const mobile = document.getElementById('unlockMobile').value;
            
            if (!name || !mobile) {
                alert('Please fill in all fields');
                return;
            }
            
            // Save lead to Supabase
            await saveLead(name, mobile, sem, subject, note);
            
            // Unlock notes
            const unlockKey = `unlocked_${sem}_${subject}_${note}_${currentLanguage}`;
            localStorage.setItem(unlockKey, 'true');
            isUnlocked = true;
            
            // Close modal
            closeModal();
            
            // Reload notes
            loadNotes(sem, subject, note);
        });
    }
}

// Save lead to Supabase
async function saveLead(name, mobile, sem, subject, note) {
    try {
        const { data, error } = await supabase
            .from('leads')
            .insert([
                {
                    name: name,
                    mobile: mobile,
                    semester: parseInt(sem),
                    subject: subject,
                    note_title: note,
                    created_at: new Date().toISOString()
                }
            ]);
        
        if (error) throw error;
        console.log('Lead saved successfully');
    } catch (error) {
        console.error('Error saving lead:', error);
    }
}

// Show unlock modal
function showUnlockModal() {
    const modal = document.getElementById('unlockModal');
    if (modal) {
        modal.classList.add('active');
    }
}

// Close modal
function closeModal() {
    const modal = document.getElementById('unlockModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Initialize PDF download
function initPdfDownload() {
    const downloadBtn = document.getElementById('downloadPdfBtn');
    
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            window.print();
        });
    }
}

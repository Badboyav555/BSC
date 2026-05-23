// Admin Dashboard JavaScript

// Supabase Configuration
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tab navigation
    initTabNavigation();
    
    // Load dashboard data
    loadDashboardData();
    
    // Load leads
    loadLeads();
    
    // Initialize search
    initLeadSearch();
    
    // Initialize export
    initExportCSV();
    
    // Initialize notes generator
    initNotesGenerator();
});

// Tab Navigation
function initTabNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const tabs = document.querySelectorAll('.admin-tab');
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Show corresponding tab
            const tabId = item.getAttribute('data-tab');
            tabs.forEach(tab => tab.classList.remove('active'));
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
}

// Load Dashboard Data
async function loadDashboardData() {
    try {
        // Get total leads
        const { count: totalLeads, error: totalError } = await supabase
            .from('leads')
            .select('*', { count: 'exact', head: true });
        
        if (totalError) throw totalError;
        
        // Get today's leads
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const { count: todayLeads, error: todayError } = await supabase
            .from('leads')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', today.toISOString());
        
        if (todayError) throw todayError;
        
        // Update UI
        document.getElementById('totalLeads').textContent = totalLeads || 0;
        document.getElementById('todayLeads').textContent = todayLeads || 0;
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Load Leads
async function loadLeads(searchQuery = '') {
    try {
        let query = supabase
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (searchQuery) {
            query = query.or(`name.ilike.%${searchQuery}%,mobile.ilike.%${searchQuery}%`);
        }
        
        const { data: leads, error } = await query;
        
        if (error) throw error;
        
        renderLeadsTable(leads);
        
    } catch (error) {
        console.error('Error loading leads:', error);
    }
}

// Render Leads Table
function renderLeadsTable(leads) {
    const tbody = document.getElementById('leadsTableBody');
    
    if (!tbody) return;
    
    if (leads.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 2rem;">
                    No leads found
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = leads.map(lead => `
        <tr>
            <td>${lead.name}</td>
            <td>${lead.mobile}</td>
            <td>Semester ${lead.semester}</td>
            <td>${lead.subject}</td>
            <td>${lead.note_title}</td>
            <td>${new Date(lead.created_at).toLocaleDateString()}</td>
            <td>
                <button class="delete-btn" onclick="deleteLead('${lead.id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Delete Lead
async function deleteLead(id) {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    
    try {
        const { error } = await supabase
            .from('leads')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        // Reload leads and dashboard data
        loadLeads();
        loadDashboardData();
        
    } catch (error) {
        console.error('Error deleting lead:', error);
        alert('Error deleting lead');
    }
}

// Initialize Lead Search
function initLeadSearch() {
    const searchInput = document.getElementById('leadSearch');
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            loadLeads(e.target.value);
        }, 300));
    }
}

// Initialize Export CSV
function initExportCSV() {
    const exportBtn = document.getElementById('exportCsv');
    
    if (exportBtn) {
        exportBtn.addEventListener('click', exportToCSV);
    }
}

// Export to CSV
async function exportToCSV() {
    try {
        const { data: leads, error } = await supabase
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Create CSV content
        const headers = ['Name', 'Mobile', 'Semester', 'Subject', 'Note', 'Date'];
        const csvContent = [
            headers.join(','),
            ...leads.map(lead => [
                lead.name,
                lead.mobile,
                lead.semester,
                lead.subject,
                lead.note_title,
                new Date(lead.created_at).toLocaleDateString()
            ].join(','))
        ].join('\n');
        
        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        
    } catch (error) {
        console.error('Error exporting CSV:', error);
        alert('Error exporting data');
    }
}

// Initialize Notes Generator
function initNotesGenerator() {
    const previewBtn = document.querySelector('.form-actions .glass-btn.primary-btn');
    const saveBtn = document.querySelector('.form-actions .glass-btn.secondary-btn');
    
    if (previewBtn) {
        previewBtn.addEventListener('click', previewMarkdown);
    }
    
    if (saveBtn) {
        saveBtn.addEventListener('click', saveNote);
    }
}

// Preview Markdown
function previewMarkdown() {
    const content = document.getElementById('genContent').value;
    const previewDiv = document.getElementById('previewContent');
    
    if (previewDiv && content) {
        previewDiv.innerHTML = marked.parse(content);
    }
}

// Save Note
function saveNote() {
    const semester = document.getElementById('genSemester').value;
    const subject = document.getElementById('genSubject').value;
    const unit = document.getElementById('genUnit').value;
    const content = document.getElementById('genContent').value;
    
    if (!content) {
        alert('Please enter some content');
        return;
    }
    
    // In a real application, this would save to a file
    // For demo, we'll show the generated path
    const path = `notes/sem${semester}/${subject}/unit${unit}.md`;
    alert(`Note would be saved to: ${path}\n\nContent length: ${content.length} characters`);
    
    // You can implement actual file saving using a backend service
    // or use the File System Access API for local development
}

// Utility: Debounce function
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

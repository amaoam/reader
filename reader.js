class Book {
    constructor(data = {}) {
        this.id = data.id || Date.now().toString();
        this.title = data.title || '';
        this.author = data.author || '';
        this.cover = data.cover || '';
        this.category = data.category || 'other';
        this.description = data.description || '';
        this.progress = data.progress || 0;
        this.readingTime = data.readingTime || 0;
        this.lastRead = data.lastRead || new Date().toISOString();
        this.status = data.status || 'reading';
        this.marked = data.marked || false;
        this.path = data.path || '';
        this.content = data.content || '';
        this.lastPosition = data.lastPosition || 0;
        this.history = data.history || [];
        this.fontSize = data.fontSize || 16;
        this.fontFamily = data.fontFamily || 'Microsoft YaHei';
        this.createdAt = data.createdAt || new Date().toISOString();
        this.notes = data.notes || [];
    }

    addHistoryEntry(position, timestamp = new Date().toISOString()) {
        this.history.push({
            position,
            timestamp,
            progress: this.progress
        });
        if (this.history.length > 100) {
            this.history = this.history.slice(-100);
        }
    }

    toJSON() {
        return {
            id: this.id,
            title: this.title,
            author: this.author,
            cover: this.cover,
            category: this.category,
            description: this.description,
            progress: this.progress,
            readingTime: this.readingTime,
            lastRead: this.lastRead,
            status: this.status,
            marked: this.marked,
            path: this.path,
            content: this.content,
            lastPosition: this.lastPosition,
            history: this.history,
            fontSize: this.fontSize,
            fontFamily: this.fontFamily,
            createdAt: this.createdAt,
            notes: this.notes
        };
    }
}

class Note {
    constructor(data = {}) {
        this.id = data.id || Date.now().toString();
        this.title = data.title || '';
        this.content = data.content || '';
        this.category = data.category || 'general';
        this.bookId = data.bookId || '';
        this.selectedText = data.selectedText || '';
        this.tags = data.tags || [];
        this.created = data.created || new Date().toISOString();
        this.updated = data.updated || new Date().toISOString();
        this.marked = data.marked || false;
        this.position = data.position || 0;
    }

    toJSON() {
        return {
            id: this.id,
            title: this.title,
            content: this.content,
            category: this.category,
            bookId: this.bookId,
            selectedText: this.selectedText,
            tags: this.tags,
            created: this.created,
            updated: this.updated,
            marked: this.marked,
            position: this.position
        };
    }
}

class ChineseReader {
    constructor() {
        this.books = new Map();
        this.currentBook = null;
        this.textContent = document.getElementById('textContent');
        this.progress = document.getElementById('progress');
        this.fileName = document.getElementById('fileName');
        this.dropZone = document.querySelector('.drop-zone');
        this.fileInput = document.createElement('input');
        this.fileInput.type = 'file';
        this.fileInput.accept = '.txt';
        this.fileInput.style.display = 'none';
        document.body.appendChild(this.fileInput);

        this.settings = {
            lineHeight: 2,
            margin: 60,
            theme: 'light',
            defaultFontSize: 16,
            defaultFontFamily: 'Microsoft YaHei',
            backgroundColor: '#ffffff',
            availableFonts: [
                'Microsoft YaHei',
                'SimSun',
                'KaiTi',
                'FangSong',
                'SimHei',
                'Source Han Sans CN',
                'Noto Sans SC'
            ]
        };
        
        this.selectedText = '';
        
        this.bindEvents();
        this.loadSettings();
        this.loadBooks();
        this.loadRecentFiles();
        this.applyTheme();

        // Add auto-save interval
        setInterval(() => {
            if (this.currentBook) {
                this.saveReadingProgress();
            }
        }, 30000); // Auto-save every 30 seconds

        // Add window unload handler to save progress before closing
        window.addEventListener('beforeunload', () => {
            if (this.currentBook) {
                this.saveReadingProgress();
            }
        });

        // Try to restore last read book
        const lastReadId = localStorage.getItem('lastReadBookId');
        if (lastReadId) {
            console.log('Attempting to restore last read book:', lastReadId);
            setTimeout(() => {
                if (this.books.has(lastReadId)) {
                    this.openBook(lastReadId);
                }
            }, 100);
        }

        this.initializeSettingsHandlers();
    }
    
    bindEvents() {
        // File handling events
        this.dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.dropZone.classList.add('drag-over');
        });
        
        this.dropZone.addEventListener('dragleave', () => {
            this.dropZone.classList.remove('drag-over');
        });
        
        this.dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.dropZone.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            if (file && file.name.endsWith('.txt')) {
                this.loadFile(file);
            } else {
                alert('请选择 .txt 文件');
            }
        });

        document.querySelector('.select-file-btn').addEventListener('click', () => {
            this.fileInput.click();
        });

        this.fileInput.addEventListener('change', () => {
            const file = this.fileInput.files[0];
            if (file) {
                this.loadFile(file);
            }
        });
        
        // Navigation events
        document.getElementById('prevPage').addEventListener('click', () => this.prevPage());
        document.getElementById('nextPage').addEventListener('click', () => this.nextPage());
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.prevPage();
            if (e.key === 'ArrowRight') this.nextPage();
        });

        // Panel toggle events
        document.getElementById('showBookshelf').addEventListener('click', () => this.toggleBookshelfPanel());
        document.getElementById('showNotes').addEventListener('click', () => this.toggleNotesPanel());
        document.getElementById('showHistory').addEventListener('click', () => this.showReadingHistory());
        document.getElementById('showFontSettings').addEventListener('click', () => this.showFontSettings());

        // Theme toggle
        document.getElementById('toggleTheme').addEventListener('click', () => this.toggleTheme());

        // Close buttons for panels
        document.querySelectorAll('.close-button').forEach(button => {
            button.addEventListener('click', () => {
                const panel = button.closest('.side-panel, .modal-dialog');
                if (panel) {
                    if (panel.classList.contains('side-panel')) {
                        panel.classList.remove('show');
                    } else {
                        panel.style.display = 'none';
                    }
                }
            });
        });

        // Fullscreen toggle
        document.getElementById('fullscreen').addEventListener('click', () => this.toggleFullscreen());
        
        // Book management events
        document.getElementById('importBooks').addEventListener('click', () => this.importBooks());
        document.querySelectorAll('.book-categories .category').forEach(button => {
            button.addEventListener('click', () => this.filterBooks(button.dataset.category));
        });
        
        // Note management events
        document.getElementById('createNote').addEventListener('click', () => this.showNoteEditor());
        document.getElementById('exportNotes').addEventListener('click', () => this.exportNotes());
        document.querySelectorAll('.note-categories .category').forEach(button => {
            button.addEventListener('click', () => this.filterNotes(button.dataset.category));
        });

        // Search functionality
        const searchInput = document.getElementById('searchInput');
        const searchButton = document.getElementById('searchButton');
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') this.searchText(searchInput.value);
        });
        searchButton.addEventListener('click', () => this.searchText(searchInput.value));

        // Window events
        window.addEventListener('resize', () => this.updateLayout());
        window.addEventListener('beforeunload', () => {
            if (this.currentBook) {
                this.saveReadingProgress();
            }
        });

        // Add text selection and double-click handling
        this.textContent.addEventListener('mouseup', () => {
            const selection = window.getSelection();
            const selectedText = selection.toString().trim();
            if (selectedText) {
                this.selectedText = selectedText;
            }
        });

        this.textContent.addEventListener('dblclick', () => {
            if (this.selectedText) {
                this.showNoteEditor(this.selectedText);
            }
        });

        // Add missing button handlers
        document.getElementById('showCatalog')?.addEventListener('click', () => this.toggleCatalogPanel());
        document.getElementById('showSettings')?.addEventListener('click', () => this.toggleSettingsPanel());
        document.getElementById('showHelp')?.addEventListener('click', () => this.toggleHelpPanel());
        document.getElementById('saveNote').addEventListener('click', () => this.saveNote());
        document.getElementById('cancelNote').addEventListener('click', () => {
            document.getElementById('noteEditorDialog').style.display = 'none';
        });

        this.initializeSettingsHandlers();
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('readerSettings');
        if (savedSettings) {
            this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
        }
        this.applySettings();
    }

    saveSettings() {
        localStorage.setItem('readerSettings', JSON.stringify(this.settings));
    }

    loadBooks() {
        const savedBooks = localStorage.getItem('books');
        if (savedBooks) {
            try {
                const bookData = JSON.parse(savedBooks);
                this.books.clear();
                bookData.forEach(data => {
                    const book = new Book(data);
                    this.books.set(book.id, book);
                });
                
                const lastReadId = localStorage.getItem('lastReadBookId');
                if (lastReadId && this.books.has(lastReadId)) {
                    this.openBook(lastReadId);
                }
            } catch (error) {
                console.error('Error loading books:', error);
                alert('加载书籍时出错，请尝试重新导入。');
            }
        }
        this.updateBookList();
    }

    saveBooks() {
        try {
            const bookData = Array.from(this.books.values()).map(book => book.toJSON());
            localStorage.setItem('books', JSON.stringify(bookData));
            
            if (this.currentBook) {
                localStorage.setItem('lastReadBookId', this.currentBook.id);
            }
        } catch (error) {
            console.error('Error saving books:', error);
            alert('保存书籍时出错，请确保有足够的存储空间。');
        }
    }

    loadRecentFiles() {
        try {
            const savedFiles = localStorage.getItem('recentFiles');
            this.recentFiles = savedFiles ? JSON.parse(savedFiles) : [];
        } catch (error) {
            console.error('Error loading recent files:', error);
            this.recentFiles = [];
        }
        this.updateRecentFilesList();
    }

    addToRecentFiles(file) {
        if (!this.recentFiles) {
            this.recentFiles = [];
        }

        const recentFile = {
            name: file.name,
            path: file.path || '',
            lastOpened: new Date().toISOString()
        };

        // Remove existing entry with same path if exists
        const existingIndex = this.recentFiles.findIndex(f => f.name === file.name);
        if (existingIndex !== -1) {
            this.recentFiles.splice(existingIndex, 1);
        }

        // Add new entry at the beginning
        this.recentFiles.unshift(recentFile);

        // Keep only last 10 entries
        this.recentFiles = this.recentFiles.slice(0, 10);

        // Save to localStorage
        try {
            localStorage.setItem('recentFiles', JSON.stringify(this.recentFiles));
            this.updateRecentFilesList();
        } catch (error) {
            console.error('Error saving recent files:', error);
        }
    }

    updateRecentFilesList() {
        const recentFilesList = document.getElementById('recentFiles');
        if (!recentFilesList) return;

        recentFilesList.innerHTML = this.recentFiles.map(file => `
            <div class="recent-file-item" data-path="${file.path}">
                <div class="file-name">${file.name}</div>
                <div class="file-date">${new Date(file.lastOpened).toLocaleDateString()}</div>
            </div>
        `).join('');

        recentFilesList.querySelectorAll('.recent-file-item').forEach(item => {
            item.addEventListener('click', () => {
                const path = item.dataset.path;
                if (path) {
                    this.loadFile(path);
                }
            });
        });
    }

    loadFile(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target.result;
                
                const book = new Book({
                    id: Date.now().toString(),
                    title: file.name.replace('.txt', ''),
                    path: file.path || '',
                    content: content,
                    createdAt: new Date().toISOString()
                });

                this.books.set(book.id, book);
                this.currentBook = book;
                this.saveBooks();
                
                this.displayContent(content);
                this.fileName.textContent = book.title;
                
                this.updateBookList();
                
                // Add to recent files after successful load
                try {
                    this.addToRecentFiles(file);
                } catch (error) {
                    console.error('Error adding to recent files:', error);
                }
                
                alert(`成功导入《${book.title}》`);
            } catch (error) {
                console.error('Error loading file:', error);
                alert('加载文件时出错，请确保文件格式正确。');
            }
        };

        reader.onerror = (error) => {
            console.error('Error reading file:', error);
            alert('读取文件时出错，请重试。');
        };

        try {
            reader.readAsText(file);
        } catch (error) {
            console.error('Error reading file:', error);
            alert('读取文件时出错，请重试。');
        }
    }

    displayContent(content) {
        if (!content) return;
        
        try {
            this.dropZone.style.display = 'none';
            this.textContent.style.display = 'block';
            
            // Split content into paragraphs and add proper spacing
            const paragraphs = content.split('\n')
                .filter(line => line.trim()) // Remove empty lines
                .map(line => `<p>${line.trim()}</p>`);
            
            this.textContent.innerHTML = paragraphs.join('');
            
            // Ensure proper styling
            this.textContent.style.lineHeight = this.settings.lineHeight;
            this.textContent.style.padding = `20px ${this.settings.margin}px`;
            
            // Force layout recalculation
            this.textContent.parentElement?.offsetHeight;
            
            console.log('Content displayed successfully');
        } catch (error) {
            console.error('Error displaying content:', error);
            alert('显示内容时出错，请���试。');
        }
    }
    
    updateProgress() {
        if (!this.currentBook || !this.textContent) return;
        
        const container = this.textContent.parentElement;
        const progress = (container.scrollTop / (container.scrollHeight - container.clientHeight)) * 100;
        this.progress.textContent = `${Math.round(progress)}%`;
        
        const previousProgress = this.currentBook.progress;
        this.currentBook.progress = Math.round(progress);
        
        // Show congratulations when reaching 100% for the first time
        if (this.currentBook.progress === 100 && previousProgress !== 100) {
            this.showCongratulations();
        }
        
        this.currentBook.lastPosition = container.scrollTop;
        this.currentBook.lastRead = new Date().toISOString();
        
        const lastEntry = this.currentBook.history[this.currentBook.history.length - 1];
        const timeSinceLastEntry = lastEntry ? 
            (new Date() - new Date(lastEntry.timestamp)) / 1000 / 60 : Infinity;
        const progressDiff = lastEntry ? 
            Math.abs(this.currentBook.progress - lastEntry.progress) : Infinity;
        
        if (timeSinceLastEntry > 5 || progressDiff > 5) {
            this.currentBook.addHistoryEntry(container.scrollTop);
        }
        
        this.saveBooks();
    }
    
    prevPage() {
        if (!this.textContent) return;
        const container = this.textContent.parentElement;
        container.scrollTop -= container.clientHeight;
        this.updateProgress();
    }
    
    nextPage() {
        if (!this.textContent) return;
        const container = this.textContent.parentElement;
        container.scrollTop += container.clientHeight;
        this.updateProgress();
    }
    
    toggleBookshelfPanel() {
        const panel = document.getElementById('bookshelfPanel');
        panel.classList.toggle('show');
    }

    toggleNotesPanel() {
        const panel = document.getElementById('notesPanel');
        panel.classList.toggle('show');
    }

    toggleTheme() {
        this.settings.theme = this.settings.theme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        this.saveSettings();
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.settings.theme);
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
    
    updateLayout() {
        if (this.textContent) {
            this.updateProgress();
        }
    }

    searchText(query) {
        if (!query || !this.textContent) return;

        const content = this.textContent.innerHTML;
        const regex = new RegExp(query, 'gi');
        this.textContent.innerHTML = content.replace(regex, match => 
            `<span class="search-highlight">${match}</span>`
        );
    }

    showNoteEditor(noteOrSelectedText = '') {
        const dialog = document.getElementById('noteEditorDialog');
        dialog.style.display = 'block';
        
        // Clear previous values
        dialog.querySelector('#noteTitle').value = '';
        dialog.querySelector('#noteContent').value = '';
        dialog.querySelector('#noteTags').value = '';
        dialog.querySelector('#noteCategory').value = 'general';
        dialog.querySelector('.selected-text').textContent = '';
        
        // Remove any previous note ID
        delete dialog.dataset.noteId;
        
        if (typeof noteOrSelectedText === 'string') {
            // Handle new note with selected text
            if (noteOrSelectedText) {
                dialog.querySelector('.selected-text').textContent = noteOrSelectedText;
                dialog.querySelector('#noteContent').value = `选中文本：${noteOrSelectedText}\n\n笔记内容：`;
            }
        } else if (noteOrSelectedText && typeof noteOrSelectedText === 'object') {
            // Handle editing existing note
            const note = noteOrSelectedText;
            dialog.dataset.noteId = note.id;
            dialog.querySelector('#noteTitle').value = note.title;
            dialog.querySelector('#noteContent').value = note.content;
            dialog.querySelector('#noteCategory').value = note.category;
            dialog.querySelector('#noteTags').value = note.tags.join(', ');
            dialog.querySelector('.selected-text').textContent = note.selectedText;
        }
        
        if (this.currentBook) {
            dialog.querySelector('.book-title').textContent = `《${this.currentBook.title}》`;
        }
    }
    
    saveNote() {
        const dialog = document.getElementById('noteEditorDialog');
        const container = this.textContent.parentElement;
        
        try {
            if (!this.currentBook) {
                alert('请先打开一本书再添加笔记');
                return;
            }

            // Initialize notes array if it doesn't exist
            if (!this.currentBook.notes) {
                this.currentBook.notes = [];
            }

            const noteId = dialog.dataset.noteId;
            let note;

            if (noteId) {
                // Edit existing note
                note = this.currentBook.notes.find(n => n.id === noteId);
                if (!note) {
                    console.error('Note not found:', noteId);
                    return;
                }
                note.updated = new Date().toISOString();
            } else {
                // Create new note
                note = new Note({
                    bookId: this.currentBook.id,
                    created: new Date().toISOString(),
                    updated: new Date().toISOString(),
                    position: container ? container.scrollTop : 0
                });
                this.currentBook.notes.push(note);
            }

            // Update note data
            note.title = dialog.querySelector('#noteTitle').value || '未命名笔记';
            note.content = dialog.querySelector('#noteContent').value;
            note.category = dialog.querySelector('#noteCategory').value;
            note.selectedText = dialog.querySelector('.selected-text').textContent;
            note.tags = dialog.querySelector('#noteTags').value
                .split(',')
                .map(tag => tag.trim())
                .filter(Boolean);

            // Save to localStorage
            this.saveBooks();
            
            // Update UI
            this.updateNotesList();
            dialog.style.display = 'none';

            // Show success message
            alert('笔记保存成功！');
            
            console.log('Note saved:', note);
        } catch (error) {
            console.error('Error saving note:', error);
            alert('保存笔记时出错，请重试');
        }
    }
    
    exportNotes() {
        try {
            if (!this.currentBook || !this.currentBook.notes || this.currentBook.notes.length === 0) {
                alert('当前没有可导出的笔记');
                return;
            }

            const notesText = this.currentBook.notes.map(note => `
标题: ${note.title}
分类: ${note.category}
创建时间: ${new Date(note.created).toLocaleString()}
更新时间: ${new Date(note.updated).toLocaleString()}
标签: ${note.tags.join(', ')}
选中文本: ${note.selectedText}
笔记内容:
${note.content}
----------------------------------------
`).join('\n');

            const blob = new Blob([notesText], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${this.currentBook.title}_笔记_${new Date().toLocaleDateString()}.txt`;
            a.click();
            URL.revokeObjectURL(url);
            
            alert('笔记导出成功！');
        } catch (error) {
            console.error('Error exporting notes:', error);
            alert('导出笔记时出错，请重试');
        }
    }

    filterBooks(category) {
        const buttons = document.querySelectorAll('.book-categories .category');
        buttons.forEach(button => {
            button.classList.toggle('active', button.dataset.category === category);
        });

        const bookList = document.getElementById('bookList');
        const books = Array.from(this.books.values());
        const filteredBooks = category === 'all' ? books :
            books.filter(book => {
                switch (category) {
                    case 'reading': return book.progress > 0 && book.progress < 100;
                    case 'finished': return book.progress === 100;
                    case 'marked': return book.marked;
                    default: return true;
                }
            });

        this.updateBookList(filteredBooks);
    }

    filterNotes(category) {
        const buttons = document.querySelectorAll('.note-categories .category');
        buttons.forEach(button => {
            button.classList.toggle('active', button.dataset.category === category);
        });

        if (!this.currentBook || !this.currentBook.notes) return;

        const notesList = document.getElementById('notesList');
        const notes = category === 'all' ? this.currentBook.notes :
            this.currentBook.notes.filter(note => note.category === category);

        this.updateNotesList(notes);
    }

    updateBookList(books = Array.from(this.books.values())) {
        const bookList = document.getElementById('bookList');
        if (!bookList) return;

        bookList.innerHTML = books.map(book => `
            <div class="book-item ${this.currentBook?.id === book.id ? 'active' : ''}" data-id="${book.id}">
                <div class="book-cover">
                    ${book.cover ? `<img src="${book.cover}" alt="${book.title}">` : '📚'}
                </div>
                <div class="book-info">
                    <div class="book-title">${book.title}</div>
                    <div class="book-meta">
                        <span class="book-author">${book.author || '未知作者'}</span>
                        <span class="book-date">${new Date(book.lastRead).toLocaleDateString()}</span>
                    </div>
                    <div class="book-progress">
                        <div class="progress-bar" style="width: ${book.progress}%"></div>
                        <span class="progress-text">${book.progress}%</span>
                    </div>
                </div>
            </div>
        `).join('');

        bookList.querySelectorAll('.book-item').forEach(item => {
            item.addEventListener('click', () => {
                const bookId = item.dataset.id;
                this.openBook(bookId);
            });
        });
    }

    updateNotesList(notes = this.currentBook?.notes || []) {
        const notesList = document.getElementById('notesList');
        if (!notesList) return;

        try {
            notesList.innerHTML = notes.map(note => `
                <div class="note-item" data-id="${note.id}">
                    <div class="note-header">
                        <div class="note-title">
                            ${note.title}
                            <span class="note-category">${note.category}</span>
                        </div>
                        <div class="note-meta">
                            ${new Date(note.updated).toLocaleString()}
                            <button class="delete-note" title="删除笔记">×</button>
                        </div>
                    </div>
                    <div class="note-content">
                        ${note.selectedText ? `<div class="selected-text">"${note.selectedText}"</div>` : ''}
                        <div class="note-preview">${note.content}</div>
                    </div>
                    <div class="note-tags">
                        ${note.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
            `).join('');

            // Add event listeners for note items
            notesList.querySelectorAll('.note-item').forEach(item => {
                // Edit note
                item.addEventListener('click', (e) => {
                    if (!e.target.classList.contains('delete-note')) {
                        const noteId = item.dataset.id;
                        const note = this.currentBook.notes.find(n => n.id === noteId);
                        if (note) {
                            this.showNoteEditor(note);
                        }
                    }
                });

                // Delete note
                item.querySelector('.delete-note').addEventListener('click', (e) => {
                    e.stopPropagation();
                    const noteId = item.dataset.id;
                    if (confirm('确定要删除这条笔记吗？')) {
                        this.deleteNote(noteId);
                    }
                });
            });
        } catch (error) {
            console.error('Error updating notes list:', error);
            notesList.innerHTML = '<div class="error-message">加载笔记时出错</div>';
        }
    }

    deleteNote(noteId) {
        try {
            if (!this.currentBook || !this.currentBook.notes) return;
            
            const index = this.currentBook.notes.findIndex(note => note.id === noteId);
            if (index !== -1) {
                this.currentBook.notes.splice(index, 1);
                this.saveBooks();
                this.updateNotesList();
                alert('笔记已删除');
            }
        } catch (error) {
            console.error('Error deleting note:', error);
            alert('删除笔记时出错，请重试');
        }
    }

    openBook(bookId) {
        try {
            const book = this.books.get(bookId);
            if (!book) {
                console.error('Book not found:', bookId);
                return;
            }
            
            this.currentBook = book;
            console.log(`Opening book: ${book.title}, last position: ${book.lastPosition}`);
            
            // Initialize notes array if it doesn't exist
            if (!this.currentBook.notes) {
                this.currentBook.notes = [];
            }
            
            if (book.content) {
                // Display content first
                this.displayContent(book.content);
                
                // Enhanced position restoration
                const restorePosition = () => {
                    if (!this.textContent || !this.textContent.parentElement) return;
                    const container = this.textContent.parentElement;
                    
                    // Ensure content is fully loaded
                    if (container.scrollHeight > 0) {
                        // Restore position with validation
                        const maxScroll = container.scrollHeight - container.clientHeight;
                        const targetPosition = Math.min(book.lastPosition || 0, maxScroll);
                        
                        console.log(`Restoring position: ${targetPosition}/${maxScroll}`);
                        
                        // Smooth scroll to position
                        container.scrollTo({
                            top: targetPosition,
                            behavior: 'auto'
                        });
                        
                        // Double-check position after a short delay
                        setTimeout(() => {
                            if (container.scrollTop !== targetPosition) {
                                container.scrollTop = targetPosition;
                            }
                            this.updateProgress();
                        }, 100);
                    } else {
                        // Content not loaded yet, try again
                        console.log('Content not loaded, retrying...');
                        setTimeout(restorePosition, 100);
                    }
                };
                
                // Start position restoration
                setTimeout(restorePosition, 100);
                
                // Apply book-specific settings
                if (book.fontSize) {
                    this.textContent.style.fontSize = `${book.fontSize}px`;
                }
                if (book.fontFamily) {
                    this.textContent.style.fontFamily = book.fontFamily;
                }
                
                // Update UI
                this.fileName.textContent = book.title;
                this.dropZone.style.display = 'none';
                this.textContent.style.display = 'block';
                
                // Update book metadata
                book.lastRead = new Date().toISOString();
                this.saveBooks();
                
                // Close bookshelf panel
                this.toggleBookshelfPanel();
                
                // Set up scroll event listener for continuous progress saving
                const container = this.textContent.parentElement;
                if (container) {
                    let saveTimeout;
                    container.addEventListener('scroll', () => {
                        if (saveTimeout) clearTimeout(saveTimeout);
                        saveTimeout = setTimeout(() => this.saveReadingProgress(), 1000);
                    });
                }
            }

            // Update notes list when opening book
            this.updateNotesList();
        } catch (error) {
            console.error('Error opening book:', error);
            alert('打开书籍时出错，请重试。');
        }
    }
    
    importBooks() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.txt';
        input.multiple = true;
        input.onchange = (e) => {
            const files = Array.from(e.target.files);
            files.forEach(file => {
                if (file.name.endsWith('.txt')) {
                this.loadFile(file);
                }
            });
        };
        input.click();
    }

    toggleCatalogPanel() {
        // TODO: Implement catalog functionality
        alert('目录功能开发中...');
    }

    toggleSettingsPanel() {
        const dialog = document.getElementById('settingsDialog');
        if (dialog.style.display === 'none') {
            dialog.style.display = 'block';
            // Initialize color picker with current background color
            const colorPicker = document.getElementById('bgColorPicker');
            colorPicker.value = this.settings.backgroundColor;
            
            // Mark active preset color
            const presetButtons = document.querySelectorAll('.color-preset');
            presetButtons.forEach(button => {
                button.classList.toggle('active', button.dataset.color === this.settings.backgroundColor);
            });
        } else {
            dialog.style.display = 'none';
        }
    }

    initializeSettingsHandlers() {
        // Color picker change handler
        const colorPicker = document.getElementById('bgColorPicker');
        if (colorPicker) {
            colorPicker.addEventListener('input', (e) => {
                this.updateBackgroundColor(e.target.value);
            });
        }

        // Preset color buttons handler
        const presetButtons = document.querySelectorAll('.color-preset');
        presetButtons.forEach(button => {
            button.addEventListener('click', () => {
                const color = button.dataset.color;
                if (colorPicker) colorPicker.value = color;
                this.updateBackgroundColor(color);
            });
        });

        // Settings button handler
        const settingsButton = document.getElementById('showSettings');
        if (settingsButton) {
            settingsButton.addEventListener('click', () => {
                this.toggleSettingsDialog();
            });
        }

        // Save settings button handler
        const saveButton = document.getElementById('saveSettings');
        if (saveButton) {
            saveButton.addEventListener('click', () => {
                this.saveSettings();
                this.toggleSettingsDialog();
                alert('设置已保存！');
            });
        }

        // Reset settings button handler
        const resetButton = document.getElementById('resetSettings');
        if (resetButton) {
            resetButton.addEventListener('click', () => {
                if (confirm('确定要恢复默认设置吗？')) {
                    this.resetSettings();
                }
            });
        }
    }

    toggleSettingsDialog() {
        const dialog = document.getElementById('settingsDialog');
        if (dialog) {
            const isHidden = dialog.style.display === 'none';
            dialog.style.display = isHidden ? 'block' : 'none';
            
            if (isHidden) {
                // Update color picker with current background color
                const colorPicker = document.getElementById('bgColorPicker');
                if (colorPicker) {
                    colorPicker.value = this.settings.backgroundColor;
                }
                
                // Update active preset color
                const presetButtons = document.querySelectorAll('.color-preset');
                presetButtons.forEach(button => {
                    button.classList.toggle('active', button.dataset.color === this.settings.backgroundColor);
                });
            }
        }
    }

    updateBackgroundColor(color) {
        this.settings.backgroundColor = color;
        if (this.textContent) {
            this.textContent.style.backgroundColor = color;
            
            // Automatically adjust text color based on background brightness
            const brightness = this.getColorBrightness(color);
            this.textContent.style.color = brightness > 128 ? '#000000' : '#ffffff';
        }
        
        // Update active state of preset buttons
        const presetButtons = document.querySelectorAll('.color-preset');
        presetButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.color === color);
        });
    }

    getColorBrightness(color) {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        return (r * 299 + g * 587 + b * 114) / 1000;
    }

    resetSettings() {
        this.settings = {
            ...this.settings,
            backgroundColor: '#ffffff'
        };
        this.updateBackgroundColor(this.settings.backgroundColor);
        
        // Update color picker and preset buttons
        const colorPicker = document.getElementById('bgColorPicker');
        if (colorPicker) {
            colorPicker.value = this.settings.backgroundColor;
        }
        
        const presetButtons = document.querySelectorAll('.color-preset');
        presetButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.color === this.settings.backgroundColor);
        });
    }

    toggleHelpPanel() {
        const helpContent = `
快捷键说明：
- ← / → : 上一页/下一页
- Ctrl + B : 显示/隐藏书架
- Ctrl + N : 显示/隐藏笔记
- Ctrl + T : 切换主题
- F11 : 全屏模式

使用说明：
1. 拖入或选择 .txt 文件开始阅读
2. 双击选中文本可添加笔记
3. 使用工具栏按钮调整设置
4. 点击书架按钮管理书籍
5. 点击笔记按钮管理笔记
        `;
        alert(helpContent);
    }

    applySettings() {
        if (!this.settings) return;

        // Apply font settings
        if (this.textContent) {
            this.textContent.style.fontSize = `${this.settings.defaultFontSize}px`;
            this.textContent.style.fontFamily = this.settings.defaultFontFamily;
            this.textContent.style.lineHeight = this.settings.lineHeight;
            this.textContent.style.padding = `20px ${this.settings.margin}px`;
            this.textContent.style.backgroundColor = this.settings.backgroundColor;
        }

        // Apply theme
        this.applyTheme();
    }

    // Add a method to save reading progress
    saveReadingProgress() {
        if (!this.currentBook || !this.textContent) return;
        
        const container = this.textContent.parentElement;
        if (!container) return;
        
        try {
            // Save the exact scroll position
            const scrollTop = Math.round(container.scrollTop);
            this.currentBook.lastPosition = scrollTop;
            
            // Calculate and save progress percentage
            const maxScroll = container.scrollHeight - container.clientHeight;
            const progress = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;
            this.currentBook.progress = Math.round(progress);
            
            // Update reading time
            const now = new Date();
            const lastReadTime = new Date(this.currentBook.lastRead);
            const timeDiff = now - lastReadTime;
            if (timeDiff > 1000) { // Only update if more than 1 second has passed
                this.currentBook.readingTime += Math.round(timeDiff / 1000);
                this.currentBook.lastRead = now.toISOString();
            }
            
            // Add history entry if significant change
            const lastEntry = this.currentBook.history[this.currentBook.history.length - 1];
            const timeSinceLastEntry = lastEntry ? 
                (now - new Date(lastEntry.timestamp)) / 1000 : Infinity;
            const progressDiff = lastEntry ? 
                Math.abs(this.currentBook.progress - lastEntry.progress) : Infinity;
            
            if (timeSinceLastEntry > 30 || progressDiff > 2) {
                this.currentBook.addHistoryEntry(scrollTop);
            }
            
            // Save to localStorage
            this.saveBooks();
            
            // Save last read book ID
            localStorage.setItem('lastReadBookId', this.currentBook.id);
            
            console.log(`Progress saved: ${this.currentBook.progress}%, position: ${scrollTop}`);
        } catch (error) {
            console.error('Error saving reading progress:', error);
        }
    }

    // Add showCongratulations method
    showCongratulations() {
        // Create congratulations dialog HTML
        const dialog = document.createElement('div');
        dialog.className = 'congratulations-dialog';
        dialog.innerHTML = `
            <div class="congratulations-content">
                <div class="congratulations-image">
                    🎉📚✨
                </div>
                <h2>恭喜你完成阅读！</h2>
                <p>这是你读完的第 <span class="book-count">${this.getCompletedBooksCount()}</span> 本书</p>
                <p class="book-title">《${this.currentBook.title}》</p>
                <div class="stats">
                    <div class="stat-item">
                        <span class="label">阅读时长</span>
                        <span class="value">${this.formatReadingTime(this.currentBook.readingTime)}</span>
                    </div>
                    <div class="stat-item">
                        <span class="label">做了笔记</span>
                        <span class="value">${this.currentBook.notes?.length || 0} 条</span>
                    </div>
                </div>
                <div class="encouragement">${this.getRandomEncouragement()}</div>
                <button class="close-congrats">继续阅读</button>
            </div>
        `;

        // Add to document
        document.body.appendChild(dialog);

        // Add close handler
        dialog.querySelector('.close-congrats').addEventListener('click', () => {
            dialog.remove();
        });

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (document.body.contains(dialog)) {
                dialog.remove();
            }
        }, 5000);
    }

    // Helper method to get completed books count
    getCompletedBooksCount() {
        return Array.from(this.books.values()).filter(book => book.progress === 100).length;
    }

    // Helper method to format reading time
    formatReadingTime(seconds) {
        if (!seconds) return '0分钟';
        if (seconds < 60) return `${seconds}秒`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}分钟`;
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}小时${remainingMinutes}分钟`;
    }

    // Helper method to get random encouragement message
    getRandomEncouragement() {
        const messages = [
            "太棒了！书中自有黄金屋！",
            "继续加油！知识就是力量！",
            "厉害！读书破万卷，下笔如有神！",
            "真了不起！书山有路勤为径！",
            "太优秀了！学海无涯苦作舟！",
            "了不起！读万卷书，行万里路！",
            "真棒！开卷有益，读书明智！",
            "excellent！书中自有颜如玉！",
            "真不错！读书之乐乐无穷！",
            "真厉害！读书破万卷，下笔如有神！"
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    }
}

// Initialize the reader when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.reader = new ChineseReader();
}); 
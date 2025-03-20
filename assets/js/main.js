document.addEventListener('DOMContentLoaded', () => {
    // Load section content
    async function loadSection(id, file) {
        try {
            const response = await fetch(`/content/sections/${file}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const markdown = await response.text();
            document.getElementById(id).innerHTML = marked.parse(markdown);
        } catch (error) {
            console.error('Error loading section:', error);
            document.getElementById(id).innerHTML = '<p>Error loading content. Please check the file path and try again.</p>';
        }
    }

    // Parse front matter from markdown
    function parseFrontMatter(markdown) {
        const match = markdown.match(/^---([\s\S]*?)---\n([\s\S]*)$/);
        if (!match) return { content: markdown };

        try {
            const frontMatter = {};
            match[1].split('\n').forEach(line => {
                const [key, ...value] = line.split(':');
                if (key && value.length) {
                    frontMatter[key.trim()] = value.join(':').trim();
                }
            });
            return {
                ...frontMatter,
                content: match[2]
            };
        } catch (error) {
            return { content: markdown };
        }
    }

    // Load and display blogs
    async function loadBlogs() {
        try {
            const response = await fetch('/content/blogs/metadata.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const blogItems = document.getElementById('blog-items');
            
            if (!blogItems) return;
            
            // Filter out blogs whose files don't exist
            const availableBlogs = data.blogs.filter(blog => {
                try {
                    fetch(`/content/blogs/${blog.file}`);
                    return true;
                } catch {
                    return false;
                }
            });

            if (availableBlogs.length === 0) {
                blogItems.innerHTML = '<li class="blog-item">No blogs found.</li>';
                return;
            }
            
            availableBlogs.forEach(blog => {
                const li = document.createElement('li');
                li.className = 'blog-item';
                li.innerHTML = `
                    <span class="blog-title">${blog.title}</span>
                    <span class="blog-date">${blog.date}</span>
                `;
                li.addEventListener('click', () => loadBlogContent(blog.file));
                blogItems.appendChild(li);
            });
        } catch (error) {
            console.error('Error loading blogs:', error);
            const blogItems = document.getElementById('blog-items');
            if (blogItems) {
                blogItems.innerHTML = '<li class="blog-item">Error loading blogs. Please check metadata.json.</li>';
            }
        }
    }

    // Load blog content
    async function loadBlogContent(file) {
        try {
            const response = await fetch(`/content/blogs/${file}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const markdown = await response.text();
            const { content, ...metadata } = parseFrontMatter(markdown);
            const blogsContent = document.getElementById('blogs-content');
            
            if (!blogsContent) return;
            
            // Store the original content
            const originalContent = blogsContent.innerHTML;
            
            // Update content with blog
            blogsContent.innerHTML = `
                <button class="back-btn">← Back to Blogs</button>
                <h1>${metadata.title || ''}</h1>
                <div class="blog-date">${metadata.date || ''}</div>
                ${marked.parse(content)}
            `;
            
            // Handle back button
            const backBtn = blogsContent.querySelector('.back-btn');
            if (backBtn) {
                backBtn.addEventListener('click', () => {
                    blogsContent.innerHTML = originalContent;
                    // Reattach event listeners to blog items
                    document.querySelectorAll('.blog-item').forEach(item => {
                        const title = item.querySelector('.blog-title').textContent;
                        item.addEventListener('click', () => loadBlogContent(file));
                    });
                });
            }

            // Scroll to blogs section
            blogsContent.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Error loading blog content:', error);
            const blogsContent = document.getElementById('blogs-content');
            if (blogsContent) {
                blogsContent.innerHTML = '<p>Error loading blog content. Please try again.</p>';
            }
        }
    }

    // Initialize sections and content
    function initializeSections() {
        const sections = document.querySelectorAll('.section');
        
        sections.forEach((section, index) => {
            const header = section.querySelector('.section-header');
            const content = section.querySelector('.section-content');
            const icon = header.querySelector('.expand-icon');
            
            if (!header || !content || !icon) return;
            
            // Set up click handler
            header.addEventListener('click', (e) => {
                e.preventDefault();
                content.classList.toggle('active');
                icon.textContent = content.classList.contains('active') ? '-' : '+';
            });
            
            // Auto-expand first section (About)
            if (index === 0) {
                content.classList.add('active');
                icon.textContent = '-';
            } else {
                content.classList.remove('active');
                icon.textContent = '+';
            }
        });
    }

    // Load initial content
    Promise.all([
        loadSection('about-content', 'about.md'),
        loadSection('projects-content', 'projects.md'),
        loadBlogs()
    ]).then(() => {
        initializeSections();
    }).catch(error => {
        console.error('Error initializing content:', error);
    });
}); 
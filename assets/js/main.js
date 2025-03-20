document.addEventListener('DOMContentLoaded', () => {
    // Load section content
    async function loadSection(id, file) {
        try {
            const response = await fetch(`content/sections/${file}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const markdown = await response.text();
            document.getElementById(id).innerHTML = marked.parse(markdown);
        } catch (error) {
            console.error('Error loading section:', error);
            document.getElementById(id).innerHTML = '<p>Error loading content. Please try again.</p>';
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
            const blogItems = document.getElementById('blog-items');
            if (!blogItems) return;
            
            // List of blog files - hardcoded for GitHub Pages
            const blogFiles = [
                { file: 'journey-into-ai.md', title: 'My Journey into AI and Deep Tech' },
                { file: 'blog_001.md', title: 'Blog Post 1' }
            ];
            
            // Create blog list
            blogItems.innerHTML = '';
            
            blogFiles.forEach(blog => {
                const li = document.createElement('li');
                li.className = 'blog-item';
                li.innerHTML = `<span class="blog-title">${blog.title}</span>`;
                li.addEventListener('click', () => loadBlogContent(blog.file));
                blogItems.appendChild(li);
            });
        } catch (error) {
            console.error('Error loading blogs:', error);
            const blogItems = document.getElementById('blog-items');
            if (blogItems) {
                blogItems.innerHTML = '<li class="blog-item">No blogs found.</li>';
            }
        }
    }

    // Load blog content
    async function loadBlogContent(file) {
        try {
            const response = await fetch(`content/blogs/${file}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const markdown = await response.text();
            const parsedContent = parseFrontMatter(markdown);
            const blogsContent = document.getElementById('blogs-content');
            
            if (!blogsContent) return;
            
            // Store the original content
            const originalContent = blogsContent.innerHTML;
            
            // Update content with blog
            blogsContent.innerHTML = `
                <button class="back-btn">← Back to Blogs</button>
                ${marked.parse(parsedContent.content)}
            `;
            
            // Handle back button
            const backBtn = blogsContent.querySelector('.back-btn');
            if (backBtn) {
                backBtn.addEventListener('click', () => {
                    blogsContent.innerHTML = originalContent;
                    // Reattach event listeners
                    loadBlogs();
                });
            }

            // Scroll to blog content
            blogsContent.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Error loading blog content:', error);
            const blogsContent = document.getElementById('blogs-content');
            if (blogsContent) {
                blogsContent.innerHTML = '<p>Error loading blog content. Please try again.</p>';
            }
        }
    }

    // Initialize sections
    function initializeSections() {
        document.querySelectorAll('.section').forEach((section, index) => {
            const header = section.querySelector('.section-header');
            const content = section.querySelector('.section-content');
            const icon = header.querySelector('.expand-icon');
            
            if (!header || !content || !icon) return;
            
            header.addEventListener('click', () => {
                content.classList.toggle('active');
                icon.textContent = content.classList.contains('active') ? '-' : '+';
            });
            
            // Auto-expand first section (About)
            if (index === 0) {
                content.classList.add('active');
                icon.textContent = '-';
            }
        });
    }

    // Initialize everything
    Promise.all([
        loadSection('about-content', 'about.md'),
        loadSection('projects-content', 'projects.md'),
        loadBlogs()
    ])
    .then(initializeSections)
    .catch(error => console.error('Error initializing content:', error));
}); 
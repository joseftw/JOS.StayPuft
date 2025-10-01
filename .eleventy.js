const moment = require('moment');

module.exports = function(eleventyConfig) {
  // Copy static assets
  eleventyConfig.addPassthroughCopy("assets/built");
  eleventyConfig.addPassthroughCopy("assets/css/fonts");
  
  // Add computed data for post permalinks
  eleventyConfig.addGlobalData("eleventyComputed", {
    permalink: (data) => {
      // Only for markdown posts
      if (data.page.inputPath && data.page.inputPath.includes('/posts/') && data.page.inputPath.endsWith('.md')) {
        const slug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        return `/${slug}/`;
      }
      return data.permalink;
    }
  });
  
  // Collections
  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("posts/**/*.md").sort((a, b) => {
      return b.date - a.date;
    });
  });
  
  eleventyConfig.addCollection("tagList", function(collectionApi) {
    const tagSet = new Set();
    collectionApi.getAll().forEach(item => {
      if (item.data.tags) {
        item.data.tags.forEach(tag => tagSet.add(tag));
      }
    });
    return [...tagSet].sort();
  });
  
  eleventyConfig.addCollection("authorList", function(collectionApi) {
    const authorSet = new Set();
    collectionApi.getAll().forEach(item => {
      if (item.data.author) {
        authorSet.add(item.data.author);
      }
    });
    return [...authorSet].sort();
  });
  
  // Filters
  eleventyConfig.addFilter("dateFormat", function(date, format) {
    return moment(date).format(format || 'MMMM Do, YYYY');
  });
  
  eleventyConfig.addFilter("limit", function(array, limit) {
    return array.slice(0, limit);
  });
  
  eleventyConfig.addFilter("filterByTag", function(posts, tag) {
    return posts.filter(post => post.data.tags && post.data.tags.includes(tag));
  });
  
  eleventyConfig.addFilter("filterByAuthor", function(posts, author) {
    return posts.filter(post => post.data.author === author);
  });
  
  eleventyConfig.addFilter("slugify", function(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  });
  
  eleventyConfig.addFilter("striptags", function(str) {
    return str.replace(/<[^>]+>/g, '');
  });
  
  eleventyConfig.addFilter("truncate", function(str, length) {
    if (str.length <= length) return str;
    return str.substring(0, length) + '...';
  });
  
  // Ignore documentation markdown files
  eleventyConfig.ignores.add("README.md");
  eleventyConfig.ignores.add("BUILD.md");
  eleventyConfig.ignores.add("STATIC_*.md");
  eleventyConfig.ignores.add("IMPLEMENTATION_*.md");
  eleventyConfig.ignores.add("docs/**");
  eleventyConfig.ignores.add(".github/**");
  
  // Don't use .gitignore (it ignores posts/)
  eleventyConfig.setUseGitIgnore(false);
  
  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes",
      layouts: "_layouts"
    },
    templateFormats: ["md", "njk", "html"],
    markdownTemplateEngine: false, // Don't process markdown with Nunjucks
    htmlTemplateEngine: "njk"
  };
};

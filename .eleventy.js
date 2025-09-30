const moment = require('moment');

module.exports = function(eleventyConfig) {
  // Copy static assets
  eleventyConfig.addPassthroughCopy("assets/built");
  eleventyConfig.addPassthroughCopy("assets/css/fonts");
  
  // Add collections for posts and pages
  eleventyConfig.addCollection("posts", function(collection) {
    return collection.getFilteredByGlob("content/posts/*.md").sort((a, b) => {
      return b.date - a.date; // Sort by date descending
    });
  });
  
  eleventyConfig.addCollection("pages", function(collection) {
    return collection.getFilteredByGlob("content/pages/*.md");
  });
  
  // Get featured posts
  eleventyConfig.addCollection("featuredPosts", function(collection) {
    return collection.getFilteredByGlob("content/posts/*.md")
      .filter(post => post.data.featured)
      .sort((a, b) => b.date - a.date);
  });
  
  // Custom filters
  eleventyConfig.addFilter("dateFormat", function(date, format) {
    return moment(date).format(format || 'MMMM Do, YYYY');
  });
  
  eleventyConfig.addFilter("timeago", function(date) {
    return moment(date).fromNow();
  });
  
  eleventyConfig.addFilter("limit", function(array, limit) {
    if (!array || !Array.isArray(array)) return [];
    return array.slice(0, limit);
  });
  
  eleventyConfig.addFilter("excerpt", function(content, length = 200) {
    if (!content) return '';
    const text = content.replace(/<[^>]+>/g, ''); // Strip HTML
    return text.substring(0, length) + (text.length > length ? '...' : '');
  });
  
  // Ignore markdown docs (not content)
  eleventyConfig.ignores.add("README.md");
  eleventyConfig.ignores.add("BUILD.md");
  eleventyConfig.ignores.add("STATIC_*.md");
  eleventyConfig.ignores.add("IMPLEMENTATION_*.md");
  eleventyConfig.ignores.add("docs/**");
  
  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes",
      layouts: "_layouts",
      data: "_data"
    },
    templateFormats: ["md", "njk", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk"
  };
};

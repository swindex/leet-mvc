const fs = require('fs');

module.exports = {
  process(sourceText, sourcePath) {
    // Read the HTML file content
    const content = fs.readFileSync(sourcePath, 'utf-8');
    
    // Return it as a JavaScript module that exports the HTML string
    return {
      code: `module.exports = ${JSON.stringify(content)};`
    };
  }
};
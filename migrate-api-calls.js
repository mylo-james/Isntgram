#!/usr/bin/env node
/**
 * Migration script to fix apiCall usage patterns
 * This script helps convert from old fetch patterns to new apiCall middleware patterns
 *
 * Usage: node migrate-api-calls.js
 */

const fs = require("fs");
const path = require("path");
const glob = require("glob");

// Common patterns to fix
const patterns = [
  // Pattern 1: Remove .json() calls after apiCall
  {
    search: /const\s+(\{[^}]+\}|\w+)\s*=\s*await\s+(\w+)\.json\(\);/g,
    replace: "// $1 is already parsed by apiCall middleware",
  },

  // Pattern 2: Remove res.ok checks after apiCall (apiCall throws on error)
  {
    search: /if\s*\(\s*!\s*(\w+)\.ok\s*\)\s*\{[\s\S]*?\}/g,
    replace: "// Error handling done by apiCall middleware",
  },

  // Pattern 3: Convert fetch + apiCall patterns
  {
    search:
      /const\s+(\w+)\s*=\s*await\s+apiCall\([^)]+\);\s*if\s*\(\s*!\s*\1\.ok\s*\)\s*\{[\s\S]*?\}\s*const\s+(\{[^}]+\}|\w+)\s*=\s*await\s+\1\.json\(\);/g,
    replace: "const $2 = await apiCall($1);",
  },
];

// Snake case to camel case property mappings
const propertyMappings = {
  user_followed_id: "userFollowedId",
  profile_image_url: "profileImageUrl",
  created_at: "createdAt",
  updated_at: "updatedAt",
  user_id: "userId",
  post_id: "postId",
  comment_id: "commentId",
  like_count: "likeCount",
  comment_count: "commentCount",
  image_url: "imageUrl",
  full_name: "fullName",
  access_token: "accessToken",
  likeable_id: "likeableId",
  likeable_type: "likeableType",
};

function migratePropPattern(content) {
  let result = content;

  // Convert snake_case property destructuring to camelCase
  for (const [snakeCase, camelCase] of Object.entries(propertyMappings)) {
    // Pattern: { snake_case: variable }
    const destructurePattern = new RegExp(
      `\\{\\s*${snakeCase}\\s*:([^}]+)\\}`,
      "g"
    );
    result = result.replace(destructurePattern, `{ ${camelCase}:$1}`);

    // Pattern: object.snake_case
    const accessPattern = new RegExp(`\\.${snakeCase}\\b`, "g");
    result = result.replace(accessPattern, `.${camelCase}`);

    // Pattern: "snake_case" property names in objects
    const quotedPattern = new RegExp(`["']${snakeCase}["']`, "g");
    result = result.replace(quotedPattern, `"${camelCase}"`);
  }

  return result;
}

function migrateFile(filePath) {
  console.log(`Processing ${filePath}...`);

  let content = fs.readFileSync(filePath, "utf8");
  let modified = false;

  // Apply pattern fixes
  for (const pattern of patterns) {
    const originalContent = content;
    content = content.replace(pattern.search, pattern.replace);
    if (content !== originalContent) {
      modified = true;
    }
  }

  // Apply property name conversions
  const originalContent = content;
  content = migratePropPattern(content);
  if (content !== originalContent) {
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated ${filePath}`);
  } else {
    console.log(`⏭️  No changes needed for ${filePath}`);
  }
}

// Find all TypeScript/JavaScript files in src
const files = glob.sync("src/**/*.{ts,tsx,js,jsx}", {
  ignore: ["src/utils/apiMiddleware.ts", "src/utils/caseConversion.ts"],
});

console.log(`Found ${files.length} files to process...\n`);

files.forEach(migrateFile);

console.log("\n✨ Migration complete!");
console.log("\n📝 Manual review needed for:");
console.log("   - Complex destructuring patterns");
console.log("   - Custom error handling logic");
console.log("   - FormData uploads (should not be converted)");
console.log("\n🧪 Test your application thoroughly after migration!");

---
name: wordpress-elementor
description: >
  Edit Elementor pages and manage templates on WordPress sites.
  Workflow: identify page, choose editing method (browser or WP-CLI), execute, verify.
  Use when editing Elementor pages, updating text in Elementor widgets,
  applying or managing Elementor templates, or making content changes
  to pages built with Elementor page builder.
compatibility: claude-code-only
---

Edit Elementor pages and manage templates on existing WordPress sites. Produces updated page content via browser automation (for visual/structural changes) or WP-CLI (for safe text replacements).

- Working WP-CLI connection or admin access (use **wordpress-setup** skill)
- Elementor installed and active: `wp @site plugin status elementor`

### Step 1: Identify the Page
```bash
# List Elementor pages
wp @site post list --post_type=page --meta_key=_elementor_edit_mode --meta_value=builder \
  --fields=ID,post_title,post_name,post_status

# Editor URL format: https://example.com/wp-admin/post.php?post={ID}&action=elementor
```

### Step 2: Choose Editing Method
| Change Type | Method | Risk |
|-------------|--------|------|
| Text content updates | WP-CLI search-replace | Low (with backup) |
| Image URL swaps | WP-CLI meta update | Low (with backup) |
| Widget styling | Browser automation | None |
| Add/remove sections | Browser automation | None |
| Layout changes | Browser automation | None |
| Template application | Browser automation | None |

**Rule of thumb**: If you're only changing text or URLs within existing widgets, WP-CLI is faster. For anything structural, use the visual editor via browser.

### Step 3a: Text Updates via WP-CLI
**Always back up first**:

```bash
wp @site post meta get {post_id} _elementor_data > /tmp/elementor-backup-{post_id}.json
```

**Pre-flight checklist**:

1. Back up the postmeta (above)
2. Dry run the replacement
3. Verify the dry run matches expectations (correct number of replacements)
4. Execute
5. Flush CSS cache
6. Verify visually

**Simple text replacement**:

```bash
# Dry run
wp @site search-replace "Old Heading Text" "New Heading Text" wp_postmeta \
  --include-columns=meta_value --dry-run --precise

# Execute (after confirming dry run looks correct)
wp @site search-replace "Old Heading Text" "New Heading Text" wp_postmeta \
  --include-columns=meta_value --precise
```

**After updating**, clear Elementor's CSS cache:

```bash
wp @site elementor flush-css
```

If the `elementor` WP-CLI command isn't available:

```bash
wp @site option delete _elementor_global_css
wp @site post meta delete-all _elementor_css
```

**What's safe to replace**:

| Safe | Risky |
|------|-------|
| Headings text | HTML structure |
| Paragraph text | Widget IDs |
| Button text and URLs | Section/column settings |
| Image URLs (same dimensions) | Layout properties |
| Phone numbers, emails | CSS classes |
| Addresses | Element ordering |

### Step 3b: Visual Editing via Browser Automation
For structural changes, use browser automation to interact with Elementor's visual editor.

**Login flow** (skip if already logged in):

1. Navigate to `https://example.com/wp-admin/`
2. Enter username and password
3. Click "Log In"
4. Wait for dashboard to load

**Open the editor**:

1. Navigate to `https://example.com/wp-admin/post.php?post={ID}&action=elementor`
2. Wait for Elementor loading overlay to disappear (can take 5-10 seconds)
3. Editor is ready when the left sidebar shows widget panels

**Edit text content**:

1. Click on the text element in the page preview (right panel)
2. The element becomes selected (blue border)
3. The left sidebar shows the element's settings
4. Under "Content" tab, edit the text in the editor field
5. Changes appear live in the preview
6. Click "Update" (green button, bottom left) or Ctrl+S

### Step 4: Manage Templates
**List saved templates**:

```bash
wp @site post list --post_type=elementor_library --fields=ID,post_title,post_status
```

**Duplicate an existing page via WP-CLI**:

```bash
# Get source page's Elementor data
SOURCE_DATA=$(wp @site post meta get {source_id} _elementor_data)
SOURCE_CSS=$(wp @site post meta get {source_id} _elementor_page_settings)

# Create new page
NEW_ID=$(wp @site post create --post_type=page --post_title="Duplicated Page" --post_status=draft --porcelain)

# Copy Elementor data
wp @site post meta update $NEW_ID _elementor_data "$SOURCE_DATA"
wp @site post meta update $NEW_ID _elementor_edit_mode "builder"
wp @site post meta update $NEW_ID _elementor_page_settings "$SOURCE_CSS"

# Regenerate CSS
wp @site elementor flush-css
```

### Step 5: Verify
```bash
# Check the page status
wp @site post get {post_id} --fields=ID,post_title,post_status,guid
```

---

### Elementor Data Format
Elementor stores page content as JSON in `_elementor_data` postmeta. The structure is:

```
Section > Column > Widget
```

Each element has an `id`, `elType`, `widgetType`, and `settings` object. Direct manipulation of this JSON is possible but fragile — always back up first and prefer `search-replace` over manual JSON editing.

### CSS Cache
After any WP-CLI change to Elementor data, you must flush the CSS cache:

```bash
wp @site elementor flush-css
# OR if elementor CLI not available:
wp @site option delete _elementor_global_css
wp @site post meta delete-all _elementor_css
```

### Global Widgets
Global widgets are shared across pages. Editing one updates all instances.

```bash
# List global widgets
wp @site post list --post_type=elementor_library --meta_key=_elementor_template_type \
  --meta_value=widget --fields=ID,post_title
```

**Caution**: Replacing text in a global widget's data affects every page that uses it.

### Common Elementor WP-CLI Commands
```bash
wp @site elementor flush-css          # Clear CSS cache
wp @site elementor library sync       # Sync with template library
wp @site elementor update db          # Update database after version change
```

Source: jezweb/claude-skills — https://github.com/jezweb/claude-skills/tree/main/plugins/wordpress/skills/wordpress-elementor

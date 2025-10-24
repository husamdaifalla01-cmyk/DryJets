# Blog Management Guide - DryJets Marketing Dashboard

Complete guide to creating, managing, and publishing SEO-optimized blog posts using Mira AI.

---

## 🚀 Quick Start

### 1. Access the Dashboard

```
URL: http://localhost:3003
Login: admin@example.com
Password: password123
```

### 2. Navigate to Blogs

Click "Blogs" in the sidebar or go to `/blogs`

---

## 📝 Creating a Blog Post

### Method A: Generate with Mira AI (Recommended)

**Step 1: Start Generation**
- Click "Generate with AI" button on Blogs page
- Or navigate to `/blogs/generate`

**Step 2: Configure Blog Parameters**

| Field | Example | Purpose |
|-------|---------|---------|
| Theme | Local SEO Guide | Content type and focus |
| City | Ottawa | Geographic targeting |
| Focus | Help customers find quality services | Main message |

**Available Themes**:
- `local_seo` - Local search optimization
- `service_tips` - How-to and tips content
- `how_to` - Step-by-step guides
- `trends` - Industry trends
- `seasonal` - Seasonal content

**Step 3: Generate**
- Click "Generate Blog Post"
- Wait 15-30 seconds
- Review the generated content preview

**Step 4: Publish or Edit**
- Click "Review & Publish" to go to editor
- Or click "Generate Another" to create more blogs

---

### Method B: Manual Creation

1. Go to Blogs page
2. Click "Create Blog" (if available)
3. Fill in all fields manually
4. Save as draft
5. Publish when ready

---

## ✏️ Editing Blog Posts

### Edit Existing Blog

**Option 1: From Listing**
1. Go to Blogs page
2. Find the blog you want to edit
3. Click the **Edit** (pencil) icon
4. Make your changes
5. Click "Save Draft"
6. Click "Publish Now" when ready

**Option 2: From Detail View**
1. Click the **View** (eye) icon on any blog
2. Click "Edit Post" button
3. Make your changes
4. Click "Save Draft"
5. Click "Publish Now"

### What You Can Edit

- **Title** - Main blog title (important for SEO)
- **Meta Title** - What appears in search results (60 char limit)
- **Meta Description** - Search result snippet (160 char limit)
- **Keywords** - SEO keywords (5-7 recommended)
- **Excerpt** - Blog summary/introduction
- **Content** - Full blog content (markdown supported)

### Character Limits

| Field | Limit | Why |
|-------|-------|-----|
| Meta Title | 60 characters | Google search results truncate after 60 chars |
| Meta Description | 160 characters | Mobile search results show ~160 chars |
| Keywords | Recommended 5-7 | Avoid keyword stuffing |

---

## 🔍 Managing Blog Posts

### View All Blogs

**Go to Blogs page** → See all blog posts in card view

**Features**:
- Status badge (color-coded)
- Blog title and excerpt
- Keywords preview
- View count and creator
- Created date

### Filter by Status

**On Blogs page:**
- Click status buttons: `DRAFT`, `PENDING_REVIEW`, `PUBLISHED`, `ARCHIVED`
- Shows only blogs with that status
- Click again to clear filter

**Status Meanings**:
- **DRAFT** - Being worked on, not published
- **PENDING_REVIEW** - Ready for review before publishing
- **PUBLISHED** - Live on website, indexed by search
- **ARCHIVED** - No longer active

### Search Blogs

**On Blogs page:**
1. Enter search term in search box
2. Search by:
   - Blog title
   - Blog slug (URL-friendly name)
3. Results update instantly

---

## 📖 Viewing Blog Details

### Access Blog Detail Page

**Option 1: From Listing**
- Click **View** (eye) icon on blog card

**Option 2: Direct Link**
- Navigate to `/blogs/[id]`

### What You See

**Main Content**:
- Full blog article
- Nicely formatted with markdown styling
- Keywords displayed as tags

**Search Result Preview**:
- How the blog appears in Google search results
- Meta title (in blue, clickable)
- URL slug (in green)
- Meta description (truncated)

**Right Sidebar**:
- Publishing information (status, dates, creator)
- Content statistics (words, keywords, SERP rank, repurposing count)
- Action buttons (Edit, Repurpose)

### Copy Blog URL

1. Click "Copy URL" button
2. Gets copied to clipboard
3. Button shows "Copied!" confirmation
4. Paste URL anywhere

---

## 🚀 Publishing Workflow

### Before Publishing

Ensure your blog has:
- ✅ Compelling title
- ✅ SEO-optimized meta title (60 chars, includes keyword)
- ✅ Clear meta description (160 chars, includes call-to-action)
- ✅ 5-7 relevant keywords
- ✅ Well-structured content (2000+ words recommended)
- ✅ Clear excerpt/summary
- ✅ No typos or grammar errors

### Publish a Blog

1. Go to blog editor page
   - Click "Edit" on blog card OR
   - On blog detail page, click "Edit Post"

2. Review all content
   - Check title and keywords
   - Verify meta tags are SEO-friendly
   - Proofread content

3. Save draft (optional)
   - Click "Save Draft" to save changes without publishing
   - Shows "Updated successfully" message

4. Publish
   - Click "Publish Now" button
   - Confirm when dialog appears
   - Shows "Published successfully" message
   - Auto-redirects to blogs list after 2 seconds

5. Blog is now live
   - Appears in published section
   - Indexed by search engines
   - Visible to visitors

---

## 📊 Understanding Blog Metadata

### Meta Title (Search Engine Title)

**What It Is**: Title that appears in Google search results

**Example**:
```
Best Dry Cleaning Services in Ottawa | DryJets
```

**SEO Tips**:
- Include primary keyword
- Keep under 60 characters
- Make it compelling/clickable
- Include brand name at end

### Meta Description (Search Snippet)

**What It Is**: Summary appearing under title in search results

**Example**:
```
Find the best dry cleaning services in Ottawa. Same-day service,
professional staff, competitive prices. Get pickup & delivery today!
```

**SEO Tips**:
- Include primary keyword naturally
- Keep under 160 characters
- Include call-to-action ("Get", "Find", "Learn", etc.)
- Unique for each page

### Keywords (SEO Targets)

**What They Are**: Words/phrases you want to rank for

**Example Keywords**:
- "dry cleaning ottawa"
- "laundry pickup service"
- "professional dry cleaners"
- "same day dry cleaning"
- "affordable laundry service"

**SEO Tips**:
- Target 5-7 keywords per blog
- Mix short and long-tail keywords
- Include in content naturally
- Use in headings and first paragraph

---

## 🎯 Best Practices

### Content Quality
- ✅ Write 2000+ word articles (better for SEO)
- ✅ Use clear headings (H2, H3 structure)
- ✅ Include examples and case studies
- ✅ Add internal links to other blogs/pages
- ✅ Make content helpful and actionable

### SEO Optimization
- ✅ Include primary keyword in title
- ✅ Use keyword in meta description
- ✅ Distribute keywords throughout content
- ✅ Use related keywords (semantic search)
- ✅ Optimize images with alt text

### Publishing Strategy
- ✅ Publish 3-7 blogs per week
- ✅ Mix blog topics and themes
- ✅ Target different keywords
- ✅ Create content clusters (related blogs)
- ✅ Repurpose content across platforms

### Post-Publishing
- ✅ Share on social media
- ✅ Repurpose content (create variations)
- ✅ Monitor search rankings
- ✅ Update blogs with new information
- ✅ Build internal links from other blogs

---

## 🔗 Repurposing Content

### What is Repurposing?

Converting one blog into multiple formats:
- Social media posts
- Email newsletters
- Infographics
- Videos
- Podcasts

### How to Repurpose

1. **Publish a blog post** (if not already)

2. **On blog detail page**, click "Repurpose Content"
   - Or go to `/content/repurpose?blogId=[id]`

3. **Choose platforms**:
   - LinkedIn (professional posts)
   - Instagram (visual captions)
   - TikTok (short scripts)
   - Email (newsletter content)

4. **Generate variations**
   - Leo AI creates platform-specific content
   - Each platform gets unique formatting

5. **Review and schedule**
   - Approve generated content
   - Schedule posting times
   - Publish manually or auto-schedule

---

## 📈 Monitoring Performance

### Check Blog Statistics

**On blog detail page**, sidebar shows:
- **View Count** - How many visitors
- **SERP Rank** - Google ranking position
- **Repurposed** - Times reused as social content
- **Word Count** - Total article length
- **Keywords** - Number tracked

### Track Rankings

**Coming Week 4:**
- SEO metrics dashboard
- Google Search Console integration
- Weekly ranking reports
- Performance trends

---

## 🆘 Troubleshooting

### Blog Won't Generate

**Problem**: "Generating..." spinner keeps spinning

**Solutions**:
1. Check internet connection
2. Verify API is running (`npm run dev` for backend)
3. Check ANTHROPIC_API_KEY is set in .env
4. Wait longer (sometimes takes 30+ seconds)
5. Refresh page and try again

### Blog Disappears After Publish

**Problem**: Published blog not visible in list

**Solutions**:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Refresh page (Ctrl+R)
3. Check if published (look for PUBLISHED badge)
4. Try different filter status

### Meta Tags Not Saving

**Problem**: Character limit reached

**Solutions**:
- Meta Title: Max 60 characters (currently showing count)
- Meta Description: Max 160 characters (currently showing count)
- Remove extra characters and save again

### Can't Edit Published Blog

**Solution**: All blogs are editable at any time
- Click "Edit" on blog card
- Make changes
- Click "Save Draft" to save without re-publishing
- Changes take effect immediately

---

## 🎓 Learning Resources

### SEO Best Practices
- [Google Search Central](https://developers.google.com/search)
- [SEO Starter Guide](https://developers.google.com/search/docs/beginner/seo-starter-guide)
- [Meta Tags Guide](https://web.dev/learn-web-vitals/#best-practices)

### Content Writing
- [Copywriting Tips](https://www.copyblogger.com/)
- [Content Outline Structure](https://moz.com/blog/content-pyramid)
- [Keyword Research](https://ahrefs.com/blog/keyword-research/)

---

## 📋 Content Checklist

Before publishing, verify:

- [ ] Title is compelling and includes keyword
- [ ] Meta title is under 60 characters
- [ ] Meta description is under 160 characters
- [ ] Includes 5-7 relevant keywords
- [ ] Content is 2000+ words
- [ ] Content is well-structured with headings
- [ ] No spelling or grammar errors
- [ ] Includes internal links
- [ ] Includes clear call-to-action
- [ ] Images have alt text
- [ ] Mobile-friendly formatting

---

## 🚀 Next Steps

1. **This Week**: Generate your first blog post
2. **Next Week**: Add SEO tracking and analytics
3. **Week After**: Repurpose content to social media
4. **Month 2**: Build library of 40+ ranked keywords

---

## 💡 Pro Tips

1. **Generate multiple blogs** at once during slow periods
2. **Edit and refine** AI-generated content to match your voice
3. **Track keywords** that start ranking (they're working!)
4. **Repurpose immediately** after publishing
5. **Link strategically** between related blogs
6. **Monitor search trends** and create timely content

---

**Happy blogging! 🚀**

For questions or issues, check the dashboard documentation or contact support.

# AI Workflow Note

## AI Tools Used

### 1. Qwen Code (Primary)
**Usage:** Main coding assistant for this project

**Where AI helped:**
- Generating boilerplate code for API routes
- Creating the database schema SQL
- Writing the React component structure
- Setting up Jest configuration
- Drafting documentation files

### 2. AI-Assisted Patterns
**Code generation that was used:**
- SQLite helper functions in `lib/db.ts`
- API route handlers with consistent error handling
- TypeScript type definitions
- CSS utility class patterns

## Where AI Materially Sped Up Work

### High Impact
1. **Database Schema Design** - AI quickly generated the SQL schema with proper foreign keys and constraints
2. **API Route Templates** - Consistent pattern across all endpoints (GET/POST/PUT/DELETE)
3. **Test File Structure** - Jest setup and test cases for database operations
4. **Documentation Drafts** - README and Architecture note structure

### Medium Impact
1. **TypeScript Types** - Interface definitions for User, Document, Share
2. **Error Handling Patterns** - Consistent try/catch with user-friendly messages
3. **CSS Class Naming** - Tailwind utility class suggestions

## AI-Generated Output Modified or Rejected

### Modified
1. **Initial Editor Implementation** - AI suggested using a library (TipTap), but I chose native `contentEditable` to:
   - Reduce dependencies
   - Demonstrate understanding of browser APIs
   - Keep bundle size small

2. **Authentication Flow** - AI suggested JWT tokens, but I simplified to localStorage because:
   - This is a demo with seeded users
   - Reduces complexity for reviewers
   - Focus on document features, not auth

3. **File Upload Handling** - AI suggested cloud storage (S3), but I used local file storage because:
   - No external service dependencies
   - Easier for reviewers to run locally
   - Fits the SQLite local-first approach

### Rejected
1. **Real-time Collaboration Suggestion** - AI suggested implementing WebSockets with Socket.io
   - **Reason:** Out of scope for 4-6 hour timebox
   - **Decision:** Documented as "what's next" instead

2. **Complex Permission System** - AI suggested role-based access control (RBAC)
   - **Reason:** Over-engineered for demo
   - **Decision:** Simple read permission suffices

3. **Document Versioning** - AI suggested full version history
   - **Reason:** Significant complexity increase
   - **Decision:** Listed as stretch goal

## How I Verified Correctness

### Code Quality
1. **TypeScript Compilation** - Ensured no type errors
2. **ESLint** - Ran linting to catch common issues
3. **Manual Code Review** - Reviewed all AI-generated code for:
   - Security issues (SQL injection, XSS)
   - Logic errors
   - Edge cases

### Functional Testing
1. **Unit Tests** - Wrote Jest tests for database operations
2. **Manual Testing Flow:**
   - Login as Alice → Create document → Edit → Save
   - Upload .txt file → Verify content imported
   - Share with Bob → Login as Bob → Verify document appears
   - Remove share → Verify document disappears

### UX Verification
1. **Visual Inspection** - Checked UI renders correctly
2. **Interaction Testing** - Verified all buttons work
3. **Error States** - Tested invalid inputs show errors
4. **Persistence** - Refreshed browser to verify data persists

## AI Usage Summary

| Task | AI Contribution | Human Review |
|------|-----------------|--------------|
| Project Setup | High | Verified all configs |
| Database Schema | High | Adjusted for simplicity |
| API Routes | High | Added validation |
| Frontend UI | Medium | Customized styling |
| Rich Text Editor | Low | Chose native API |
| Tests | Medium | Added assertions |
| Documentation | High | Edited for clarity |

## Lessons Learned

1. **AI is excellent for boilerplate** - Saved significant time on repetitive code
2. **Human judgment is critical** - AI suggestions need scope evaluation
3. **Verification is non-negotiable** - All AI code was reviewed and tested
4. **AI helps with documentation** - First drafts were AI-generated, then refined

## Conclusion

AI tools accelerated development significantly, particularly for boilerplate code, database operations, and documentation. However, key architectural decisions (native contentEditable, localStorage auth, local file storage) were human choices that prioritized simplicity and demo-ability over AI-suggested complexity. The result is a focused, working prototype that demonstrates core competencies without over-engineering.

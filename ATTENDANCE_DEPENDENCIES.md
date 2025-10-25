# Attendance Tracking System - Dependencies

## Required Dependencies

### New Dependency to Install

**date-fns** - Modern JavaScript date utility library

```bash
npm install date-fns
```

**Version**: Latest (4.x or higher recommended)

### Why date-fns?

The attendance system uses `date-fns` for:

1. **Date Formatting**: Display dates in user-friendly formats
   ```typescript
   format(new Date(), 'dd MMM yyyy') // "24 Oct 2024"
   format(new Date(), 'HH:mm:ss')    // "14:30:45"
   ```

2. **Date Calculations**: Calculate date ranges for filters
   ```typescript
   startOfWeek(new Date())  // First day of current week
   endOfMonth(new Date())   // Last day of current month
   subDays(new Date(), 7)   // 7 days ago
   ```

3. **Date Manipulation**: Handle complex date operations
   ```typescript
   startOfMonth(subMonths(new Date(), 1)) // First day of last month
   ```

### Files Using date-fns

1. `src/components/common/time-display.tsx`
   - TimeDisplay component
   - DateDisplay component
   - DurationDisplay component

2. `src/app/(dashboard)/employee-attendance/_components/attendance-clock-in-out.tsx`
   - Real-time clock display
   - Date formatting for UI

3. `src/app/(dashboard)/employee-attendance/history/_components/attendance-history.tsx`
   - Date range filtering
   - History date calculations
   - CSV export formatting

4. `src/app/(dashboard)/admin/attendance/_components/form-attendance.tsx`
   - Form date/time handling
   - Default value formatting

5. `src/app/(dashboard)/admin/attendance/reports/_components/attendance-reports.tsx`
   - Monthly report date handling
   - Report period calculations
   - CSV export formatting

## Existing Dependencies Used

These are already in package.json - no action needed:

### Core Framework
- **next**: ^15.5.3
- **react**: ^19.0.0
- **react-dom**: ^19.0.0
- **typescript**: ^5

### UI Components
- **@radix-ui/react-dialog**: Dialog modals
- **@radix-ui/react-select**: Dropdown selects
- **@radix-ui/react-label**: Form labels
- **lucide-react**: Icons

### State Management
- **@tanstack/react-query**: Data fetching and caching
- **zustand**: Global state (for auth)

### Forms & Validation
- **react-hook-form**: Form handling (existing components)
- **zod**: Schema validation
- **@hookform/resolvers**: Form validation integration

### Database
- **@supabase/supabase-js**: Database client
- **@supabase/ssr**: Server-side rendering support

### Utilities
- **clsx**: Conditional classnames
- **tailwind-merge**: Tailwind class merging
- **class-variance-authority**: Component variants
- **sonner**: Toast notifications

## Installation Commands

### Quick Install
```bash
# Install only the new dependency
npm install date-fns
```

### Full Install (if starting fresh)
```bash
# Install all dependencies
npm install

# Then add date-fns
npm install date-fns
```

### Verify Installation
```bash
# Check package.json
cat package.json | grep date-fns

# Expected output:
# "date-fns": "^4.x.x"

# Or check node_modules
ls node_modules | grep date-fns

# Expected: date-fns directory exists
```

## Alternative: Using Other Date Libraries

If you prefer a different date library, you'll need to:

1. **dayjs** (smaller bundle size):
   ```bash
   npm install dayjs
   ```
   - Update all `date-fns` imports to `dayjs`
   - Adjust format strings (different syntax)

2. **moment** (legacy, not recommended):
   ```bash
   npm install moment
   ```
   - Larger bundle size
   - Not recommended for new projects

3. **luxon** (better timezone support):
   ```bash
   npm install luxon
   ```
   - Better for apps with complex timezone needs

**Recommendation**: Stick with `date-fns` - it's modern, tree-shakeable, and has excellent TypeScript support.

## Bundle Size Impact

Adding `date-fns`:
- **Uncompressed**: ~300KB
- **Gzipped**: ~20KB (only functions you use)
- **Tree-shakeable**: Yes - only imports what you use

Example usage (only these functions imported):
```typescript
import { format, startOfWeek, endOfWeek } from 'date-fns';
```

## TypeScript Support

`date-fns` has excellent TypeScript support:
- Built-in type definitions
- No need for @types/date-fns
- Fully typed function signatures

Example:
```typescript
import { format } from 'date-fns';

// TypeScript knows the return type is string
const formatted: string = format(new Date(), 'yyyy-MM-dd');
```

## Common date-fns Functions Used

### Formatting
```typescript
format(date, 'yyyy-MM-dd')        // "2024-10-24"
format(date, 'dd MMM yyyy')       // "24 Oct 2024"
format(date, 'HH:mm:ss')          // "14:30:45"
format(date, 'EEEE, dd MMMM yyyy') // "Thursday, 24 October 2024"
```

### Date Calculations
```typescript
startOfWeek(date, { weekStartsOn: 1 })  // Monday of current week
endOfWeek(date, { weekStartsOn: 1 })    // Sunday of current week
startOfMonth(date)                       // First day of month
endOfMonth(date)                         // Last day of month
subDays(date, 7)                         // 7 days ago
subWeeks(date, 1)                        // 1 week ago
subMonths(date, 1)                       // 1 month ago
```

### Comparisons
```typescript
isAfter(date1, date2)   // true if date1 > date2
isBefore(date1, date2)  // true if date1 < date2
isEqual(date1, date2)   // true if dates equal
```

## Troubleshooting

### Error: "Cannot find module 'date-fns'"

**Solution**:
```bash
npm install date-fns
# or
yarn add date-fns
```

### Error: "Module not found: Can't resolve 'date-fns/locale'"

**Solution**: Update import if using locales:
```typescript
// Correct
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

// Incorrect
import { enUS } from 'date-fns/locale/en-US';
```

### TypeScript Errors with date-fns

**Solution**: Make sure TypeScript is configured:
```json
// tsconfig.json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "esModuleInterop": true
  }
}
```

## Version Compatibility

| Package | Minimum Version | Recommended |
|---------|----------------|-------------|
| date-fns | 2.0.0 | 4.x.x |
| next | 15.0.0 | 15.5.3 |
| react | 19.0.0 | 19.0.0 |
| typescript | 5.0.0 | 5.x.x |

## Migration from Other Libraries

### From moment to date-fns

```typescript
// moment
moment().format('YYYY-MM-DD')
moment().subtract(7, 'days')
moment().startOf('month')

// date-fns
format(new Date(), 'yyyy-MM-dd')
subDays(new Date(), 7)
startOfMonth(new Date())
```

### From dayjs to date-fns

```typescript
// dayjs
dayjs().format('YYYY-MM-DD')
dayjs().subtract(7, 'day')
dayjs().startOf('month')

// date-fns
format(new Date(), 'yyyy-MM-dd')
subDays(new Date(), 7)
startOfMonth(new Date())
```

## Performance Considerations

date-fns is optimized for performance:

1. **Tree-shaking**: Only imports what you use
2. **Pure functions**: No mutations, easier to optimize
3. **Lightweight**: Each function is small and focused
4. **No prototype pollution**: Safe and predictable

## Further Reading

- [date-fns Documentation](https://date-fns.org/)
- [date-fns Format Cheatsheet](https://date-fns.org/docs/format)
- [date-fns vs moment vs dayjs](https://blog.logrocket.com/javascript-date-libraries/)

---

**Installation Time**: < 1 minute
**Impact**: Low (only adds ~20KB gzipped to bundle)
**Difficulty**: Easy - just `npm install date-fns`

---

Ready to proceed? Run:
```bash
npm install date-fns && npm run dev
```

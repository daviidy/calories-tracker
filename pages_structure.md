# Application Pages Structure

## 1. Authentication Pages

### 1.1 Login Page (`/login`)
- Google sign-in button
- Brand logo and welcome message
- Brief app description
- Terms of service and privacy policy links

### 1.2 Registration Success (`/register/success`)
- Welcome message
- Quick start guide
- Initial setup prompts (e.g., setting calorie goals)

## 2. Main Dashboard (`/dashboard`)

### 2.1 Overview Dashboard (`/`)
- Today's calorie summary
  - Calories consumed
  - Calories burned
  - Net calories
  - Progress towards goal
- Active challenges summary
- Quick entry forms
- Today's challenge tasks
- Weekly progress chart
- Streak information

## 3. Calories Management

### 3.1 Calorie Log (`/calories`)
- Daily log entries
- Add/edit entry form
- Daily summary
- Detailed breakdown of entries
- Filter and search capabilities

### 3.2 Calorie Goals (`/calories/goals`)
- Current goal settings
- Goal history
- Goal adjustment form
- Progress analysis

## 4. Challenge Management

### 4.1 Challenges Overview (`/challenges`)
- List of active challenges
- Completed challenges
- Challenge creation button
- Filter by challenge type
- Search functionality

### 4.2 Challenge Details (`/challenges/[id]`)
- Challenge information
- Progress tracking
- Entry logging
- Historical entries
- Notes and comments
- Progress visualization

### 4.3 Create/Edit Challenge (`/challenges/new`, `/challenges/[id]/edit`)
- Challenge creation form
- Type selection
- Date range picker
- Entry type configuration
- Frequency settings

## 5. Analysis & Reports

### 5.1 Calendar View (`/calendar`)
- Monthly calendar with daily status
- Yearly overview (GitHub-style)
- Entry quick-view
- Day selection for detailed view

### 5.2 Reports (`/reports`)
- Custom date range selection
- Multiple visualization options
- Data export tools
- Progress summaries
- Trend analysis

## 6. User Settings

### 6.1 Profile Settings (`/settings`)
- Personal information
- Notification preferences
- Goal preferences
- Theme settings
- Privacy settings

### 6.2 Data Management (`/settings/data`)
- Data export options
- Account deletion
- Privacy controls
- Data retention settings

## 7. Error Pages

### 7.1 404 Not Found (`/404`)
- Custom 404 error page
- Navigation suggestions
- Search functionality

### 7.2 500 Server Error (`/500`)
- Error message
- Refresh option
- Contact support

## 8. Feature Specific Modals
(These aren't separate pages but important UI components)
- Quick entry modal
- Challenge entry modal
- Goal adjustment modal
- Confirmation dialogs
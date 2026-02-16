# US-F004: Group Management

## Feature
F004 — Group Management

## Priority
critical

## User Story
As an admin, I want to manage training groups so that athletes are organized by category and level.

## Optimal Path
1. Log in as admin
2. Navigate to Groups page
3. See the list of all 17 groups with their details
4. Click "New Group" to create a group
5. Fill in form: name, coach, gender (M/F), level (base/medium/pro), training day, time slot
6. Save the group
7. Assign athletes to the group from the athlete list
8. See the updated group with its roster

## Edge Cases
- Duplicate group name: Show validation error, prevent creation
- Assign athlete already in another group: Show warning with option to move (with log) or cancel
- Move athlete between groups: Log the move with timestamp and admin ID
- Remove athlete from group: Athlete's group assignment cleared, removal logged
- Group at max capacity: Show warning when adding athletes beyond max_athletes limit

## Acceptance Criteria
- [ ] Admin can create, read, update, and delete groups
- [ ] Admin can assign athletes to a group
- [ ] Admin can remove athletes from a group
- [ ] Moving an athlete between groups is logged with timestamp
- [ ] Athletes can view their own group assignment (read only)
- [ ] All 17 groups are seeded on initial setup

## Test Notes
Coaches include: Matteo Bosso, Elena Colombi, and others per club data. Levels: base, medium, pro. Training days: Monday through Friday. Time slots: 18:30-20:00 and 20:00-21:30. max_athletes is a group-level field. Move log stored in a group_changes or audit_log table.

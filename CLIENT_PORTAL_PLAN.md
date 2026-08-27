# SITEVL Client Portal Plan

## Status

Architecture proposal only. The current website does not expose a client portal, does not create accounts, and does not send portal data to a backend.

## Purpose

The portal can become a private workspace for an agreed project. It should make the current state visible without replacing direct communication with the specialist.

## Proposed areas

1. **Authentication**
   - Invite-only access.
   - Email magic link or another agreed provider.
   - Server-side session validation.
   - No privileged keys in the browser.

2. **Project overview**
   - Project name and agreed scope.
   - Current roadmap step: idea, structure, design, development, testing, publication.
   - Confirmed dates and responsible participant.
   - Status history with timestamps.

3. **Files and versions**
   - Requirements, source materials and approved deliverables.
   - Explicit file ownership and access rules.
   - Version history instead of silent replacement.
   - Signed or short-lived download URLs for private files.

4. **Comments and tasks**
   - Comments attached to a project, task, file or version.
   - Open, in progress, review and completed states.
   - Notifications are queued by the backend and never block saving the comment.

5. **Staging preview**
   - Link to a protected preview environment.
   - The client can choose a device frame and inspect a specific version.
   - Production and staging remain separate deployments.

6. **Visual annotations**
   - Annotation references a stable page URL, viewport, version and normalized x/y coordinates.
   - The screenshot is optional evidence, not the source of truth.
   - Resolved annotations remain in history.
   - Personal data and private screenshots use protected storage.

## Suggested entities

- `users`
- `clients`
- `projects`
- `project_members`
- `project_status_history`
- `project_files`
- `project_versions`
- `tasks`
- `comments`
- `annotations`
- `notification_events`

## Access model

- A client can read only projects where they are a member.
- The specialist can manage assigned projects.
- File storage follows the same membership rule as the related project.
- Every mutation is validated by the backend; UI visibility is not authorization.
- Administrative credentials and service-role secrets never reach Vite environment variables.

## Delivery stages

1. Freeze the data contract and access rules.
2. Add authentication and a read-only project overview.
3. Add files and version history.
4. Add tasks and comments.
5. Add staging preview and annotations.
6. Add bounded notifications and an audit trail.
7. Perform access, mobile, recovery and production security testing.

## Out of scope for the current SITEVL Experience update

- Real authentication.
- Client records.
- File uploads.
- Backend mutations.
- Email or messenger notifications.
- Production deployment.


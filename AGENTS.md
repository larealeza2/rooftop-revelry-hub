<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Public website integration

- Guest-facing surfaces (the booking page, the embed panels, everything under
  `/api/public/*`) must work with no signed-in admin. Give them narrow anonymous
  database policies instead of privileged access, and validate plus throttle every
  unauthenticated write inside its own handler.
  Why: the restaurant's own website carries no session, and an open write path is
  otherwise a spam and data-exposure hole.
- Keep guest-submitted bookings insert-only and forced to the pending state at the
  database level, never readable, editable or deletable by an anonymous visitor.
  Why: a booking carries a phone number, which is personal data.
- The embed panels are iframed into third-party pages. Any message a panel sends to
  its host page must be checked against the frame that sent it, and must carry only
  presentation numbers such as a height.
  Why: one host page can hold several panels, and an unscoped listener lets one panel
  resize or spoof another.

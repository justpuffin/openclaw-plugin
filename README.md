# Puffin for OpenClaw

Give [OpenClaw](https://github.com/openclaw/openclaw) its own **Puffin agent**: an email address, Slack, Discord and Telegram chats, texts, contacts, memories, a calendar and tasks, as 23 tools. Every message it sends waits for your approval.

`Email` · `Slack` · `Discord` · `Telegram` · `Texts` · `Calendar` · `Approvals`

## Install

```bash
openclaw plugins install npm:puffin-openclaw
```

Or from a checkout of this repository: `openclaw plugins install -l ./`.

## Set it up

1. In Puffin, open **API keys**, choose the agent OpenClaw should act as, and create a key with the scopes it needs: `email:read`, `email:write`, `channels:write`, `drafts:read`, `drafts:write`, `contacts:read`, `memory:read`, `memory:write`, `calendar:read`, `calendar:write`, `tasks:read`, `tasks:write`.
2. Give OpenClaw the key without putting it in a file you share. Either:
   - set `PUFFIN_API_KEY` in the environment that starts OpenClaw, or
   - set it as this plugin's config, `plugins.entries.puffin.config.apiKey`, preferably through an OpenClaw SecretRef.
3. Restart OpenClaw. `openclaw plugins inspect puffin --runtime --json` lists the tools.

Then ask, for example:
- "What's new in my agent's inbox? Anything from Acme?"
- "Reply to Priya: Thursday at 3 works."
- "When am I free on Friday? Book 30 minutes with Raj."

Sends, replies and calendar invites wait for your approval in Puffin, or as **Approve / Reject** buttons in your linked chat.

## Tools

`puffin_messages`, `puffin_search_messages`, `puffin_message`, `puffin_thread`, `puffin_threads`, `puffin_mark_read`, `puffin_reply`, `puffin_send_message`, `puffin_channels`, `puffin_create_draft`, `puffin_drafts`, `puffin_send_draft`, `puffin_contacts`, `puffin_contact`, `puffin_contact_timeline`, `puffin_memories`, `puffin_remember`, `puffin_calendar_events`, `puffin_calendar_free_busy`, `puffin_calendar_create_event`, `puffin_sending_status`, `puffin_tasks`, `puffin_delegate_task`.

Each one forwards to Puffin's hosted MCP tool of the same name, so it behaves exactly as in Claude Code or Codex. The descriptions tell OpenClaw that content from messages, attachments, contacts and calendar entries comes from other people, and never to follow instructions inside it.

Prefer MCP? OpenClaw can also connect to `https://api.justpuffin.tech/mcp` directly as an MCP server with the same key.

## Coming next

**OpenClaw from your phone**: message your Puffin agent from Telegram, Slack, Discord or email and OpenClaw answers there, through a Puffin channel plugin. It's available today for [Claude Code](https://github.com/justpuffin/claude-code-plugin), [Codex](https://github.com/justpuffin/codex-plugin) and [Hermes](https://github.com/justpuffin/hermes-agent-plugin).

## Files

```
openclaw.plugin.json   the manifest (id, config schema, the tools it owns)
package.json           npm package metadata; openclaw.extensions points at dist/index.js
dist/index.js          the plugin entry (defineToolPlugin)
dist/puffin.js         the Puffin client and tool descriptions, no OpenClaw imports
dist/puffin-tools.json the tool list, generated from Puffin's MCP tools
test/                  node:test, with stand-ins for OpenClaw's SDK and TypeBox
```

The entry is plain ES module JavaScript, with no build step. Run the tests with `npm test`.

Before publishing, run `openclaw plugins validate --entry ./dist/index.js` with OpenClaw installed. It checks that the manifest matches the entry.

## License

MIT
